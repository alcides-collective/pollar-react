import { useState, useEffect, useRef } from 'react';
import { getVisitorId } from '@/utils/visitor-id';
import { trackEventViewAPI } from '@/services/viewTrackingService';
import { trackEventView as trackFirebaseEventView } from '@/lib/analytics';

interface UseViewTrackingOptions {
  /** Initial view count from event data (fallback) */
  initialViewCount?: number;
  /** Event category for Firebase Analytics */
  category?: string;
  /** Disable tracking (e.g., during loading or error states) */
  disabled?: boolean;
}

interface UseViewTrackingResult {
  /** Current view count (may be updated after tracking) */
  viewCount: number;
  /** Whether view has been successfully tracked */
  isTracked: boolean;
}

/**
 * Hook for tracking event views
 *
 * Features:
 * - Tracks views for ALL users (logged in and anonymous) via visitor UUID
 * - Deduplication handled by backend (Redis SET)
 * - Optimistic UI: shows fallback count immediately, updates after API response
 * - Preserves existing Firebase Analytics tracking
 * - Only tracks once per event ID change
 */
export function useViewTracking(
  eventId: string | undefined,
  options: UseViewTrackingOptions = {}
): UseViewTrackingResult {
  const { initialViewCount = 0, category = '', disabled = false } = options;

  const [viewCount, setViewCount] = useState(initialViewCount);
  const [isTracked, setIsTracked] = useState(false);

  // Track which event we've already tracked to prevent duplicates
  const trackedEventIdRef = useRef<string | null>(null);

  // Update viewCount when initialViewCount changes (new event loaded)
  useEffect(() => {
    if (initialViewCount > 0) {
      setViewCount(initialViewCount);
    }
  }, [initialViewCount]);

  // Reset tracking state when event changes
  useEffect(() => {
    if (eventId !== trackedEventIdRef.current) {
      setIsTracked(false);
    }
  }, [eventId]);

  // Main tracking effect
  useEffect(() => {
    if (!eventId || disabled || isTracked) return;
    if (trackedEventIdRef.current === eventId) return;

    const performTracking = async () => {
      // 1. Firebase Analytics (existing behavior - preserved)
      if (category) {
        trackFirebaseEventView(eventId, category);
      }

      // 2. Backend view tracking (new - for view count)
      const visitorId = getVisitorId();
      if (!visitorId) return;

      const result = await trackEventViewAPI(eventId, visitorId);

      if (result.success && result.viewCount > 0) {
        setViewCount(result.viewCount);
        setIsTracked(true);
        trackedEventIdRef.current = eventId;
      }
    };

    performTracking();
  }, [eventId, category, disabled, isTracked]);

  return { viewCount, isTracked };
}
