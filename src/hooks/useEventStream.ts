import { useEffect, useRef, useCallback, useState } from 'react';
import { toast } from 'sonner';
import { API_BASE } from '../config/api';
import { useEventsStore } from '../stores/eventsStore';
import { decodeHtmlEntities } from '../utils/sanitize';

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

const CATEGORY_LABELS: Record<string, string> = {
  polityka: 'Polityka',
  swiat: 'Świat',
  gospodarka: 'Gospodarka',
  spoleczenstwo: 'Społeczeństwo',
  nauka: 'Nauka',
  sport: 'Sport',
  kultura: 'Kultura',
  technologia: 'Technologia',
  inne: 'Inne',
};

/**
 * Hook that connects to the SSE stream and shows toast notifications for new events
 * Buffers notifications when tab is hidden and shows them when user returns
 */
export function useEventStream(options: UseEventStreamOptions = {}) {
  const { enabled = true, onNewEvent } = options;
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);
  const bufferedEventsRef = useRef<StreamEvent[]>([]);
  const [isTabVisible, setIsTabVisible] = useState(!document.hidden);

  // Show a single toast for an event
  const showEventToast = useCallback((event: StreamEvent) => {
    const categoryLabel = CATEGORY_LABELS[event.category] || event.category;
    const isUpdate = event.type === 'updated';

    toast(event.title, {
      description: isUpdate ? `${categoryLabel} • Aktualizacja` : categoryLabel,
      action: {
        label: 'Zobacz',
        onClick: () => {
          window.location.href = `/event/${event.id}`;
        },
      },
      duration: 8000,
    });
  }, []);

  // Show buffered events when tab becomes visible
  const showBufferedEvents = useCallback(() => {
    const events = bufferedEventsRef.current;
    if (events.length === 0) return;

    // If more than 5 events buffered, show summary toast
    if (events.length > 5) {
      toast(`${events.length} nowych wydarzeń`, {
        description: 'Kliknij aby zobaczyć najnowsze',
        action: {
          label: 'Zobacz',
          onClick: () => {
            window.location.href = '/';
          },
        },
        duration: 10000,
      });
    } else {
      // Show individual toasts with slight delay between them
      events.forEach((event, index) => {
        setTimeout(() => {
          showEventToast(event);
        }, index * 500);
      });
    }

    bufferedEventsRef.current = [];
  }, [showEventToast]);

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
      console.log('[SSE] Connected to event stream');
    };

    eventSource.onmessage = (event) => {
      try {
        const data: StreamEvent = JSON.parse(event.data);

        // Log all incoming events for debugging
        console.log('[SSE] Received event:', data);

        // Skip connection confirmation messages
        if (data.type === 'connected') {
          console.log('[SSE] Connection confirmed');
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
          useEventsStore.getState().upsertEvent({
            id: data.id,
            title: sanitizedTitle,
            lead: sanitizedLead,
            category: data.category,
            imageUrl: data.imageUrl,
            updatedAt: data.updatedAt || data.timestamp,
            sourceCount: data.sourceCount || 0,
          });

          // Show toast only for NEW events (not updates)
          if (data.type === 'new') {
            const sanitizedEvent = { ...data, title: sanitizedTitle };

            if (document.hidden) {
              // Tab is hidden - buffer the event
              bufferedEventsRef.current.push(sanitizedEvent);
            } else {
              // Tab is visible - show toast immediately
              showEventToast(sanitizedEvent);
            }
          }
        }
      } catch (err) {
        console.error('Failed to parse SSE event:', err);
      }
    };

    eventSource.onerror = (error) => {
      console.error('[SSE] Connection error:', error);
      eventSource.close();
      eventSourceRef.current = null;

      // Exponential backoff for reconnection
      reconnectAttempts.current += 1;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
      console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`);

      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, delay);
    };
  }, [enabled, onNewEvent, showEventToast]);

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
