import { logEvent } from 'firebase/analytics';
import { analytics } from '@/config/firebase';

type AuthMethod = 'email' | 'google' | 'apple';

/**
 * Track user sign up event
 */
export function trackSignUp(method: AuthMethod) {
  if (!analytics) return;
  logEvent(analytics, 'sign_up', { method });
}

/**
 * Track user login event
 */
export function trackLogin(method: AuthMethod) {
  if (!analytics) return;
  logEvent(analytics, 'login', { method });
}

/**
 * Track user logout event
 */
export function trackLogout() {
  if (!analytics) return;
  logEvent(analytics, 'logout');
}

/**
 * Track bookmark event (add/remove)
 */
export function trackBookmarkEvent(eventId: string, action: 'add' | 'remove') {
  if (!analytics) return;
  logEvent(analytics, 'bookmark_event', { event_id: eventId, action });
}

/**
 * Track hidden category toggle
 */
export function trackHiddenCategory(category: string, action: 'hide' | 'show') {
  if (!analytics) return;
  logEvent(analytics, 'hidden_category', { category, action });
}

/**
 * Track avatar upload
 */
export function trackAvatarUpload(success: boolean) {
  if (!analytics) return;
  logEvent(analytics, 'avatar_upload', { success });
}

/**
 * Track page view (custom)
 */
export function trackPageView(pageName: string, pageParams?: Record<string, string>) {
  if (!analytics) return;
  logEvent(analytics, 'page_view', {
    page_title: pageName,
    ...pageParams,
  });
}

/**
 * Track event detail view
 */
export function trackEventView(eventId: string, category: string) {
  if (!analytics) return;
  logEvent(analytics, 'view_event', {
    event_id: eventId,
    category,
  });
}

/**
 * Track search
 */
export function trackSearch(query: string, resultsCount: number) {
  if (!analytics) return;
  logEvent(analytics, 'search', {
    search_term: query,
    results_count: resultsCount,
  });
}
