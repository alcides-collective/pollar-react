import { create } from 'zustand';
import type { Event, EventsResponse } from '../types/events';
import { API_BASE, apiConfig } from '../config/api';
import { sanitizeEvent } from '../utils/sanitize';
import { useUserStore } from './userStore';

const CACHE_TTL = apiConfig.cacheTTL;

// Types
interface CacheEntry {
  data: Event[];
  timestamp: number;
}

interface EventsState {
  cache: Record<string, CacheEntry>;
  loading: Record<string, boolean>;
  errors: Record<string, Error | null>;
  fetchingKeys: Set<string>;
}

interface EventsActions {
  fetchEvents: (key: string, fetchFn: () => Promise<Event[]>) => void;
  getEventsFromCache: (key: string) => {
    events: Event[];
    loading: boolean;
    error: Error | null;
    isFresh: boolean;
  };
  clearCache: (key?: string) => void;
  prefetchArchive: (params?: { limit?: number; lang?: string }) => void;
  /** Upsert a single event into all caches (for real-time SSE updates) */
  upsertEvent: (event: Partial<Event> & { id: string }) => void;
}

type EventsStore = EventsState & EventsActions;

export const useEventsStore = create<EventsStore>((set, get) => ({
  // State
  cache: {},
  loading: {},
  errors: {},
  fetchingKeys: new Set(),

  // Actions
  fetchEvents: async (key: string, fetchFn: () => Promise<Event[]>) => {
    const state = get();

    // Already fetching this key
    if (state.fetchingKeys.has(key)) {
      return;
    }

    // Mark as fetching
    set((state) => ({
      fetchingKeys: new Set([...state.fetchingKeys, key]),
      loading: { ...state.loading, [key]: true },
    }));

    try {
      const data = await fetchFn();
      set((state) => ({
        cache: {
          ...state.cache,
          [key]: { data, timestamp: Date.now() },
        },
        errors: { ...state.errors, [key]: null },
      }));
    } catch (err) {
      set((state) => ({
        errors: { ...state.errors, [key]: err as Error },
      }));
    } finally {
      set((state) => {
        const newFetchingKeys = new Set(state.fetchingKeys);
        newFetchingKeys.delete(key);
        return {
          fetchingKeys: newFetchingKeys,
          loading: { ...state.loading, [key]: false },
        };
      });
    }
  },

  getEventsFromCache: (key: string) => {
    const state = get();
    const cached = state.cache[key];
    const now = Date.now();
    const isFresh = cached ? (now - cached.timestamp) < CACHE_TTL : false;

    return {
      events: cached?.data ?? [],
      loading: state.loading[key] ?? false,
      error: state.errors[key] ?? null,
      isFresh,
    };
  },

  clearCache: (key?: string) => {
    if (key) {
      set((state) => {
        const newCache = { ...state.cache };
        delete newCache[key];
        return { cache: newCache };
      });
    } else {
      set({ cache: {} });
    }
  },

  upsertEvent: (partialEvent: Partial<Event> & { id: string }) => {
    set((state) => {
      const newCache = { ...state.cache };

      // Update event in all cache entries
      Object.keys(newCache).forEach((key) => {
        const entry = newCache[key];
        if (!entry?.data) return;

        const existingIndex = entry.data.findIndex((e) => e.id === partialEvent.id);

        if (existingIndex >= 0) {
          // Update existing event
          const updatedEvents = [...entry.data];
          updatedEvents[existingIndex] = {
            ...updatedEvents[existingIndex],
            ...partialEvent,
            // Ensure updatedAt is a string
            updatedAt: partialEvent.updatedAt || new Date().toISOString(),
          };
          newCache[key] = { ...entry, data: updatedEvents };
        } else {
          // Add new event at the beginning (it's the newest)
          const newEvent: Event = {
            id: partialEvent.id,
            title: partialEvent.title || '',
            lead: partialEvent.lead,
            category: partialEvent.category || 'inne',
            imageUrl: partialEvent.imageUrl,
            updatedAt: partialEvent.updatedAt || new Date().toISOString(),
            createdAt: partialEvent.createdAt || new Date().toISOString(),
            sourceCount: partialEvent.sourceCount || 0,
            articleCount: partialEvent.articleCount || 0,
            trendingScore: partialEvent.trendingScore || 0,
            viewCount: partialEvent.viewCount || 0,
            metadata: partialEvent.metadata || {},
          } as Event;
          newCache[key] = { ...entry, data: [newEvent, ...entry.data] };
        }
      });

      return { cache: newCache };
    });
  },

  prefetchArchive: (params = {}) => {
    const { limit = 100, lang = 'pl' } = params;
    const searchParams = new URLSearchParams();
    searchParams.set('limit', String(limit));
    searchParams.set('lang', lang);

    const archiveUrl = `${API_BASE}/events/archive?${searchParams.toString()}`;
    const cacheKey = `archive:${archiveUrl}`;

    const state = get();
    const cached = state.cache[cacheKey];
    const isFresh = cached ? (Date.now() - cached.timestamp) < CACHE_TTL : false;

    // Skip if already fresh or fetching
    if (isFresh || state.fetchingKeys.has(cacheKey)) {
      return;
    }

    // Fetch archive in background
    get().fetchEvents(cacheKey, async () => {
      const response = await fetch(archiveUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: EventsResponse = await response.json();
      return data.data.map(sanitizeEvent);
    });
  },
}));

// Hook for fetching events (similar to old useEvents)
interface UseEventsOptions {
  limit?: number;
  lang?: string;
  includeArchive?: boolean;
  category?: string;
  articleFields?: 'minimal' | 'full';
  /** Skip filtering by hidden categories (e.g. for profile page) */
  skipHiddenFilter?: boolean;
}

export function useEvents(params: UseEventsOptions = {}) {
  const { fetchEvents, getEventsFromCache, prefetchArchive } = useEventsStore();

  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.lang) searchParams.set('lang', params.lang);
  if (params.category) searchParams.set('category', params.category);

  const url = `${API_BASE}/events?${searchParams.toString()}`;
  const cacheKey = url; // Simplified key - archive handled separately

  // Archive cache key
  const archiveSearchParams = new URLSearchParams();
  archiveSearchParams.set('limit', String(params.limit || 100));
  archiveSearchParams.set('lang', params.lang || 'pl');
  const archiveUrl = `${API_BASE}/events/archive?${archiveSearchParams.toString()}`;
  const archiveCacheKey = `archive:${archiveUrl}`;

  const fetchEventsFn = async (): Promise<Event[]> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData: EventsResponse = await response.json();
    return responseData.data.map(sanitizeEvent);
  };

  const { events, loading, error, isFresh } = getEventsFromCache(cacheKey);
  const archiveCache = getEventsFromCache(archiveCacheKey);

  // Trigger fetch if not fresh and not already fetching
  if (!isFresh && !loading) {
    fetchEvents(cacheKey, fetchEventsFn);
  }

  // Prefetch archive in background after main events load
  if (isFresh && !params.includeArchive) {
    prefetchArchive({ limit: params.limit, lang: params.lang });
  }

  // Combine with archive if requested
  let finalEvents = events;
  if (params.includeArchive && archiveCache.events.length > 0) {
    // Dedupe by id
    const eventIds = new Set(events.map(e => e.id));
    const uniqueArchive = archiveCache.events.filter(e => !eventIds.has(e.id));
    finalEvents = [...events, ...uniqueArchive];
  }

  const isLoading = loading || (!isFresh && events.length === 0);
  const archiveLoading = params.includeArchive && archiveCache.loading && archiveCache.events.length === 0;

  // Filter out hidden categories (only if user is logged in and has hidden categories)
  const hiddenCategories = useUserStore((s) => s.hiddenCategories);
  const filteredEvents = params.skipHiddenFilter || hiddenCategories.length === 0
    ? finalEvents
    : finalEvents.filter((event) => !hiddenCategories.includes(event.category));

  return {
    events: filteredEvents,
    loading: isLoading || archiveLoading,
    error: error || archiveCache.error
  };
}
