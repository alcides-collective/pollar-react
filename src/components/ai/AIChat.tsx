import { useEffect, useRef, useCallback } from 'react';
import { AIHeader } from './AIHeader';
import { AIMessageList } from './AIMessageList';
import { AIInput } from './AIInput';
import { AIDebugPanel } from './AIDebugPanel';
import { useAICompanion } from '../../hooks/useAICompanion';
import { useWordAnimation } from '../../hooks/useWordAnimation';
import { useAIError, useAIStore, useAIMessages } from '../../stores/aiStore';
import { useRouteLanguage } from '../../hooks/useRouteLanguage';
import { trackAIMessageSent, trackAISuggestionClicked, trackAIConversationStarted } from '../../lib/analytics';

interface AIChatProps {
  variant?: 'page' | 'modal';
  onClose?: () => void;
  showHeader?: boolean;
}

export function AIChat({ variant = 'page', showHeader = true }: AIChatProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const error = useAIError();
  const setError = useAIStore((s) => s.setError);
  const messages = useAIMessages();
  const language = useRouteLanguage();

  // Scroll helper
  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, []);

  // Word animation hook
  const { animateMessage } = useWordAnimation({
    onScrollToBottom: scrollToBottom,
    isUserAtBottom: true,
  });

  // AI companion hook - pass current language for multi-language support
  const { sendMessage, checkStatus, fetchSuggestions } = useAICompanion({
    language,
    onAnimationStart: animateMessage,
  });

  // Fetch status and suggestions on mount
  useEffect(() => {
    checkStatus();
    fetchSuggestions();
  }, [checkStatus, fetchSuggestions]);

  // Handle sending message
  const handleSend = useCallback(
    (message: string) => {
      if (messages.length === 0) {
        trackAIConversationStarted({ language });
      }
      trackAIMessageSent({ message_length: message.length, is_suggestion: false, language });
      sendMessage(message);
      // Scroll to bottom after sending
      setTimeout(scrollToBottom, 50);
    },
    [sendMessage, scrollToBottom, messages.length, language]
  );

  // Handle suggestion click
  const handleSuggestionSelect = useCallback(
    (suggestion: string, index?: number) => {
      if (messages.length === 0) {
        trackAIConversationStarted({ language });
      }
      trackAIMessageSent({ message_length: suggestion.length, is_suggestion: true, language });
      trackAISuggestionClicked({ suggestion_text: suggestion.slice(0, 100), position: index ?? 0 });
      handleSend(suggestion);
    },
    [handleSend, messages.length, language]
  );

  // Dismiss error on click
  const handleDismissError = useCallback(() => {
    setError(null);
  }, [setError]);

  return (
    <div className="flex flex-col h-full bg-background dark:bg-zinc-950">
      {/* Header */}
      {showHeader && <AIHeader />}

      {/* Messages area - scrollable with centered content */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto min-h-0"
      >
        <div className="max-w-3xl mx-auto w-full h-full">
          <AIMessageList
            onSuggestionSelect={handleSuggestionSelect}
            scrollContainerRef={scrollContainerRef}
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          onClick={handleDismissError}
          className="px-4 py-3 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400
                     text-sm text-center cursor-pointer shrink-0 animate-fade-in"
        >
          {error}
        </div>
      )}

      {/* Debug panel (dev mode only) */}
      <AIDebugPanel />

      {/* Input area - fixed at bottom, centered */}
      <div className="max-w-3xl mx-auto w-full">
        <AIInput onSend={handleSend} autoFocus={variant === 'page'} />
      </div>
    </div>
  );
}
