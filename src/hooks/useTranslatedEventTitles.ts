import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../stores/languageStore';
import { API_BASE } from '../config/api';

interface EventTitleData {
  title: string;
  lead?: string;
}

// Global cache for translated event titles (persists across component unmounts)
const titleCache = new Map<string, EventTitleData>();

/**
 * Hook to fetch translated event titles for category alerts.
 * Fetches titles based on current language and caches results.
 */
export function useTranslatedEventTitles(eventIds: string[]) {
  const language = useLanguage();
  const [titles, setTitles] = useState<Record<string, EventTitleData>>({});
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (eventIds.length === 0) return;

    // Filter out already cached or fetched events
    const toFetch = eventIds.filter(id => {
      const cacheKey = `${id}-${language}`;
      return !titleCache.has(cacheKey) && !fetchedRef.current.has(cacheKey);
    });

    if (toFetch.length === 0) {
      // All titles are cached, just update state
      const cached: Record<string, EventTitleData> = {};
      for (const id of eventIds) {
        const cacheKey = `${id}-${language}`;
        const data = titleCache.get(cacheKey);
        if (data) {
          cached[id] = data;
        }
      }
      setTitles(cached);
      return;
    }

    // Mark as being fetched
    toFetch.forEach(id => fetchedRef.current.add(`${id}-${language}`));

    setLoading(true);

    // Fetch events in parallel (limit to 10 concurrent)
    const fetchEvents = async () => {
      const results: Record<string, EventTitleData> = {};

      // Start with cached results
      for (const id of eventIds) {
        const cacheKey = `${id}-${language}`;
        const cached = titleCache.get(cacheKey);
        if (cached) {
          results[id] = cached;
        }
      }

      // Fetch new ones
      await Promise.all(
        toFetch.map(async (eventId) => {
          try {
            const response = await fetch(`${API_BASE}/events/${eventId}?lang=${language}`);
            if (response.ok) {
              const data = await response.json();
              const titleData: EventTitleData = {
                title: data.title || data.metadata?.ultraShortHeadline || '',
                lead: data.lead || data.summary?.substring(0, 150),
              };
              const cacheKey = `${eventId}-${language}`;
              titleCache.set(cacheKey, titleData);
              results[eventId] = titleData;
            }
          } catch (error) {
            // Silently fail - will use fallback title
            console.debug(`Failed to fetch translated title for event ${eventId}:`, error);
          }
        })
      );

      setTitles(results);
      setLoading(false);
    };

    fetchEvents();
  }, [eventIds.join(','), language]);

  return { titles, loading };
}

/**
 * Simple hook to get a single translated event title.
 * Returns the translated title or fallback while loading.
 */
export function useTranslatedEventTitle(
  eventId: string | undefined,
  fallbackTitle: string,
  fallbackLead?: string
): { title: string; lead?: string; loading: boolean } {
  const { titles, loading } = useTranslatedEventTitles(eventId ? [eventId] : []);

  if (!eventId) {
    return { title: fallbackTitle, lead: fallbackLead, loading: false };
  }

  const translated = titles[eventId];
  return {
    title: translated?.title || fallbackTitle,
    lead: translated?.lead || fallbackLead,
    loading,
  };
}

/**
 * Clear the title cache (useful when language changes globally)
 */
export function clearTitleCache() {
  titleCache.clear();
}
