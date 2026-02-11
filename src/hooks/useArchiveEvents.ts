import { useEffect, useMemo, useCallback, useRef } from 'react';
import { useEventsStore } from '../stores/eventsStore';
import { sanitizeEvent } from '../utils/sanitize';
import { showBackendErrorToast } from '../utils/backendToast';
import { CATEGORY_ORDER } from '../constants/categories';
import type { Language } from '../stores/languageStore';
import { useRouteLanguage } from './useRouteLanguage';
import type { Event } from '../types/events';

const ARCHIVE_API_BASE = 'https://pollar-backend-production.up.railway.app/api';

interface UseArchiveEventsOptions {
  limit?: number;
  lang?: Language;
}

interface CategoryGroup {
  category: string;
  events: Event[];
}

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

export function useArchiveEvents(options: UseArchiveEventsOptions = {}) {
  const storeLanguage = useRouteLanguage();
  const { limit = 200 } = options;
  const lang = options.lang ?? storeLanguage;

  const cache = useEventsStore((s) => s.cache);
  const loading = useEventsStore((s) => s.loading);
  const errors = useEventsStore((s) => s.errors);
  const fetchEvents = useEventsStore((s) => s.fetchEvents);
  const fetchingKeys = useEventsStore((s) => s.fetchingKeys);

  const { archiveUrl, cacheKey, plArchiveUrl, plCacheKey } = useMemo(() => {
    const searchParams = new URLSearchParams();
    searchParams.set('limit', String(limit));
    searchParams.set('lang', lang);
    searchParams.set('includeArticles', 'false');
    const archiveUrl = `${ARCHIVE_API_BASE}/archive?${searchParams.toString()}`;

    // Polish version for lead comparison (non-PL only)
    const plParams = new URLSearchParams();
    plParams.set('limit', String(limit));
    plParams.set('lang', 'pl');
    plParams.set('includeArticles', 'false');
    const plArchiveUrl = `${ARCHIVE_API_BASE}/archive?${plParams.toString()}`;

    return {
      archiveUrl,
      cacheKey: `archive:${archiveUrl}`,
      plArchiveUrl,
      plCacheKey: `archive:${plArchiveUrl}`,
    };
  }, [limit, lang]);

  const fetchArchiveFn = useCallback(async (): Promise<Event[]> => {
    const response = await fetch(archiveUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    const items: any[] = json.data ?? [];
    return items.map(item => sanitizeEvent(mapArchiveEvent(item)));
  }, [archiveUrl]);

  const fetchPlArchiveFn = useCallback(async (): Promise<Event[]> => {
    const response = await fetch(plArchiveUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const json = await response.json();
    const items: any[] = json.data ?? [];
    return items.map(item => sanitizeEvent(mapArchiveEvent(item)));
  }, [plArchiveUrl]);

  const cached = cache[cacheKey];
  const CACHE_TTL = 5 * 60 * 1000;
  const isFresh = cached ? (Date.now() - cached.timestamp) < CACHE_TTL : false;
  const rawEvents = cached?.data ?? [];
  const loadingState = loading[cacheKey] ?? false;
  const error = errors[cacheKey] ?? null;
  const isFetching = fetchingKeys.has(cacheKey);

  // Polish archive for lead comparison
  const plCached = cache[plCacheKey];
  const plIsFresh = plCached ? (Date.now() - plCached.timestamp) < CACHE_TTL : false;
  const plEvents = plCached?.data ?? [];
  const plLoading = loading[plCacheKey] ?? false;
  const plIsFetching = fetchingKeys.has(plCacheKey);

  const fetchInitiatedRef = useRef<string | null>(null);
  const plFetchInitiatedRef = useRef<string | null>(null);

  useEffect(() => {
    const shouldFetch = !isFresh && !loadingState && !isFetching;
    if (shouldFetch && fetchInitiatedRef.current !== cacheKey) {
      fetchInitiatedRef.current = cacheKey;
      fetchEvents(cacheKey, fetchArchiveFn);
    }
  }, [cacheKey, isFresh, loadingState, isFetching, fetchEvents, fetchArchiveFn]);

  // Fetch Polish archive for comparison (non-PL only)
  useEffect(() => {
    if (lang === 'pl') return;
    const shouldFetch = !plIsFresh && !plLoading && !plIsFetching;
    if (shouldFetch && plFetchInitiatedRef.current !== plCacheKey) {
      plFetchInitiatedRef.current = plCacheKey;
      fetchEvents(plCacheKey, fetchPlArchiveFn);
    }
  }, [lang, plCacheKey, plIsFresh, plLoading, plIsFetching, fetchEvents, fetchPlArchiveFn]);

  // Toast on archive backend error
  useEffect(() => {
    showBackendErrorToast('archive', error);
  }, [error]);

  // Filter untranslated events by comparing leads with Polish version
  const events = useMemo(() => {
    if (lang === 'pl' || plEvents.length === 0) return rawEvents;
    const plLeadById = new Map(plEvents.map(e => [e.id, e.lead]));
    return rawEvents.filter(e => {
      const plLead = plLeadById.get(e.id);
      return !plLead || plLead !== e.lead;
    });
  }, [rawEvents, plEvents, lang]);

  // Grupowanie eventow po kategoriach
  const groupedByCategory = useMemo((): CategoryGroup[] => {
    const grouped = new Map<string, Event[]>();

    // Inicjalizacja kategorii z CATEGORY_ORDER
    CATEGORY_ORDER.forEach((cat) => grouped.set(cat, []));

    // Grupowanie eventow
    events.forEach((event) => {
      const category = event.category || 'Inne';
      if (grouped.has(category)) {
        grouped.get(category)!.push(event);
      } else {
        // Kategoria spoza CATEGORY_ORDER - dodaj ją
        grouped.set(category, [event]);
      }
    });

    // Konwersja do tablicy w kolejnosci CATEGORY_ORDER, tylko niepuste
    return CATEGORY_ORDER
      .map((category) => ({
        category,
        events: (grouped.get(category) || []).sort(
          (a, b) => (b.sources?.length || 0) - (a.sources?.length || 0)
        ),
      }))
      .filter((group) => group.events.length > 0);
  }, [events]);

  return {
    events,
    groupedByCategory,
    loading: loadingState || (!isFresh && !error && events.length === 0),
    error,
  };
}
