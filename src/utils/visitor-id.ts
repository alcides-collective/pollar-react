/**
 * Visitor identification utilities for anonymous view tracking
 * Works for all users (logged in and anonymous)
 * Compatible with pollar-sveltekit implementation
 */

const VISITOR_ID_KEY = 'pollar_uid';

/**
 * Get or create a unique visitor ID stored in localStorage
 * Used for view tracking and deduplication on the backend
 */
export function getVisitorId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  let visitorId = localStorage.getItem(VISITOR_ID_KEY);

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }

  return visitorId;
}
