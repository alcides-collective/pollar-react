import { buildApiUrl } from '@/config/api';
import { useAuthStore } from '@/stores/authStore';
import type { VotingAlert, CategoryEventAlert } from '@/types/auth';

/**
 * Historical voting alert (backfill for followed MPs)
 */
export interface HistoricalVotingAlert {
  id: string;
  votingId: string;
  sitting: number;
  votingNumber: number;
  mpId: number;
  mpName: string;
  votingTitle: string;
  vote: 'yes' | 'no' | 'abstain' | 'absent' | 'present';
  date: string;
  isHistorical: true;
}

/**
 * Combined alert type for display
 */
export type CombinedAlert = (VotingAlert & { isHistorical?: false }) | HistoricalVotingAlert;

/**
 * Response type for paginated historical alerts
 */
export interface HistoricalAlertsResponse {
  alerts: HistoricalVotingAlert[];
  count: number;
  hasMore: boolean;
}

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

/**
 * Gets historical voting alerts (backfill for followed MPs)
 */
export async function getHistoricalVotingAlerts(
  days: number = 30,
  limit: number = 10,
  offset: number = 0
): Promise<HistoricalAlertsResponse> {
  const token = await getAuthToken();
  if (!token) return { alerts: [], count: 0, hasMore: false };

  const response = await fetch(
    buildApiUrl(`/voting-alerts/historical?days=${days}&limit=${limit}&offset=${offset}`),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get historical alerts: ${response.status}`);
  }

  const data = await response.json();
  return {
    alerts: data.alerts || [],
    count: data.count || 0,
    hasMore: data.hasMore || false,
  };
}

// ============ Category Alerts ============

/**
 * Gets category event alerts for the current user
 */
export async function getCategoryAlerts(limit: number = 50): Promise<CategoryEventAlert[]> {
  const token = await getAuthToken();
  if (!token) return [];

  const response = await fetch(buildApiUrl(`/category-alerts?limit=${limit}`), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get category alerts: ${response.status}`);
  }

  const data = await response.json();
  return data.alerts || [];
}

/**
 * Gets the count of unread category alerts
 */
export async function getUnreadCategoryAlertsCount(): Promise<number> {
  const token = await getAuthToken();
  if (!token) return 0;

  const response = await fetch(buildApiUrl('/category-alerts/unread-count'), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get unread category alerts count: ${response.status}`);
  }

  const data = await response.json();
  return data.count || 0;
}

/**
 * Marks a single category alert as read
 */
export async function markCategoryAlertAsRead(alertId: string): Promise<void> {
  const token = await getAuthToken();
  if (!token) return;

  const response = await fetch(buildApiUrl(`/category-alerts/${alertId}/read`), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to mark category alert as read: ${response.status}`);
  }
}

/**
 * Marks all category alerts as read
 */
export async function markAllCategoryAlertsAsRead(): Promise<void> {
  const token = await getAuthToken();
  if (!token) return;

  const response = await fetch(buildApiUrl('/category-alerts/read-all'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to mark all category alerts as read: ${response.status}`);
  }
}
