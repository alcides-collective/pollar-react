import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAIStore, useAIMessages, useAILoading } from '../stores/aiStore';
import { API_BASE } from '../config/api';
import type { SSEEvent, AIEventSource } from '../types/ai';
import {
  sanitizeLinks,
  preFormatMarkdown,
  tokenizeContent,
} from '../utils/ai-helpers';
import { trackAIRateLimitReached } from '../lib/analytics';

// Get or create visitor ID for rate limiting
function getVisitorId(): string {
  const key = 'pollar-visitor-id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

interface UseAICompanionOptions {
  language?: 'pl' | 'en' | 'de';
  onAnimationStart?: (messageId: string, totalWords: number) => void;
}

export function useAICompanion(options: UseAICompanionOptions = {}) {
  const { language = 'pl', onAnimationStart } = options;
  const { t } = useTranslation('common');
  const abortControllerRef = useRef<AbortController | null>(null);

  // Get messages from current conversation
  const messages = useAIMessages();
  const isLoading = useAILoading();

  const {
    isStreaming,
    addMessage,
    setLoading,
    setStreaming,
    setError,
    setRemainingQueries,
    addDebugStep,
    clearDebugSteps,
    setFollowUps,
    setSuggestions,
    startGenerationTimer,
    stopGenerationTimer,
    setCurrentStatus,
  } = useAIStore();

  /**
   * Check remaining queries status
   */
  const checkStatus = useCallback(async () => {
    try {
      const visitorId = getVisitorId();
      const response = await fetch(`${API_BASE}/companion/status`, {
        headers: { 'X-Visitor-Id': visitorId },
      });
      if (response.ok) {
        const data = await response.json();
        setRemainingQueries(data.remaining);
      }
    } catch {
      // Silently fail - status check is not critical
    }
  }, [setRemainingQueries]);

  /**
   * Fetch suggestions from API (language-aware)
   */
  const fetchSuggestions = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/assistant/suggestions?language=${language}`);
      if (response.ok) {
        const data = await response.json();
        if (data.suggestions?.length >= 4) {
          setSuggestions(data.suggestions);
        }
      }
    } catch {
      // Keep default suggestions
    }
  }, [setSuggestions, language]);

  /**
   * Send message to AI companion
   */
  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim() || isLoading) return;

      // Abort any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // Add user message
      addMessage({ role: 'user', content: userMessage.trim() });

      // Reset state
      setLoading(true);
      setStreaming(false);
      setError(null);
      clearDebugSteps();
      setFollowUps([]);
      setCurrentStatus(null);
      startGenerationTimer();

      try {
        const visitorId = getVisitorId();
        const historyForRequest = messages.slice(-8);

        const response = await fetch(`${API_BASE}/companion`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Visitor-Id': visitorId,
          },
          body: JSON.stringify({
            message: userMessage.trim(),
            history: historyForRequest,
            language,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || t('aiErrors.errorOccurred'));
        }

        const contentType = response.headers.get('content-type') || '';
        let rawContent = '';
        let sources: AIEventSource[] = [];

        if (contentType.includes('text/event-stream')) {
          // SSE streaming response
          setStreaming(true);
          const reader = response.body?.getReader();
          if (!reader) throw new Error(t('aiErrors.noResponse'));

          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed: SSEEvent = JSON.parse(data);

                  if (parsed.status) {
                    setCurrentStatus(parsed.status);
                  }
                  if (parsed.debug) {
                    addDebugStep(parsed.debug);
                  }
                  if (parsed.content) {
                    rawContent += parsed.content;
                  }
                  if (parsed.sources) {
                    sources = parsed.sources;
                  }
                  if (parsed.remaining !== undefined) {
                    setRemainingQueries(parsed.remaining);
                    if (parsed.remaining === 0) {
                      trackAIRateLimitReached({ remaining: 0 });
                    }
                  }
                  if (parsed.follow_ups) {
                    setFollowUps(parsed.follow_ups);
                  }
                } catch {
                  // Skip unparseable chunks
                }
              }
            }
          }
        } else {
          // JSON response (no results case)
          const data = await response.json();
          rawContent = data.content;
          sources = data.sources || [];
          if (data.remaining !== undefined) {
            setRemainingQueries(data.remaining);
          }
          if (data.debug && Array.isArray(data.debug)) {
            data.debug.forEach(addDebugStep);
          }
          if (data.follow_ups && Array.isArray(data.follow_ups)) {
            setFollowUps(data.follow_ups);
          }
        }

        // Stop timer and get generation time
        const generationTimeMs = stopGenerationTimer();

        // Process and add assistant message
        const sanitizedContent = sanitizeLinks(rawContent);
        const formattedContent = preFormatMarkdown(sanitizedContent);

        const messageId = addMessage({
          role: 'assistant',
          content: formattedContent,
          sources,
          generationTimeMs: generationTimeMs ?? undefined,
        });

        // Calculate word count for animation
        const tokenCount = tokenizeContent(sanitizedContent).length;

        // Trigger animation callback
        if (onAnimationStart) {
          onAnimationStart(messageId, tokenCount);
        }
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') {
          // Request was aborted, ignore
          return;
        }

        let errorMsg = t('aiErrors.errorOccurred');
        if (e instanceof Error) {
          errorMsg = e.message;
          if (e.message === 'Failed to fetch') {
            errorMsg = t('aiErrors.cannotConnect');
          }
        }
        console.error('[AICompanion] Error:', e);
        setError(errorMsg);
      } finally {
        setLoading(false);
        setStreaming(false);
      }
    },
    [
      messages,
      isLoading,
      language,
      addMessage,
      setLoading,
      setStreaming,
      setError,
      setRemainingQueries,
      addDebugStep,
      clearDebugSteps,
      setFollowUps,
      setCurrentStatus,
      startGenerationTimer,
      stopGenerationTimer,
      onAnimationStart,
    ]
  );

  /**
   * Cancel ongoing request
   */
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
      setStreaming(false);
    }
  }, [setLoading, setStreaming]);

  return {
    sendMessage,
    checkStatus,
    fetchSuggestions,
    cancelRequest,
    isLoading,
    isStreaming,
  };
}
