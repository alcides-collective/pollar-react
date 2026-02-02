import useSWR from 'swr';
import type { Event, EventsParams, EventsResponse } from '../types/events';
import { API_BASE } from '../config/api';

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

async function fetchEvents(url: string, includeArchive?: boolean): Promise<Event[]> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const response_data: EventsResponse = await response.json();
  let allEvents = response_data.data.map(sanitizeEvent);

  // Fetch archive if requested
  if (includeArchive) {
    const archiveUrl = url.replace('/events?', '/events/archive?');
    const archiveResponse = await fetch(archiveUrl);

    if (archiveResponse.ok) {
      const archiveData: EventsResponse = await archiveResponse.json();
      const archiveEvents = archiveData.data.map(sanitizeEvent);
      allEvents = [...allEvents, ...archiveEvents];
    }
  }

  return allEvents;
}

export function useEvents(params: UseEventsOptions = {}) {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.category) searchParams.set('category', params.category);
  if (params.trending) searchParams.set('trending', 'true');
  if (params.lang) searchParams.set('lang', params.lang);
  if (params.articleFields) searchParams.set('articleFields', params.articleFields);

  const url = `${API_BASE}/events?${searchParams.toString()}`;
  const cacheKey = `${url}:archive=${params.includeArchive ?? false}`;

  const { data, error, isLoading } = useSWR(
    cacheKey,
    () => fetchEvents(url, params.includeArchive),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // Cache for 1 minute
      keepPreviousData: true, // Keep showing old data while revalidating
    }
  );

  return {
    events: data ?? [],
    loading: isLoading,
    error: error ?? null,
  };
}
