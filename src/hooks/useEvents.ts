import { useState, useEffect } from 'react';
import type { Event, EventsParams, EventsResponse } from '../types/events';

const API_BASE = 'https://pollar.news/api';

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
    '&lsquo;': "\u2018",
    '&rsquo;': "\u2019",
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

interface UseEventsOptions extends EventsParams {
  includeArchive?: boolean;
}

export function useEvents(params: UseEventsOptions = {}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.set('page', String(params.page));
        if (params.limit) searchParams.set('limit', String(params.limit));
        if (params.category) searchParams.set('category', params.category);
        if (params.trending) searchParams.set('trending', 'true');
        if (params.lang) searchParams.set('lang', params.lang);
        if (params.articleFields) searchParams.set('articleFields', params.articleFields);

        // Fetch main events
        const url = `${API_BASE}/events?${searchParams.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const response_data: EventsResponse = await response.json();
        let allEvents = response_data.data.map(sanitizeEvent);

        // Fetch archive if requested
        if (params.includeArchive) {
          const archiveUrl = `${API_BASE}/events/archive?${searchParams.toString()}`;
          const archiveResponse = await fetch(archiveUrl);

          if (archiveResponse.ok) {
            const archiveData: EventsResponse = await archiveResponse.json();
            const archiveEvents = archiveData.data.map(sanitizeEvent);
            allEvents = [...allEvents, ...archiveEvents];
          }
        }

        setEvents(allEvents);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch events'));
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [params.page, params.limit, params.category, params.trending, params.lang, params.articleFields, params.includeArchive]);

  return { events, loading, error };
}
