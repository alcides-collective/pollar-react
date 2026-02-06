import { useEffect, useMemo, useCallback, useRef } from 'react';
import { useEventsStore } from '../stores/eventsStore';
import { sanitizeEvent } from '../utils/sanitize';
import { CATEGORY_ORDER } from '../constants/categories';
import { useLanguage, type Language } from '../stores/languageStore';
import type { Event } from '../types/events';

const ARCHIVE_API_BASE = import.meta.env.DEV
  ? '/api'  // Vite proxy in development
  : 'https://pollar-backend-production.up.railway.app/api';

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
  const storeLanguage = useLanguage();
  const { limit = 200 } = options;
  const lang = options.lang ?? storeLanguage;

  const cache = useEventsStore((s) => s.cache);
  const loading = useEventsStore((s) => s.loading);
  const errors = useEventsStore((s) => s.errors);
  const fetchEvents = useEventsStore((s) => s.fetchEvents);
  const fetchingKeys = useEventsStore((s) => s.fetchingKeys);

  const { archiveUrl, cacheKey } = useMemo(() => {
    const searchParams = new URLSearchParams();
    searchParams.set('limit', String(limit));
    searchParams.set('lang', lang);
    searchParams.set('includeArticles', 'true');
    const archiveUrl = `${ARCHIVE_API_BASE}/archive?${searchParams.toString()}`;
    return { archiveUrl, cacheKey: `archive:${archiveUrl}` };
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

  const cached = cache[cacheKey];
  const CACHE_TTL = 5 * 60 * 1000;
  const isFresh = cached ? (Date.now() - cached.timestamp) < CACHE_TTL : false;
  const events = cached?.data ?? [];
  const loadingState = loading[cacheKey] ?? false;
  const error = errors[cacheKey] ?? null;
  const isFetching = fetchingKeys.has(cacheKey);

  const fetchInitiatedRef = useRef<string | null>(null);

  useEffect(() => {
    const shouldFetch = !isFresh && !loadingState && !isFetching;
    if (shouldFetch && fetchInitiatedRef.current !== cacheKey) {
      fetchInitiatedRef.current = cacheKey;
      fetchEvents(cacheKey, fetchArchiveFn);
    }
  }, [cacheKey, isFresh, loadingState, isFetching, fetchEvents, fetchArchiveFn]);

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
        events: grouped.get(category) || [],
      }))
      .filter((group) => group.events.length > 0);
  }, [events]);

  return {
    events,
    groupedByCategory,
    loading: loadingState || (!isFresh && events.length === 0),
    error,
  };
}
