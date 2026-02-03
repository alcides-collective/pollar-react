import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AIMessage, AIEventSource, DebugStep } from '../types/ai';
import { generateMessageId, DEFAULT_SUGGESTIONS } from '../utils/ai-helpers';

interface AIState {
  // Messages (persisted)
  messages: AIMessage[];

  // UI State
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;

  // Animation State
  animatingMessageId: string | null;
  visibleWordCount: number;

  // Rate Limiting
  remainingQueries: number;

  // Debug (dev mode)
  debugSteps: DebugStep[];

  // Follow-ups
  followUps: string[];

  // Suggestions
  suggestions: string[];
}

interface AIActions {
  // Message Actions
  addMessage: (
    message: Omit<AIMessage, 'id' | 'timestamp'>
  ) => string;
  updateLastMessage: (content: string, sources?: AIEventSource[]) => void;
  clearMessages: () => void;

  // UI Actions
  setLoading: (loading: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  setError: (error: string | null) => void;

  // Animation Actions
  startWordAnimation: (messageId: string) => void;
  incrementWordCount: () => void;
  stopWordAnimation: () => void;

  // Rate Limit Actions
  setRemainingQueries: (remaining: number) => void;

  // Debug Actions
  addDebugStep: (step: DebugStep) => void;
  clearDebugSteps: () => void;

  // Follow-up Actions
  setFollowUps: (followUps: string[]) => void;

  // Suggestion Actions
  setSuggestions: (suggestions: string[]) => void;

  // Reset for new conversation
  resetConversation: () => void;
}

type AIStore = AIState & AIActions;

export const useAIStore = create<AIStore>()(
  persist(
    (set) => ({
      // Initial State
      messages: [],
      isLoading: false,
      isStreaming: false,
      error: null,
      animatingMessageId: null,
      visibleWordCount: 0,
      remainingQueries: 20,
      debugSteps: [],
      followUps: [],
      suggestions: DEFAULT_SUGGESTIONS,

      // Message Actions
      addMessage: (message) => {
        const id = generateMessageId();
        const newMessage: AIMessage = {
          ...message,
          id,
          timestamp: Date.now(),
        };
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
        return id;
      },

      updateLastMessage: (content, sources) => {
        set((state) => {
          const messages = [...state.messages];
          const lastIndex = messages.length - 1;
          if (lastIndex >= 0 && messages[lastIndex].role === 'assistant') {
            messages[lastIndex] = {
              ...messages[lastIndex],
              content,
              sources: sources || messages[lastIndex].sources,
            };
          }
          return { messages };
        });
      },

      clearMessages: () => {
        set({
          messages: [],
          debugSteps: [],
          followUps: [],
          error: null,
        });
      },

      // UI Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setStreaming: (streaming) => set({ isStreaming: streaming }),
      setError: (error) => set({ error }),

      // Animation Actions
      startWordAnimation: (messageId) => {
        set({
          animatingMessageId: messageId,
          visibleWordCount: 1,
        });
      },

      incrementWordCount: () => {
        set((state) => ({
          visibleWordCount: state.visibleWordCount + 1,
        }));
      },

      stopWordAnimation: () => {
        set({
          animatingMessageId: null,
          visibleWordCount: 0,
        });
      },

      // Rate Limit Actions
      setRemainingQueries: (remaining) => set({ remainingQueries: remaining }),

      // Debug Actions
      addDebugStep: (step) => {
        set((state) => ({
          debugSteps: [...state.debugSteps, step],
        }));
      },

      clearDebugSteps: () => set({ debugSteps: [] }),

      // Follow-up Actions
      setFollowUps: (followUps) => set({ followUps }),

      // Suggestion Actions
      setSuggestions: (suggestions) => set({ suggestions }),

      // Reset for new conversation
      resetConversation: () => {
        set({
          messages: [],
          debugSteps: [],
          followUps: [],
          error: null,
          isLoading: false,
          isStreaming: false,
          animatingMessageId: null,
          visibleWordCount: 0,
        });
      },
    }),
    {
      name: 'pollar-ai-messages',
      // Only persist messages
      partialize: (state) => ({
        messages: state.messages,
      }),
    }
  )
);

// Convenience hooks for selectors
export function useAIMessages() {
  return useAIStore((state) => state.messages);
}

export function useAILoading() {
  return useAIStore((state) => state.isLoading);
}

export function useAIStreaming() {
  return useAIStore((state) => state.isStreaming);
}

export function useAIError() {
  return useAIStore((state) => state.error);
}

export function useAIRemainingQueries() {
  return useAIStore((state) => state.remainingQueries);
}

export function useAIDebugSteps() {
  return useAIStore((state) => state.debugSteps);
}

export function useAIFollowUps() {
  return useAIStore((state) => state.followUps);
}

export function useAISuggestions() {
  return useAIStore((state) => state.suggestions);
}

export function useAIAnimatingMessageId() {
  return useAIStore((state) => state.animatingMessageId);
}

export function useAIVisibleWordCount() {
  return useAIStore((state) => state.visibleWordCount);
}
