import { useEffect, useRef } from 'react';
import { trackScrollMilestone } from '@/lib/analytics';
import { useUser } from '@/stores/authStore';

const MILESTONES = [25, 50, 75, 100];

interface UseScrollTrackingOptions {
  /** Name for the scroll event (e.g., 'event_page', 'brief') */
  pageName: string;
  /** Optional content ID (e.g., event ID) */
  contentId?: string;
  /** Whether tracking is enabled */
  enabled?: boolean;
}

/**
 * Reusable scroll milestone tracker.
 * Fires scroll_milestone events at 25%, 50%, 75%, 100% for registered users.
 * Each milestone fires only once per page load.
 * Returns current max scroll depth.
 */
export function useScrollTracking(options: UseScrollTrackingOptions): number {
  const { pageName, contentId, enabled = true } = options;
  const user = useUser();
  const startTimeRef = useRef(Date.now());
  const firedMilestonesRef = useRef(new Set<number>());
  const maxDepthRef = useRef(0);

  useEffect(() => {
    if (!enabled || !user) return;

    // Reset on mount
    startTimeRef.current = Date.now();
    firedMilestonesRef.current = new Set();
    maxDepthRef.current = 0;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const depth = Math.min(100, Math.round((scrollTop / docHeight) * 100));
      if (depth > maxDepthRef.current) maxDepthRef.current = depth;

      for (const milestone of MILESTONES) {
        if (depth >= milestone && !firedMilestonesRef.current.has(milestone)) {
          firedMilestonesRef.current.add(milestone);
          trackScrollMilestone({
            page_name: pageName,
            depth_percent: milestone,
            time_to_milestone_seconds: Math.round((Date.now() - startTimeRef.current) / 1000),
            content_id: contentId,
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enabled, user, pageName, contentId]);

  return maxDepthRef.current;
}
