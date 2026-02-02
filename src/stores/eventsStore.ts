import { create } from 'zustand';
import type { Event, EventsResponse } from '../types/events';
import { API_BASE, apiConfig } from '../config/api';

const CACHE_TTL = apiConfig.cacheTTL;

// HTML entity decoding
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&rdquo;': '"',
    '&ldquo;': '"',
    '&bdquo;': '„',
    '&quot;': '"',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&nbsp;': ' ',
    '&ndash;': '–',
    '&mdash;': '—',
    '&hellip;': '…',
    '&apos;': "'",
    '&lsquo;': '\u2018',
    '&rsquo;': '\u2019',
  };

  let result = text;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replaceAll(entity, char);
  }
  return result;
}

function sanitizeEvent(event: Event): Event {
  return {
    ...event,
    title: decodeHtmlEntities(event.title),
    lead: decodeHtmlEntities(event.lead),
    summary: decodeHtmlEntities(event.summary),
  };
}

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
}));

// Hook for fetching events (similar to old useEvents)
interface UseEventsOptions {
  limit?: number;
  lang?: string;
  includeArchive?: boolean;
  category?: string;
}

export function useEvents(params: UseEventsOptions = {}) {
  const { fetchEvents, getEventsFromCache } = useEventsStore();

  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.lang) searchParams.set('lang', params.lang);
  if (params.category) searchParams.set('category', params.category);

  const url = `${API_BASE}/events?${searchParams.toString()}`;
  const cacheKey = `${url}:archive=${params.includeArchive ?? false}`;

  const fetchEventsFn = async (): Promise<Event[]> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData: EventsResponse = await response.json();
    let allEvents = responseData.data.map(sanitizeEvent);

    if (params.includeArchive) {
      const archiveUrl = url.replace('/events?', '/events/archive?');
      const archiveResponse = await fetch(archiveUrl);
      if (archiveResponse.ok) {
        const archiveData: EventsResponse = await archiveResponse.json();
        allEvents = [...allEvents, ...archiveData.data.map(sanitizeEvent)];
      }
    }

    return allEvents;
  };

  const { events, loading, error, isFresh } = getEventsFromCache(cacheKey);

  // Trigger fetch if not fresh and not already fetching
  if (!isFresh && !loading) {
    fetchEvents(cacheKey, fetchEventsFn);
  }

  return { events, loading: loading || (!isFresh && events.length === 0), error };
}
