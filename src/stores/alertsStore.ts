import { create } from 'zustand';
import {
  getVotingAlerts,
  getUnreadAlertsCount,
  markAlertAsRead as markAlertAsReadService,
  markAllAlertsAsRead as markAllAlertsAsReadService,
} from '@/services/alertsService';
import type { VotingAlert } from '@/types/auth';

// ============ Types ============

interface AlertsState {
  alerts: VotingAlert[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

interface AlertsActions {
  // Fetch
  fetchAlerts: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;

  // Actions
  markAsRead: (alertId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;

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
  alerts: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  lastFetched: null,

  // Fetch all alerts
  fetchAlerts: async () => {
    set({ isLoading: true, error: null });
    try {
      const alerts = await getVotingAlerts(50);
      const unreadCount = alerts.filter(a => !a.read).length;
      set({
        alerts,
        unreadCount,
        lastFetched: Date.now(),
      });
    } catch (error) {
      set({ error: 'Nie udało się pobrać alertów' });
      console.error('Error fetching alerts:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch only unread count (lighter)
  fetchUnreadCount: async () => {
    try {
      const unreadCount = await getUnreadAlertsCount();
      set({ unreadCount });
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  },

  // Mark single alert as read
  markAsRead: async (alertId) => {
    const { alerts } = get();

    // Optimistic update
    set({
      alerts: alerts.map(a =>
        a.id === alertId ? { ...a, read: true } : a
      ),
      unreadCount: Math.max(0, get().unreadCount - 1),
    });

    try {
      await markAlertAsReadService(alertId);
    } catch (error) {
      // Revert on error
      set({
        alerts: alerts.map(a =>
          a.id === alertId ? { ...a, read: false } : a
        ),
        unreadCount: get().unreadCount + 1,
      });
      console.error('Error marking alert as read:', error);
    }
  },

  // Mark all alerts as read
  markAllAsRead: async () => {
    const { alerts } = get();
    const previousAlerts = [...alerts];

    // Optimistic update
    set({
      alerts: alerts.map(a => ({ ...a, read: true })),
      unreadCount: 0,
    });

    try {
      await markAllAlertsAsReadService();
    } catch (error) {
      // Revert on error
      set({ alerts: previousAlerts, unreadCount: previousAlerts.filter(a => !a.read).length });
      console.error('Error marking all alerts as read:', error);
    }
  },

  // Clear store (on logout)
  clearStore: () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    set({
      alerts: [],
      unreadCount: 0,
      error: null,
      lastFetched: null,
    });
  },

  // Start polling for unread count (every 60 seconds)
  startPolling: () => {
    if (pollingInterval) return;

    // Initial fetch
    get().fetchUnreadCount();

    // Poll every 60 seconds
    pollingInterval = setInterval(() => {
      get().fetchUnreadCount();
    }, 60 * 1000);
  },

  // Stop polling
  stopPolling: () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  },
}));

// ============ Convenience Hooks ============

export function useAlerts() {
  return useAlertsStore((state) => state.alerts);
}

export function useUnreadAlertsCount() {
  return useAlertsStore((state) => state.unreadCount);
}

export function useAlertsLoading() {
  return useAlertsStore((state) => state.isLoading);
}
