import { create } from 'zustand';
import { useEffect, useMemo, useCallback, useRef } from 'react';
import type { Event, EventsResponse } from '../types/events';
import { API_BASE, apiConfig } from '../config/api';
import { sanitizeEvent } from '../utils/sanitize';
import { useUserStore } from './userStore';
import { useLanguageStore, useLanguage, type Language } from './languageStore';

const CACHE_TTL = apiConfig.cacheTTL;

// Production archive backend (supports category filtering)
const PRODUCTION_ARCHIVE_BASE = 'https://pollar-backend-production.up.railway.app/api';

/** Map pollar-backend /api/archive response item to frontend Event shape */
function mapArchiveEvent(raw: any): Event {
  return {
    id: raw.id,
    title: raw.title ?? '',
    lead: raw.lead ?? '',
    summary: raw.summary ?? '',
    createdAt: raw.originalCreatedAt ?? raw.archivedAt,
    updatedAt: raw.originalUpdatedAt ?? raw.archivedAt,
    lastContentUpdate: raw.originalUpdatedAt ?? raw.archivedAt,
    lastSummarizationComplete: raw.archivedAt,
    imageUrl: raw.metadata?.imageUrl ?? '',
    category: raw.category ?? raw.metadata?.category ?? 'Inne',
    sources: raw.sources ?? raw.metadata?.sources ?? [],
    trendingScore: raw.metadata?.trendingScore ?? 0,
    articleCount: raw.articleCount ?? raw.metadata?.articleCount ?? 0,
    sourceCount: raw.sources?.length ?? raw.metadata?.sourceCount ?? 0,
    viewCount: raw.metadata?.viewCount ?? 0,
    freshnessLevel: 'OLD',
    metadata: {
      category: raw.category ?? raw.metadata?.category ?? 'Inne',
      trending: false,
      trendingScore: raw.metadata?.trendingScore ?? 0,
      location: raw.location ?? raw.metadata?.location,
      locations: raw.metadata?.locations ?? [],
      keyPoints: raw.keyPoints ?? raw.metadata?.keyPoints ?? [],
      mentionedPeople: raw.metadata?.mentionedPeople ?? [],
      mentionedCountries: raw.metadata?.mentionedCountries ?? [],
      shortHeadline: raw.metadata?.shortHeadline ?? '',
      ultraShortHeadline: raw.metadata?.ultraShortHeadline ?? '',
      sources: raw.sources ?? raw.metadata?.sources ?? [],
      articleCount: raw.articleCount ?? 0,
      sourceCount: raw.sources?.length ?? 0,
      imageAttribution: raw.metadata?.imageAttribution ?? null,
      isLowQualityContent: raw.metadata?.isLowQualityContent ?? false,
      viewCount: raw.metadata?.viewCount ?? 0,
    },
    articles: raw.articles,
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
  /** IDs of events that are "new" (highlight in UI) */
  newEventIds: Set<string>;
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
  upsertEvent: (event: Partial<Event> & { id: string }, isNew?: boolean) => void;
  /** Mark an event as "seen" (remove from newEventIds) */
  markEventAsSeen: (eventId: string) => void;
  /** Clear all new event markers */
  clearNewEvents: () => void;
}

type EventsStore = EventsState & EventsActions;

export const useEventsStore = create<EventsStore>((set, get) => ({
  // State
  cache: {},
  loading: {},
  errors: {},
  fetchingKeys: new Set(),
  newEventIds: new Set(),

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

  upsertEvent: (partialEvent: Partial<Event> & { id: string }, isNew = false) => {
    set((state) => {
      const newCache = { ...state.cache };
      let newEventIds = state.newEventIds;

      // If this is a new event, add to newEventIds (for highlight)
      if (isNew) {
        newEventIds = new Set(state.newEventIds);
        newEventIds.add(partialEvent.id);
      }

      // Update event in all cache entries
      // IMPORTANT: Only UPDATE existing events, don't ADD new ones!
      // SSE uses different ordering (updatedAt) than API (trendingScore),
      // so adding new events would create "ghost" entries that disappear on refresh
      const currentLang = useLanguageStore.getState().language;
      Object.keys(newCache).forEach((key) => {
        const entry = newCache[key];
        if (!entry?.data) return;

        const existingIndex = entry.data.findIndex((e) => e.id === partialEvent.id);

        if (existingIndex >= 0) {
          // SSE stream sends data in a single language — only overwrite text fields
          // (title, lead) for cache entries matching the current language to avoid
          // replacing translated content with the stream's default language.
          const langMatch = key.includes(`lang=${currentLang}`);
          const { title, lead, ...nonTextFields } = partialEvent;
          const safeUpdate = langMatch ? partialEvent : nonTextFields;

          const updatedEvents = [...entry.data];
          updatedEvents[existingIndex] = {
            ...updatedEvents[existingIndex],
            ...safeUpdate,
            // Ensure updatedAt is a string
            updatedAt: partialEvent.updatedAt || new Date().toISOString(),
          };
          newCache[key] = { ...entry, data: updatedEvents };
        }
        // Don't add new events - they may not be in API results due to different sorting
      });

      return { cache: newCache, newEventIds };
    });
  },

  markEventAsSeen: (eventId: string) => {
    set((state) => {
      const newEventIds = new Set(state.newEventIds);
      newEventIds.delete(eventId);
      return { newEventIds };
    });
  },

  clearNewEvents: () => {
    set({ newEventIds: new Set() });
  },

  prefetchArchive: (params = {}) => {
    const currentLang = useLanguageStore.getState().language;
    const { limit = 100, lang = currentLang } = params;
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
  lang?: Language;
  includeArchive?: boolean;
  category?: string;
  articleFields?: 'minimal' | 'full';
  /** Skip filtering by hidden categories (e.g. for profile page) */
  skipHiddenFilter?: boolean;
}

export function useEvents(params: UseEventsOptions = {}) {
  // Subscribe to store state DIRECTLY to ensure re-renders on cache updates
  const cache = useEventsStore((s) => s.cache);
  const loading = useEventsStore((s) => s.loading);
  const errors = useEventsStore((s) => s.errors);
  const fetchEvents = useEventsStore((s) => s.fetchEvents);
  const prefetchArchive = useEventsStore((s) => s.prefetchArchive);
  const fetchingKeys = useEventsStore((s) => s.fetchingKeys);
  const storeLanguage = useLanguage();
  const lang = params.lang ?? storeLanguage;

  // Memoize URL and cache keys to prevent unnecessary recalculations
  const { url, cacheKey, archiveCacheKey, prodArchiveUrl, prodArchiveCacheKey } = useMemo(() => {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.set('limit', String(params.limit));
    searchParams.set('lang', lang);
    // Don't add category to main API — filtering is client-side in computeEventGroups.
    // Category is only used for the production archive fetch below.

    const url = `${API_BASE}/events?${searchParams.toString()}`;
    const cacheKey = url;

    const archiveSearchParams = new URLSearchParams();
    archiveSearchParams.set('limit', String(params.limit || 100));
    archiveSearchParams.set('lang', lang);
    const archiveUrl = `${API_BASE}/events/archive?${archiveSearchParams.toString()}`;
    const archiveCacheKey = `archive:${archiveUrl}`;

    // Production archive URL (supports category filtering via pollar-backend)
    let prodArchiveUrl = '';
    let prodArchiveCacheKey = '';
    if (params.category) {
      const prodParams = new URLSearchParams();
      prodParams.set('limit', String(params.limit || 100));
      prodParams.set('lang', lang);
      prodParams.set('category', params.category);
      prodParams.set('includeArticles', 'false');
      prodArchiveUrl = `${PRODUCTION_ARCHIVE_BASE}/archive?${prodParams.toString()}`;
      prodArchiveCacheKey = `prod-archive:${prodArchiveUrl}`;
    }

    return { url, cacheKey, archiveCacheKey, prodArchiveUrl, prodArchiveCacheKey };
  }, [params.limit, lang, params.category]);

  // Memoize fetch function with useCallback
  const fetchEventsFn = useCallback(async (): Promise<Event[]> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const responseData: EventsResponse = await response.json();
    return responseData.data.map(sanitizeEvent);
  }, [url]);

  // Get events directly from subscribed cache state
  const cached = cache[cacheKey];
  const now = Date.now();
  const isFresh = cached ? (now - cached.timestamp) < CACHE_TTL : false;
  const events = cached?.data ?? [];
  const loadingState = loading[cacheKey] ?? false;
  const error = errors[cacheKey] ?? null;

  // Archive cache
  const archiveCached = cache[archiveCacheKey];
  const archiveEvents = archiveCached?.data ?? [];
  const archiveLoading = loading[archiveCacheKey] ?? false;
  const archiveError = errors[archiveCacheKey] ?? null;

  // Production archive cache (category-filtered from pollar-backend)
  const prodArchiveCached = prodArchiveCacheKey ? cache[prodArchiveCacheKey] : undefined;
  const prodArchiveEvents = prodArchiveCached?.data ?? [];
  const prodArchiveLoading = prodArchiveCacheKey ? (loading[prodArchiveCacheKey] ?? false) : false;
  const prodArchiveError = prodArchiveCacheKey ? (errors[prodArchiveCacheKey] ?? null) : null;
  const prodArchiveIsFresh = prodArchiveCached ? (now - prodArchiveCached.timestamp) < CACHE_TTL : false;
  const prodArchiveIsFetching = prodArchiveCacheKey ? fetchingKeys.has(prodArchiveCacheKey) : false;

  // Check if currently fetching this key (stable boolean instead of Set comparison)
  const isFetching = fetchingKeys.has(cacheKey);

  // Track if we've initiated fetch to prevent double-fetch in StrictMode
  const fetchInitiatedRef = useRef<string | null>(null);

  // Trigger fetch in useEffect (NOT during render!)
  useEffect(() => {
    const shouldFetch = !isFresh && !loadingState && !isFetching;

    // Only fetch if we haven't already initiated a fetch for this exact cache key
    if (shouldFetch && fetchInitiatedRef.current !== cacheKey) {
      fetchInitiatedRef.current = cacheKey;
      fetchEvents(cacheKey, fetchEventsFn);
    }
  }, [cacheKey, isFresh, loadingState, isFetching, fetchEvents, fetchEventsFn]);

  // Prefetch archive in useEffect after main events load
  useEffect(() => {
    if (isFresh && !params.includeArchive) {
      prefetchArchive({ limit: params.limit, lang });
    }
  }, [isFresh, params.includeArchive, params.limit, lang, prefetchArchive]);

  // Fetch production archive with category filter (pollar-backend supports ?category=)
  const prodFetchInitiatedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!prodArchiveCacheKey) return;
    const shouldFetch = !prodArchiveIsFresh && !prodArchiveLoading && !prodArchiveIsFetching;
    if (shouldFetch && prodFetchInitiatedRef.current !== prodArchiveCacheKey) {
      prodFetchInitiatedRef.current = prodArchiveCacheKey;
      fetchEvents(prodArchiveCacheKey, async () => {
        const response = await fetch(prodArchiveUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const items = Array.isArray(data) ? data : data.data ?? [];
        return items.map(mapArchiveEvent);
      });
    }
  }, [prodArchiveCacheKey, prodArchiveUrl, prodArchiveIsFresh, prodArchiveLoading, prodArchiveIsFetching, fetchEvents]);

  // Combine with archive if requested (memoized)
  const finalEvents = useMemo(() => {
    let combined = events;

    if (params.includeArchive && archiveEvents.length > 0) {
      const eventIds = new Set(combined.map(e => e.id));
      const uniqueArchive = archiveEvents.filter(e => !eventIds.has(e.id));
      combined = [...combined, ...uniqueArchive];
    }

    // Merge production archive events (category-filtered)
    if (prodArchiveEvents.length > 0) {
      const eventIds = new Set(combined.map(e => e.id));
      const uniqueProdArchive = prodArchiveEvents.filter(e => !eventIds.has(e.id));
      combined = [...combined, ...uniqueProdArchive];
    }

    return combined;
  }, [events, archiveEvents, params.includeArchive, prodArchiveEvents]);

  const isLoading = loadingState || (!isFresh && events.length === 0);
  const isArchiveLoading = params.includeArchive && archiveLoading && archiveEvents.length === 0;
  const isProdArchiveLoading = prodArchiveLoading && prodArchiveEvents.length === 0;

  // Filter out hidden categories (only if user is logged in and has hidden categories)
  const hiddenCategories = useUserStore((s) => s.hiddenCategories);
  const filteredEvents = useMemo(() => {
    if (params.skipHiddenFilter || hiddenCategories.length === 0) {
      return finalEvents;
    }
    return finalEvents.filter((event) => !hiddenCategories.includes(event.category));
  }, [finalEvents, hiddenCategories, params.skipHiddenFilter]);

  return {
    events: filteredEvents,
    loading: isLoading || isArchiveLoading || isProdArchiveLoading,
    error: error || archiveError || prodArchiveError
  };
}
