import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import type { Event, EventsResponse } from '../types/events';

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

interface EventsCache {
  [key: string]: {
    data: Event[];
    timestamp: number;
  };
}

interface EventsContextType {
  getEvents: (key: string, fetchFn: () => Promise<Event[]>) => { events: Event[]; loading: boolean; error: Error | null };
  eventsCache: EventsCache;
}

const EventsContext = createContext<EventsContextType | null>(null);

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function EventsProvider({ children }: { children: ReactNode }) {
  const [cache, setCache] = useState<EventsCache>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, Error | null>>({});
  const fetchingRef = useRef<Record<string, boolean>>({});

  const getEvents = useCallback((key: string, fetchFn: () => Promise<Event[]>) => {
    const cached = cache[key];
    const now = Date.now();

    // Return cached data if fresh
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      return { events: cached.data, loading: false, error: null };
    }

    // Start fetch if not already fetching
    if (!fetchingRef.current[key]) {
      fetchingRef.current[key] = true;
      setLoading(prev => ({ ...prev, [key]: true }));

      fetchFn()
        .then(data => {
          setCache(prev => ({
            ...prev,
            [key]: { data, timestamp: Date.now() }
          }));
          setErrors(prev => ({ ...prev, [key]: null }));
        })
        .catch(err => {
          setErrors(prev => ({ ...prev, [key]: err }));
        })
        .finally(() => {
          setLoading(prev => ({ ...prev, [key]: false }));
          fetchingRef.current[key] = false;
        });
    }

    // Return cached data while loading, or empty array
    return {
      events: cached?.data ?? [],
      loading: loading[key] ?? true,
      error: errors[key] ?? null
    };
  }, [cache, loading, errors]);

  return (
    <EventsContext.Provider value={{ getEvents, eventsCache: cache }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEventsContext() {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEventsContext must be used within EventsProvider');
  }
  return context;
}

// Hook that replaces useEvents
interface UseEventsOptions {
  limit?: number;
  lang?: string;
  includeArchive?: boolean;
  category?: string;
}

export function useEvents(params: UseEventsOptions = {}) {
  const { getEvents } = useEventsContext();

  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.lang) searchParams.set('lang', params.lang);
  if (params.category) searchParams.set('category', params.category);

  const url = `${API_BASE}/events?${searchParams.toString()}`;
  const cacheKey = `${url}:archive=${params.includeArchive ?? false}`;

  const fetchEvents = async (): Promise<Event[]> => {
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

  return getEvents(cacheKey, fetchEvents);
}
