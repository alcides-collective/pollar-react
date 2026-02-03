import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AIMessage, AIEventSource, DebugStep } from '../types/ai';
import { generateMessageId, DEFAULT_SUGGESTIONS } from '../utils/ai-helpers';

// Stable empty array for selectors
const EMPTY_MESSAGES: AIMessage[] = [];

// Generate conversation ID
function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// Generate title from first message
function generateTitle(message: string): string {
  const maxLen = 30;
  const cleaned = message.trim().replace(/\s+/g, ' ');
  if (cleaned.length <= maxLen) return cleaned;
  return cleaned.slice(0, maxLen).trim() + '...';
}

export interface Conversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: number;
  updatedAt: number;
}

interface AIState {
  // Conversations (persisted)
  conversations: Conversation[];
  currentConversationId: string | null;

  // UI State
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  sidebarOpen: boolean;

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
  // Conversation Actions
  createConversation: () => string;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;

  // Message Actions
  addMessage: (message: Omit<AIMessage, 'id' | 'timestamp'>) => string;
  updateLastMessage: (content: string, sources?: AIEventSource[]) => void;
  clearMessages: () => void;

  // UI Actions
  setLoading: (loading: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  setError: (error: string | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

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
      conversations: [],
      currentConversationId: null,
      isLoading: false,
      isStreaming: false,
      error: null,
      sidebarOpen: true,
      animatingMessageId: null,
      visibleWordCount: 0,
      remainingQueries: import.meta.env.DEV ? 9999 : 20,
      debugSteps: [],
      followUps: [],
      suggestions: DEFAULT_SUGGESTIONS,

      // Conversation Actions
      createConversation: () => {
        const id = generateConversationId();
        const newConversation: Conversation = {
          id,
          title: 'Nowa rozmowa',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: id,
          debugSteps: [],
          followUps: [],
          error: null,
        }));
        return id;
      },

      selectConversation: (id) => {
        set({
          currentConversationId: id,
          debugSteps: [],
          followUps: [],
          error: null,
          isLoading: false,
          isStreaming: false,
        });
      },

      deleteConversation: (id) => {
        set((state) => {
          const filtered = state.conversations.filter((c) => c.id !== id);
          const newCurrentId =
            state.currentConversationId === id
              ? filtered[0]?.id || null
              : state.currentConversationId;
          return {
            conversations: filtered,
            currentConversationId: newCurrentId,
          };
        });
      },

      renameConversation: (id, title) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, title, updatedAt: Date.now() } : c
          ),
        }));
      },

      // Message Actions
      addMessage: (message) => {
        const id = generateMessageId();
        const newMessage: AIMessage = {
          ...message,
          id,
          timestamp: Date.now(),
        };

        set((state) => {
          let { currentConversationId, conversations } = state;

          // If no conversation, create one
          if (!currentConversationId) {
            const convId = generateConversationId();
            const newConv: Conversation = {
              id: convId,
              title: message.role === 'user' ? generateTitle(message.content) : 'Nowa rozmowa',
              messages: [newMessage],
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            return {
              conversations: [newConv, ...conversations],
              currentConversationId: convId,
            };
          }

          // Add to existing conversation
          return {
            conversations: conversations.map((c) => {
              if (c.id !== currentConversationId) return c;
              const updated = {
                ...c,
                messages: [...c.messages, newMessage],
                updatedAt: Date.now(),
              };
              // Update title from first user message
              if (c.messages.length === 0 && message.role === 'user') {
                updated.title = generateTitle(message.content);
              }
              return updated;
            }),
          };
        });

        return id;
      },

      updateLastMessage: (content, sources) => {
        set((state) => {
          const { currentConversationId, conversations } = state;
          if (!currentConversationId) return state;

          return {
            conversations: conversations.map((c) => {
              if (c.id !== currentConversationId) return c;
              const messages = [...c.messages];
              const lastIndex = messages.length - 1;
              if (lastIndex >= 0 && messages[lastIndex].role === 'assistant') {
                messages[lastIndex] = {
                  ...messages[lastIndex],
                  content,
                  sources: sources || messages[lastIndex].sources,
                };
              }
              return { ...c, messages, updatedAt: Date.now() };
            }),
          };
        });
      },

      clearMessages: () => {
        set((state) => {
          const { currentConversationId, conversations } = state;
          if (!currentConversationId) return state;

          return {
            conversations: conversations.map((c) =>
              c.id === currentConversationId
                ? { ...c, messages: [], updatedAt: Date.now() }
                : c
            ),
            debugSteps: [],
            followUps: [],
            error: null,
          };
        });
      },

      // UI Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setStreaming: (streaming) => set({ isStreaming: streaming }),
      setError: (error) => set({ error }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

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

      // Rate Limit Actions - ignore in dev mode
      setRemainingQueries: (remaining) => {
        if (import.meta.env.DEV) return;
        set({ remainingQueries: remaining });
      },

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

      // Reset for new conversation (creates new one)
      resetConversation: () => {
        const id = generateConversationId();
        const newConversation: Conversation = {
          id,
          title: 'Nowa rozmowa',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: id,
          debugSteps: [],
          followUps: [],
          error: null,
          isLoading: false,
          isStreaming: false,
          animatingMessageId: null,
          visibleWordCount: 0,
        }));
      },
    }),
    {
      name: 'pollar-ai-store',
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

// Get current conversation's messages
export function useAIMessages(): AIMessage[] {
  return useAIStore((state) => {
    const conv = state.conversations.find((c) => c.id === state.currentConversationId);
    return conv?.messages ?? EMPTY_MESSAGES;
  });
}

// Get all conversations
export function useAIConversations() {
  return useAIStore((state) => state.conversations);
}

// Get current conversation ID
export function useAICurrentConversationId() {
  return useAIStore((state) => state.currentConversationId);
}

// Convenience hooks for selectors
export function useAILoading() {
  return useAIStore((state) => state.isLoading);
}

export function useAIStreaming() {
  return useAIStore((state) => state.isStreaming);
}

export function useAIError() {
  return useAIStore((state) => state.error);
}

export function useAISidebarOpen() {
  return useAIStore((state) => state.sidebarOpen);
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
