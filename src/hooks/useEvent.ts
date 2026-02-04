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

    // Track if this effect is still current (prevents race conditions)
    let cancelled = false;

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

        // Only update state if this request is still current
        if (!cancelled) {
          setEvent(sanitizeEvent(data));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch event'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchEvent();

    // Cleanup: mark this effect as cancelled when a new one runs
    return () => {
      cancelled = true;
    };
  }, [eventId, lang]);

  return { event, loading, error };
}
