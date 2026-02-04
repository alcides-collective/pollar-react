import { useState, useEffect } from 'react';
import type { Event } from '../types/events';
import { API_BASE } from '../config/api';
import { sanitizeEvent } from '../utils/sanitize';
import { useLanguage, type Language } from '../stores/languageStore';

export function useEvent(eventId: string | undefined, langOverride?: Language) {
  const storeLanguage = useLanguage();
  const lang = langOverride ?? storeLanguage;
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
        const response = await fetch(`${API_BASE}/events/${eventId}?lang=${lang}`);

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
  }, [eventId, lang]);

  return { event, loading, error };
}
