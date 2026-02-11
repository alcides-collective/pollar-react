import { create } from 'zustand';
import {
  getVotingAlerts,
  getUnreadAlertsCount,
  markAlertAsRead as markVotingAlertAsReadService,
  markAllAlertsAsRead as markAllVotingAlertsAsReadService,
  getCategoryAlerts,
  getUnreadCategoryAlertsCount,
  markCategoryAlertAsRead as markCategoryAlertAsReadService,
  markAllCategoryAlertsAsRead as markAllCategoryAlertsAsReadService,
} from '@/services/alertsService';
import type { VotingAlert, CategoryEventAlert } from '@/types/auth';

// ============ Types ============

export type CombinedAlert =
  | (VotingAlert & { alertType: 'voting' })
  | (CategoryEventAlert & { alertType: 'category' });

interface AlertsState {
  // Voting alerts
  votingAlerts: VotingAlert[];
  votingUnreadCount: number;

  // Category alerts
  categoryAlerts: CategoryEventAlert[];
  categoryUnreadCount: number;

  // Combined
  totalUnreadCount: number;

  // Status
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

interface AlertsActions {
  // Fetch voting alerts
  fetchVotingAlerts: () => Promise<void>;
  fetchVotingUnreadCount: () => Promise<void>;
  markVotingAlertAsRead: (alertId: string) => Promise<void>;
  markAllVotingAlertsAsRead: () => Promise<void>;

  // Fetch category alerts
  fetchCategoryAlerts: () => Promise<void>;
  fetchCategoryUnreadCount: () => Promise<void>;
  markCategoryAlertAsRead: (alertId: string) => Promise<void>;
  markAllCategoryAlertsAsRead: () => Promise<void>;

  // Combined
  fetchAllAlerts: () => Promise<void>;
  fetchTotalUnreadCount: () => Promise<void>;
  markAllAlertsAsRead: () => Promise<void>;

