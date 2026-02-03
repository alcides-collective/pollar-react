import { useEffect, useMemo, useCallback, useRef } from 'react';
import { useEventsStore } from '../stores/eventsStore';
import { API_BASE } from '../config/api';
import { sanitizeEvent } from '../utils/sanitize';
import { CATEGORY_ORDER } from '../constants/categories';
import type { Event, EventsResponse } from '../types/events';

interface UseArchiveEventsOptions {
  limit?: number;
  lang?: string;
}

interface CategoryGroup {
  category: string;
  events: Event[];
}

export function useArchiveEvents(options: UseArchiveEventsOptions = {}) {
  const { limit = 200, lang = 'pl' } = options;

  const cache = useEventsStore((s) => s.cache);
  const loading = useEventsStore((s) => s.loading);
  const errors = useEventsStore((s) => s.errors);
  const fetchEvents = useEventsStore((s) => s.fetchEvents);
  const fetchingKeys = useEventsStore((s) => s.fetchingKeys);

  const { archiveUrl, cacheKey } = useMemo(() => {
    const searchParams = new URLSearchParams();
    searchParams.set('limit', String(limit));
    searchParams.set('lang', lang);
    const archiveUrl = `${API_BASE}/events/archive?${searchParams.toString()}`;
    return { archiveUrl, cacheKey: `archive:${archiveUrl}` };
  }, [limit, lang]);

  const fetchArchiveFn = useCallback(async (): Promise<Event[]> => {
    const response = await fetch(archiveUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: EventsResponse = await response.json();
    return data.data.map(sanitizeEvent);
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
