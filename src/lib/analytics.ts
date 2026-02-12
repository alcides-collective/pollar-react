import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { analytics, auth } from '@/config/firebase';
import type { AuthUser, UserProfile } from '@/types/auth';
import {
  recordEventOpened as _recordEventOpened,
  recordSourceClicked as _recordSourceClicked,
  recordBriefViewed as _recordBriefViewed,
  recordMapUsed as _recordMapUsed,
  recordSessionEnd as _recordSessionEnd,
} from '@/services/userAnalyticsService';

type AuthMethod = 'email' | 'google' | 'apple';

// ============ Admin Filter ============

const ADMIN_UIDS: ReadonlySet<string> = new Set([
  's5O4nQYjk6XueZ15HfnC7yNoiqg1',
  'U52GJqLU2VYPb99nBxCagaauSdb2',
  'oeBOvJmekeaZlgkukURhwKDu7zh2',
]);

function isAdmin(): boolean {
  return Boolean(auth?.currentUser?.uid && ADMIN_UIDS.has(auth.currentUser.uid));
}

// ============ Event Source Types ============

export type EventSource = 'feed' | 'brief' | 'map' | 'search' | 'notification' | 'similar' | 'archive' | 'direct';

// ============ User Identity ============

/** Returns the analytics instance only if the current user is not an admin. */
function getAnalyticsIfNotAdmin(): typeof analytics {
  if (isAdmin()) return null;
  return analytics;
}

/**
 * Set Firebase Analytics user identity after login.
 * Sets userId and user properties for registered user tracking.
 */
export function initUserAnalytics(
  user: AuthUser,
  profile: UserProfile | null,
  language: string
): void {
  if (!analytics || ADMIN_UIDS.has(user.uid)) return;

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
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'sign_up', { method });
}

/**
 * Track user login event
 */
export function trackLogin(method: AuthMethod) {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'login', { method });
}

/**
 * Track user logout event
 */
export function trackLogout() {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'logout');
}

/**
 * Track bookmark event (add/remove)
 */
export function trackBookmarkEvent(eventId: string, action: 'add' | 'remove') {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'bookmark_event', { event_id: eventId, action });
}

/**
 * Track hidden category toggle
 */
export function trackHiddenCategory(category: string, action: 'hide' | 'show') {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'hidden_category', { category, action });
}

/**
 * Track avatar upload
 */
export function trackAvatarUpload(success: boolean) {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'avatar_upload', { success });
}

/**
 * Track page view (custom).
 * Sends only via gtag.js to avoid double-counting in GA4.
 * Firebase SDK logEvent was removed — both channels share the same measurementId,
 * so sending via both caused ~2× page_view inflation.
 */
export function trackPageView(pageName: string, pageParams?: Record<string, string>) {
  if (isAdmin()) return;
  // gtag.js (GA4 direct) — works even before consent (queued by consent mode)
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_title: pageName,
      page_path: pageParams?.page_path,
      page_location: pageParams?.page_location,
    });
  }
}

/**
 * Track event detail view
 */
export function trackEventView(eventId: string, category: string) {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'view_event', {
    event_id: eventId,
    category,
  });
}

/**
 * Track search
 */
export function trackSearch(query: string, resultsCount: number) {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'search', {
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
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'event_opened', params);
  const uid = auth?.currentUser?.uid;
  if (uid) _recordEventOpened(uid);
}

/**
 * Track brief page viewed by a registered user.
 */
export function trackBriefViewed(params: {
  scroll_depth: number;
  time_spent_seconds: number;
  sections_count: number;
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'brief_viewed', params);
  const uid = auth?.currentUser?.uid;
  if (uid) _recordBriefViewed(uid);
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
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'session_summary', {
    events_viewed: params.events_viewed,
    sources_clicked: params.sources_clicked,
    brief_viewed: String(params.brief_viewed),
    session_duration_seconds: params.session_duration_seconds,
  });
  const uid = auth?.currentUser?.uid;
  if (uid) _recordSessionEnd(uid, params.session_duration_seconds);
}

/**
 * Track source/article click on event page.
 */
export function trackSourceClicked(params: {
  event_id: string;
  source_name: string;
  position: number;
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'source_clicked', params);
  const uid = auth?.currentUser?.uid;
  if (uid) _recordSourceClicked(uid);
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
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'scroll_milestone', params);
}

/**
 * Track search performed (fires for all users).
 */
