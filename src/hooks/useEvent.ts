import { useState, useEffect } from 'react';
import type { Event } from '../types/events';

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

export function useEvent(eventId: string | undefined) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    const fetchEvent = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/events/${eventId}?lang=pl`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Wydarzenie nie zostało znalezione');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setEvent(sanitizeEvent(data));
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch event'));
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  return { event, loading, error };
}
