import { create } from 'zustand';
import {
  addToReadHistory,
  getReadHistory,
  getReadEventIds,
  clearReadHistory,
} from '@/services/readHistoryService';
import type { ReadHistoryEntry } from '@/types/auth';

// ============ Types ============

interface ReadHistoryState {
  readEventIds: Set<string>;
  recentlyRead: ReadHistoryEntry[];
  isLoading: boolean;
  error: string | null;
}

interface ReadHistoryActions {
  // Fetch
  fetchReadHistory: (uid: string) => Promise<void>;
  fetchReadEventIds: (uid: string) => Promise<void>;

  // Actions
  markAsRead: (uid: string, eventId: string) => Promise<void>;
  clearHistory: (uid: string) => Promise<void>;

  // Helpers
  isEventRead: (eventId: string) => boolean;
  clearStore: () => void;
}

type ReadHistoryStore = ReadHistoryState & ReadHistoryActions;

// ============ Store ============

export const useReadHistoryStore = create<ReadHistoryStore>((set, get) => ({
  // Initial State
  readEventIds: new Set(),
  recentlyRead: [],
  isLoading: false,
  error: null,

  // Fetch full history
  fetchReadHistory: async (uid) => {
    set({ isLoading: true, error: null });
    try {
      const history = await getReadHistory(uid, 50);
      const ids = new Set(history.map((h) => h.eventId));
      set({
        recentlyRead: history,
        readEventIds: ids,
      });
    } catch (error) {
      set({ error: 'Nie udało się pobrać historii czytania' });
      console.error('Error fetching read history:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch only IDs (lighter)
  fetchReadEventIds: async (uid) => {
    try {
      const ids = await getReadEventIds(uid);
      set({ readEventIds: new Set(ids) });
    } catch (error) {
      console.error('Error fetching read event IDs:', error);
    }
  },

  // Mark event as read
  markAsRead: async (uid, eventId) => {
    const { readEventIds } = get();

    // Skip if already read
    if (readEventIds.has(eventId)) return;

    // Optimistic update
    const newIds = new Set(readEventIds);
    newIds.add(eventId);
    set({ readEventIds: newIds });

    try {
      await addToReadHistory(uid, eventId);
    } catch (error) {
      // Revert on error
      newIds.delete(eventId);
      set({ readEventIds: newIds });
      console.error('Error marking event as read:', error);
    }
  },

  // Clear all history
  clearHistory: async (uid) => {
    set({ isLoading: true, error: null });
    try {
      await clearReadHistory(uid);
      set({
        readEventIds: new Set(),
        recentlyRead: [],
      });
    } catch (error) {
      set({ error: 'Nie udało się wyczyścić historii' });
      console.error('Error clearing read history:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Check if event is read
  isEventRead: (eventId) => {
    return get().readEventIds.has(eventId);
  },

  // Clear store (on logout)
  clearStore: () => {
    set({
      readEventIds: new Set(),
      recentlyRead: [],
      error: null,
    });
  },
}));

// ============ Convenience Hooks ============

export function useReadEventIds() {
  return useReadHistoryStore((state) => state.readEventIds);
}

export function useRecentlyRead() {
  return useReadHistoryStore((state) => state.recentlyRead);
}

export function useIsEventRead(eventId: string) {
  return useReadHistoryStore((state) => state.readEventIds.has(eventId));
}

export function useReadHistoryLoading() {
  return useReadHistoryStore((state) => state.isLoading);
}
