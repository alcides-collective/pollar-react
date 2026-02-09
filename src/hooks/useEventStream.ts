import { useEffect, useRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { API_BASE } from '../config/api';
import { useEventsStore } from '../stores/eventsStore';
import { decodeHtmlEntities } from '../utils/sanitize';
import { useRouteLanguage } from './useRouteLanguage';

interface StreamEvent {
  id: string;
  title: string;
  lead?: string;
  category: string;
  imageUrl?: string;
  updatedAt?: string;
  sourceCount?: number;
  type: 'new' | 'updated' | 'connected';
  timestamp: string;
}

interface UseEventStreamOptions {
  enabled?: boolean;
  onNewEvent?: (event: StreamEvent) => void;
}

// Map API category keys to translation keys
const CATEGORY_TRANSLATION_KEYS: Record<string, string> = {
  polityka: 'Polityka',
  swiat: 'Świat',
  gospodarka: 'Gospodarka',
  spoleczenstwo: 'Społeczeństwo',
  nauka: 'Nauka i Technologia',
  sport: 'Sport',
  kultura: 'Kultura',
  technologia: 'Nauka i Technologia',
  inne: 'Inne',
};

/** Fetch translated title/lead for an event (like useTranslatedEventTitles) */
async function fetchTranslatedTitle(eventId: string, lang: string): Promise<{ title: string; lead?: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/events/${eventId}?lang=${lang}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title || data.metadata?.ultraShortHeadline || '',
      lead: data.lead,
    };
  } catch {
    return null;
  }
}

/**
 * Hook that connects to the SSE stream and shows toast notifications for new events
 * Buffers notifications when tab is hidden and shows them when user returns
 */
export function useEventStream(options: UseEventStreamOptions = {}) {
  const { enabled = true, onNewEvent } = options;
  const { t } = useTranslation('common');
  const language = useRouteLanguage();
  const languageRef = useRef(language);
  languageRef.current = language;

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);
  const bufferedEventsRef = useRef<StreamEvent[]>([]);
  const [isTabVisible, setIsTabVisible] = useState(!document.hidden);

  // Language-aware URL prefix for navigation
  const getEventUrl = useCallback((eventId: string) => {
    const lang = languageRef.current;
    const prefix = lang !== 'pl' ? `/${lang}` : '';
    return `${prefix}/event/${eventId}`;
  }, []);

  // Show a single toast for an event
  const showEventToast = useCallback((event: StreamEvent) => {
    const categoryKey = CATEGORY_TRANSLATION_KEYS[event.category] || event.category;
    const categoryLabel = t(`categories.${categoryKey}`, { defaultValue: categoryKey });
    const isUpdate = event.type === 'updated';

    toast(event.title, {
      description: isUpdate ? `${categoryLabel} • ${t('eventStream.update')}` : categoryLabel,
      action: {
        label: t('eventStream.view'),
        onClick: () => {
          window.location.href = getEventUrl(event.id);
        },
      },
      duration: 8000,
    });
  }, [t, getEventUrl]);

  // Fetch translated title then show toast (for non-PL languages)
  const showTranslatedToast = useCallback(async (event: StreamEvent) => {
    const lang = languageRef.current;
    if (lang === 'pl') {
      showEventToast(event);
      return;
    }

    // Fetch translated title (same approach as useTranslatedEventTitles in AlertsBell)
    const translated = await fetchTranslatedTitle(event.id, lang);
    if (translated?.title) {
      showEventToast({ ...event, title: translated.title });
    } else {
      // Fallback to Polish title if translation fetch fails
      showEventToast(event);
    }
  }, [showEventToast]);

  // Show buffered events when tab becomes visible
  const showBufferedEvents = useCallback(() => {
    const events = bufferedEventsRef.current;
    if (events.length === 0) return;

    // If more than 5 events buffered, show summary toast
    if (events.length > 5) {
      const lang = languageRef.current;
      const prefix = lang !== 'pl' ? `/${lang}` : '';
      toast(t('eventStream.newEvents', { count: events.length }), {
        description: t('eventStream.clickToSeeLatest'),
        action: {
          label: t('eventStream.view'),
          onClick: () => {
            window.location.href = `${prefix}/`;
          },
        },
        duration: 10000,
      });
    } else {
      // Show individual toasts with slight delay between them
      events.forEach((event, index) => {
        setTimeout(() => {
          showTranslatedToast(event);
        }, index * 500);
      });
    }

    bufferedEventsRef.current = [];
  }, [showTranslatedToast, t]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsTabVisible(visible);

      if (visible) {
        // Tab became visible - show buffered events
        showBufferedEvents();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [showBufferedEvents]);

  const connect = useCallback(() => {
    if (!enabled) return;

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Clear any pending reconnect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Create EventSource connection
    // API_BASE already includes /api, so we just append /events/stream
    const streamUrl = `${API_BASE}/events/stream`;
    const eventSource = new EventSource(streamUrl);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      reconnectAttempts.current = 0;
    };

    eventSource.onmessage = (event) => {
      try {
        const data: StreamEvent = JSON.parse(event.data);

        // Skip connection confirmation messages
        if (data.type === 'connected') {
          return;
        }

        // Call custom callback if provided
        onNewEvent?.(data);

        // Handle new and updated events
        if (data.type === 'new' || data.type === 'updated') {
          // Sanitize text fields (decode HTML entities like &bdquo; &rdquo;)
          const sanitizedTitle = decodeHtmlEntities(data.title);
          const sanitizedLead = data.lead ? decodeHtmlEntities(data.lead) : undefined;

          // Directly upsert event into store (bypasses backend cache)
          // Pass isNew=true for new events to highlight them in UI
          useEventsStore.getState().upsertEvent({
            id: data.id,
            title: sanitizedTitle,
            lead: sanitizedLead,
            category: data.category,
            imageUrl: data.imageUrl,
            updatedAt: data.updatedAt || data.timestamp,
            sourceCount: data.sourceCount || 0,
          }, data.type === 'new');

          // Show toast only for NEW events (not updates)
          if (data.type === 'new') {
            const sanitizedEvent = { ...data, title: sanitizedTitle };

            if (document.hidden) {
              // Tab is hidden - buffer the event
              bufferedEventsRef.current.push(sanitizedEvent);
            } else {
              // Tab is visible - fetch translated title then show toast
              showTranslatedToast(sanitizedEvent);
            }
          }
        }
      } catch (err) {
        console.error('Failed to parse SSE event:', err);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      eventSourceRef.current = null;

      // Exponential backoff for reconnection
      reconnectAttempts.current += 1;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);

      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, delay);
    };
  }, [enabled, onNewEvent, showTranslatedToast]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  // Manual disconnect/reconnect functions
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttempts.current = 0;
    connect();
  }, [disconnect, connect]);

  return { disconnect, reconnect, isTabVisible, bufferedCount: bufferedEventsRef.current.length };
}
