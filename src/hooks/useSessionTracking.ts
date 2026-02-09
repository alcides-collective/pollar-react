import { useEffect, useRef } from 'react';
import { trackSessionSummary } from '@/lib/analytics';
import { useUser } from '@/stores/authStore';

// Module-scoped session counters — reset on page load
const sessionData = {
  eventsViewed: 0,
  sourcesClicked: 0,
  briefViewed: false,
  sessionStart: Date.now(),
};

/**
 * Increment event view counter (call from EventPage).
 */
export function incrementEventsViewed(): void {
  sessionData.eventsViewed++;
}

/**
 * Increment source click counter (call from EventSidebar).
 */
export function incrementSourcesClicked(): void {
  sessionData.sourcesClicked++;
}

/**
 * Mark brief as viewed in this session (call from BriefPage).
 */
export function markBriefViewed(): void {
  sessionData.briefViewed = true;
}

/**
 * Hook that fires session_summary event when a registered user's session ends.
 * Mount once in AppContent.
 *
 * Fires on:
 * - visibilitychange (tab hidden) — primary trigger, works on mobile
 * - beforeunload — backup for desktop tab close
 */
export function useSessionTracking(): void {
  const user = useUser();
  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    const fireSessionSummary = () => {
      if (hasFiredRef.current) return;
      // Only fire if user did something meaningful
      if (sessionData.eventsViewed === 0 && !sessionData.briefViewed) return;

      hasFiredRef.current = true;
      const durationSeconds = Math.round((Date.now() - sessionData.sessionStart) / 1000);

      trackSessionSummary({
        events_viewed: sessionData.eventsViewed,
        sources_clicked: sessionData.sourcesClicked,
        brief_viewed: sessionData.briefViewed,
        session_duration_seconds: durationSeconds,
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        fireSessionSummary();
      } else {
        // User returned — allow re-firing on next hide
        hasFiredRef.current = false;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', fireSessionSummary);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', fireSessionSummary);
    };
  }, [user]);
}
