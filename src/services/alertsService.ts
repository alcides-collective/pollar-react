import { buildApiUrl } from '@/config/api';
import { useAuthStore } from '@/stores/authStore';
import type { VotingAlert } from '@/types/auth';

/**
 * Gets the authentication token
 */
async function getAuthToken(): Promise<string | null> {
  return useAuthStore.getState().getAccessToken();
}

/**
 * Gets voting alerts for the current user
 */
export async function getVotingAlerts(limit: number = 50): Promise<VotingAlert[]> {
  const token = await getAuthToken();
  if (!token) return [];

  const response = await fetch(buildApiUrl(`/voting-alerts?limit=${limit}`), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get voting alerts: ${response.status}`);
  }

  const data = await response.json();
  return data.alerts || [];
}

/**
 * Gets the count of unread voting alerts
 */
export async function getUnreadAlertsCount(): Promise<number> {
  const token = await getAuthToken();
  if (!token) return 0;

  const response = await fetch(buildApiUrl('/voting-alerts/unread-count'), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get unread alerts count: ${response.status}`);
  }

  const data = await response.json();
  return data.count || 0;
}

/**
 * Marks a single alert as read
 */
export async function markAlertAsRead(alertId: string): Promise<void> {
  const token = await getAuthToken();
  if (!token) return;

  const response = await fetch(buildApiUrl(`/voting-alerts/${alertId}/read`), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to mark alert as read: ${response.status}`);
  }
}

/**
 * Marks all alerts as read
 */
export async function markAllAlertsAsRead(): Promise<void> {
  const token = await getAuthToken();
  if (!token) return;

  const response = await fetch(buildApiUrl('/voting-alerts/read-all'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to mark all alerts as read: ${response.status}`);
  }
}
