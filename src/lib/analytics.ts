import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { analytics } from '@/config/firebase';
import type { AuthUser, UserProfile } from '@/types/auth';

type AuthMethod = 'email' | 'google' | 'apple';

// ============ Event Source Types ============

export type EventSource = 'feed' | 'brief' | 'map' | 'search' | 'notification' | 'similar' | 'archive' | 'direct';

// ============ User Identity ============

/**
 * Set Firebase Analytics user identity after login.
 * Sets userId and user properties for registered user tracking.
 */
export function initUserAnalytics(
  user: AuthUser,
  profile: UserProfile | null,
  language: string
): void {
  if (!analytics) return;

  setUserId(analytics, user.uid);

  const registrationDate = profile?.createdAt
    ? new Date(profile.createdAt.seconds * 1000).toISOString().split('T')[0]
    : 'unknown';

  setUserProperties(analytics, {
    registration_date: registrationDate,
    user_type: user.providerId === 'google.com' ? 'google'
      : user.providerId === 'apple.com' ? 'apple'
      : 'email',
    preferred_language: language,
    email_verified: String(user.emailVerified),
  });
}

/**
 * Clear Firebase Analytics user identity on logout.
 */
export function clearUserAnalytics(): void {
  if (!analytics) return;
  setUserId(analytics, null);
}

// ============ Existing Events ============

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

// ============ Retention / Engagement Events ============

/**
 * Infer where the user came from when opening an event.
 * Checks URL ?ref= param first, then falls back to document.referrer pathname matching.
 */
export function inferEventSource(): EventSource {
  const ref = new URLSearchParams(window.location.search).get('ref');
  if (ref && ['feed', 'brief', 'map', 'search', 'notification', 'similar', 'archive'].includes(ref)) {
    return ref as EventSource;
  }

  try {
    const referrerPath = document.referrer ? new URL(document.referrer).pathname : '';
    const clean = referrerPath.replace(/^\/(en|de)/, '') || '/';
    if (clean.includes('/brief')) return 'brief';
    if (clean.includes('/mapa')) return 'map';
    if (clean.includes('/archiwum')) return 'archive';
    if (clean.includes('/event/')) return 'similar';
    if (clean === '/' || /^\/[^/]+$/.test(clean)) return 'feed';
  } catch {
    // referrer parsing failed
  }

  return 'direct';
}

/**
 * Track event opened by a registered user (enhanced version of trackEventView).
 */
export function trackEventOpened(params: {
  event_id: string;
  category: string;
  source: EventSource;
}): void {
  if (!analytics) return;
  logEvent(analytics, 'event_opened', params);
}

/**
 * Track brief page viewed by a registered user.
 */
export function trackBriefViewed(params: {
  scroll_depth: number;
  time_spent_seconds: number;
  sections_count: number;
}): void {
  if (!analytics) return;
  logEvent(analytics, 'brief_viewed', params);
}

/**
 * Track session summary on session end for registered users.
 */
export function trackSessionSummary(params: {
  events_viewed: number;
  sources_clicked: number;
  brief_viewed: boolean;
  session_duration_seconds: number;
}): void {
  if (!analytics) return;
  logEvent(analytics, 'session_summary', {
    events_viewed: params.events_viewed,
    sources_clicked: params.sources_clicked,
    brief_viewed: String(params.brief_viewed),
    session_duration_seconds: params.session_duration_seconds,
  });
}

/**
 * Track source/article click on event page.
 */
export function trackSourceClicked(params: {
  event_id: string;
  source_name: string;
  position: number;
}): void {
  if (!analytics) return;
  logEvent(analytics, 'source_clicked', params);
}

/**
 * Track scroll milestone (25/50/75/100%).
 */
export function trackScrollMilestone(params: {
  page_name: string;
  depth_percent: number;
  time_to_milestone_seconds: number;
  content_id?: string;
}): void {
  if (!analytics) return;
  logEvent(analytics, 'scroll_milestone', params);
}

/**
 * Track search performed (fires for all users).
 */
export function trackSearchPerformed(params: {
  query: string;
  results_count: number;
}): void {
  if (!analytics) return;
  logEvent(analytics, 'search_performed', {
    search_term: params.query,
    results_count: params.results_count,
  });
}

/**
 * Track search result clicked.
 */
export function trackSearchResultClicked(params: {
  query: string;
  result_id: string;
  position: number;
}): void {
  if (!analytics) return;
  logEvent(analytics, 'search_result_clicked', params);
}

/**
 * Track map interaction.
 */
export function trackMapUsed(params: {
  action: 'point_click' | 'cluster_click';
  event_id?: string;
  cluster_size?: number;
}): void {
  if (!analytics) return;
  logEvent(analytics, 'map_used', params);
}