  // Helpers
  clearStore: () => void;
  startPolling: () => void;
  stopPolling: () => void;
}

type AlertsStore = AlertsState & AlertsActions;

// Polling interval reference
let pollingInterval: ReturnType<typeof setInterval> | null = null;

// ============ Store ============

export const useAlertsStore = create<AlertsStore>((set, get) => ({
  // Initial State
  votingAlerts: [],
  votingUnreadCount: 0,
  categoryAlerts: [],
  categoryUnreadCount: 0,
  totalUnreadCount: 0,
  isLoading: false,
  error: null,
  lastFetched: null,

  // ============ Voting Alerts ============

  fetchVotingAlerts: async () => {
    try {
      const votingAlerts = await getVotingAlerts(50);
      set({ votingAlerts });
    } catch (error) {
      console.error('Error fetching voting alerts:', error);
    }
  },

  fetchVotingUnreadCount: async () => {
    try {
      const votingUnreadCount = await getUnreadAlertsCount();
      set({
        votingUnreadCount,
        totalUnreadCount: votingUnreadCount + get().categoryUnreadCount,
      });
    } catch (error) {
      console.error('Error fetching voting unread count:', error);
    }
  },

  markVotingAlertAsRead: async (alertId) => {
    const { votingAlerts, votingUnreadCount } = get();

    // Optimistic update
    set({
      votingAlerts: votingAlerts.map(a =>
        a.id === alertId ? { ...a, read: true } : a
      ),
      votingUnreadCount: Math.max(0, votingUnreadCount - 1),
      totalUnreadCount: Math.max(0, get().totalUnreadCount - 1),
    });

    try {
      await markVotingAlertAsReadService(alertId);
    } catch (error) {
      // Revert on error
      set({
        votingAlerts,
        votingUnreadCount,
        totalUnreadCount: votingUnreadCount + get().categoryUnreadCount,
      });
      console.error('Error marking voting alert as read:', error);
    }
  },

  markAllVotingAlertsAsRead: async () => {
    const { votingAlerts, votingUnreadCount } = get();
    const previousAlerts = [...votingAlerts];

    // Optimistic update
    set({
      votingAlerts: votingAlerts.map(a => ({ ...a, read: true })),
      votingUnreadCount: 0,
      totalUnreadCount: get().categoryUnreadCount,
    });

    try {
      await markAllVotingAlertsAsReadService();
    } catch (error) {
      // Revert on error
      set({
        votingAlerts: previousAlerts,
        votingUnreadCount,
        totalUnreadCount: votingUnreadCount + get().categoryUnreadCount,
      });
      console.error('Error marking all voting alerts as read:', error);
    }
  },

  // ============ Category Alerts ============

  fetchCategoryAlerts: async () => {
    try {
      const categoryAlerts = await getCategoryAlerts(50);
      set({ categoryAlerts });
    } catch (error) {
      console.error('Error fetching category alerts:', error);
    }
  },

  fetchCategoryUnreadCount: async () => {
    try {
      const categoryUnreadCount = await getUnreadCategoryAlertsCount();
      set({
        categoryUnreadCount,
        totalUnreadCount: get().votingUnreadCount + categoryUnreadCount,
      });
    } catch (error) {
      console.error('Error fetching category unread count:', error);
    }
  },

  markCategoryAlertAsRead: async (alertId) => {
    const { categoryAlerts, categoryUnreadCount } = get();

    // Optimistic update
    set({
      categoryAlerts: categoryAlerts.map(a =>
        a.id === alertId ? { ...a, read: true } : a
      ),
      categoryUnreadCount: Math.max(0, categoryUnreadCount - 1),
      totalUnreadCount: Math.max(0, get().totalUnreadCount - 1),
    });

    try {
      await markCategoryAlertAsReadService(alertId);
    } catch (error) {
      // Revert on error
      set({
        categoryAlerts,
        categoryUnreadCount,
        totalUnreadCount: get().votingUnreadCount + categoryUnreadCount,
      });
      console.error('Error marking category alert as read:', error);
    }
  },

  markAllCategoryAlertsAsRead: async () => {
    const { categoryAlerts, categoryUnreadCount } = get();
    const previousAlerts = [...categoryAlerts];

    // Optimistic update
    set({
      categoryAlerts: categoryAlerts.map(a => ({ ...a, read: true })),
      categoryUnreadCount: 0,
      totalUnreadCount: get().votingUnreadCount,
    });

    try {
      await markAllCategoryAlertsAsReadService();
    } catch (error) {
      // Revert on error
      set({
        categoryAlerts: previousAlerts,
        categoryUnreadCount,
        totalUnreadCount: get().votingUnreadCount + categoryUnreadCount,
      });
      console.error('Error marking all category alerts as read:', error);
    }
  },

  // ============ Combined ============

  fetchAllAlerts: async () => {
    set({ isLoading: true, error: null });
    try {
      await Promise.all([
        get().fetchVotingAlerts(),
        get().fetchCategoryAlerts(),
      ]);
      set({ lastFetched: Date.now() });
    } catch (error) {
      set({ error: 'Nie udało się pobrać alertów' });
      console.error('Error fetching all alerts:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTotalUnreadCount: async () => {
    try {
      const [votingCount, categoryCount] = await Promise.all([
        getUnreadAlertsCount(),
        getUnreadCategoryAlertsCount(),
      ]);
      set({
        votingUnreadCount: votingCount,
        categoryUnreadCount: categoryCount,
        totalUnreadCount: votingCount + categoryCount,
      });
    } catch (error) {
      console.error('Error fetching total unread count:', error);
    }
  },

  markAllAlertsAsRead: async () => {
    const {
      votingAlerts,
      categoryAlerts,
      votingUnreadCount,
      categoryUnreadCount,
    } = get();
    const previousVotingAlerts = [...votingAlerts];
    const previousCategoryAlerts = [...categoryAlerts];

    // Optimistic update
    set({
      votingAlerts: votingAlerts.map(a => ({ ...a, read: true })),
      categoryAlerts: categoryAlerts.map(a => ({ ...a, read: true })),
      votingUnreadCount: 0,
      categoryUnreadCount: 0,
      totalUnreadCount: 0,
    });

    try {
      await Promise.all([
        markAllVotingAlertsAsReadService(),
        markAllCategoryAlertsAsReadService(),
      ]);
    } catch (error) {
      // Revert on error
      set({
        votingAlerts: previousVotingAlerts,
        categoryAlerts: previousCategoryAlerts,
        votingUnreadCount,
        categoryUnreadCount,
        totalUnreadCount: votingUnreadCount + categoryUnreadCount,
      });
      console.error('Error marking all alerts as read:', error);
    }
  },

  // ============ Helpers ============

  clearStore: () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    set({
      votingAlerts: [],
      votingUnreadCount: 0,
      categoryAlerts: [],
      categoryUnreadCount: 0,
      totalUnreadCount: 0,
      error: null,
      lastFetched: null,
    });
  },

  startPolling: () => {
    if (pollingInterval) return;

    // Initial fetch
    get().fetchTotalUnreadCount();

    // Poll every 60 seconds
    pollingInterval = setInterval(() => {
      get().fetchTotalUnreadCount();
    }, 60 * 1000);
  },

  stopPolling: () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  },
}));

// ============ Convenience Hooks ============

/** @deprecated Use useVotingAlerts() instead */
export function useAlerts() {
  return useAlertsStore((state) => state.votingAlerts);
}

/** @deprecated Use useTotalUnreadCount() instead */
export function useUnreadAlertsCount() {
  return useAlertsStore((state) => state.totalUnreadCount);
}

export function useAlertsLoading() {
  return useAlertsStore((state) => state.isLoading);
}

// New hooks
export function useVotingAlerts() {
  return useAlertsStore((state) => state.votingAlerts);
}

export function useCategoryAlerts() {
  return useAlertsStore((state) => state.categoryAlerts);
}

export function useVotingUnreadCount() {
  return useAlertsStore((state) => state.votingUnreadCount);
}

export function useCategoryUnreadCount() {
  return useAlertsStore((state) => state.categoryUnreadCount);
}

export function useTotalUnreadCount() {
  return useAlertsStore((state) => state.totalUnreadCount);
}

/**
 * Safely converts various timestamp formats to Date
 */
function toDate(timestamp: unknown): Date {
  if (!timestamp) return new Date(0);

  // Firestore Timestamp with toDate() method
  if (typeof timestamp === 'object' && 'toDate' in timestamp && typeof (timestamp as { toDate: () => Date }).toDate === 'function') {
    return (timestamp as { toDate: () => Date }).toDate();
  }

  // Serialized Firestore Timestamp (from JSON API) with seconds/nanoseconds
  if (typeof timestamp === 'object' && '_seconds' in timestamp) {
    return new Date((timestamp as { _seconds: number })._seconds * 1000);
  }

  if (typeof timestamp === 'object' && 'seconds' in timestamp) {
    return new Date((timestamp as { seconds: number }).seconds * 1000);
  }

  // Already a Date
  if (timestamp instanceof Date) {
    return timestamp;
  }

  // ISO string or other string format
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }

  return new Date(0);
}

/**
 * Returns combined alerts sorted by createdAt descending
 */
export function useCombinedAlerts(): CombinedAlert[] {
  const votingAlerts = useAlertsStore((state) => state.votingAlerts);
  const categoryAlerts = useAlertsStore((state) => state.categoryAlerts);

  const combined: CombinedAlert[] = [
    ...votingAlerts.map(a => ({ ...a, alertType: 'voting' as const })),
    ...categoryAlerts.map(a => ({ ...a, alertType: 'category' as const })),
  ];

  // Sort by createdAt descending
  return combined.sort((a, b) => {
    const dateA = toDate(a.createdAt);
    const dateB = toDate(b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });
}