export function trackSearchPerformed(params: {
  query: string;
  results_count: number;
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'search_performed', {
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
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'search_result_clicked', params);
}

/**
 * Track map interaction.
 */
export function trackMapUsed(params: {
  action: 'point_click' | 'cluster_click';
  event_id?: string;
  cluster_size?: number;
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'map_used', params);
  const uid = auth?.currentUser?.uid;
  if (uid) _recordMapUsed(uid);
}

// ============ AI Companion Events ============

export function trackAIMessageSent(params: {
  message_length: number;
  is_suggestion: boolean;
  language: string;
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'ai_message_sent', params);
}

export function trackAISuggestionClicked(params: {
  suggestion_text: string;
  position: number;
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'ai_suggestion_clicked', params);
}

export function trackAIConversationStarted(params: {
  language: string;
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'ai_conversation_started', params);
}

export function trackAIRateLimitReached(params: {
  remaining: number;
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'ai_rate_limit_reached', params);
}

export function trackAIConversationReset(): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'ai_conversation_reset');
}

// ============ Share Events ============

export function trackShareInitiated(params: {
  method: 'native_share' | 'clipboard' | 'twitter' | 'facebook' | 'linkedin';
  content_type: string;
  content_id?: string;
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'share_initiated', params);
}

// ============ Contact Events ============

export function trackContactFormSubmit(params: {
  subject: string;
  success: boolean;
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'contact_form_submit', params);
}

export function trackFAQItemExpanded(params: {
  question_index: number;
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'faq_item_expanded', params);
}

// ============ Newsletter Events ============

export function trackNewsletterSignup(params: {
  source: string;
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'newsletter_signup', params);
}

export function trackNewsletterConfirmed(): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'newsletter_confirmed');
}

export function trackNewsletterConfirmFailed(): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'newsletter_confirm_failed');
}

// ============ Giełda (Stock Market) Events ============

export function trackStockViewed(params: {
  symbol: string;
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'stock_viewed', params);
}

export function trackChartRangeChanged(params: {
  symbol: string;
  range: string;
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'chart_range_changed', params);
}

export function trackWatchlistToggle(params: {
  symbol: string;
  action: 'add' | 'remove';
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'watchlist_toggle', params);
}

// ============ Sejm (Parliament) Events ============

export function trackMPViewed(params: {
  mp_id: number;
  mp_name: string;
  club: string;
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'mp_viewed', params);
}

export function trackMPFollowToggle(params: {
  mp_id: number;
  mp_name: string;
  action: 'follow' | 'unfollow';
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'mp_follow_toggle', params);
}

export function trackVotingViewed(params: {
  sitting: number;
  voting_number: number;
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'voting_viewed', params);
}

export function trackCommitteeViewed(params: {
  code: string;
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'committee_viewed', params);
}

// ============ Navigation & Discovery Events ============

export function trackCategoryTabClicked(params: {
  category: string;
  is_auto_rotate: boolean;
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'category_tab_clicked', params);
}

export function trackSimilarEventClicked(params: {
  source_event_id: string;
  target_event_id: string;
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'similar_event_clicked', params);
}

// ============ Profile & Settings Events ============

export function trackThemeChanged(params: {
  theme: string;
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'theme_changed', params);
}

export function trackLanguageChanged(params: {
  language: string;
  previous_language: string;
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'language_changed', params);
}

export function trackFavoriteCategoryToggle(params: {
  category: string;
  action: 'add' | 'remove';
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'favorite_category_toggle', params);
}

export function trackFavoriteCountryToggle(params: {
  country: string;
  action: 'add' | 'remove';
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'favorite_country_toggle', params);
}

// ============ Dane (Data) Events ============

export function trackDatasetViewed(params: {
  dataset: string;
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'dataset_viewed', params);
}

// ============ Content Events ============

export function trackFelietonViewed(params: {
  felieton_id: string;
  category: string;
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'felieton_viewed', params);
}

export function trackBlogPostViewed(params: {
  slug: string;
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'blog_post_viewed', params);
}

export function trackBlogShareClicked(params: {
  slug: string;
  platform: 'twitter' | 'facebook' | 'linkedin' | 'clipboard';
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'blog_share_clicked', params);
}

export function trackPowiazaniaCompleted(params: {
  success: boolean;
  mistakes: number;
  hint_used: boolean;
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'powiazania_completed', params);
}

// ============ Error Events ============

export function trackPageNotFound(params: {
  path: string;
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'page_not_found', params);
}

// ============ Cookie Consent Events ============

export function trackCookieConsent(params: {
  analytics_accepted: boolean;
  marketing_accepted: boolean;
}): void {
  const a = getAnalyticsIfNotAdmin(); if (!a) return;
  logEvent(a, 'cookie_consent_given', params);
}
