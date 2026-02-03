import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { API_BASE } from '../config/api';

interface StreamEvent {
  id: string;
  title: string;
  category: string;
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
 */
export function useEventStream(options: UseEventStreamOptions = {}) {
  const { enabled = true, onNewEvent } = options;
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

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

        // Show toast notification for new events
        if (data.type === 'new') {
          const categoryLabel = CATEGORY_LABELS[data.category] || data.category;

          toast(data.title, {
            description: categoryLabel,
            action: {
              label: 'Zobacz',
              onClick: () => {
                window.location.href = `/event/${data.id}`;
              },
            },
            duration: 8000,
          });
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
  }, [enabled, onNewEvent]);

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

  return { disconnect, reconnect };
}
