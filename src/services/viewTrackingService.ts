import { API_BASE } from '@/config/api';

export interface TrackViewResponse {
  success: boolean;
  isNewView: boolean;
  viewCount: number;
}

/**
 * Track a view for an event
 * Uses visitor ID for deduplication on backend (Redis SET)
 */
export async function trackEventViewAPI(
  eventId: string,
  visitorId: string
): Promise<TrackViewResponse> {
  try {
    const response = await fetch(`${API_BASE}/events/${eventId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ visitorId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('View tracking unavailable:', error);
    return { success: false, isNewView: false, viewCount: 0 };
  }
}

/**
 * Get current view count for an event
 */
export async function getEventViewCount(eventId: string): Promise<number> {
  try {
    const response = await fetch(`${API_BASE}/events/${eventId}/views`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.viewCount;
  } catch (error) {
    console.warn('Failed to get view count:', error);
    return 0;
  }
}
