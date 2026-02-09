import { useEffect, useRef, useCallback } from 'react';

/**
 * Tracks active time on the page using the Page Visibility API.
 * Pauses timer when tab is hidden, resumes when visible.
 * Returns a function to get the current active time in seconds.
 */
export function useActiveTime(enabled: boolean = true): () => number {
  const activeTimeRef = useRef(0);
  const lastActiveRef = useRef(Date.now());
  const isActiveRef = useRef(true);

  useEffect(() => {
    if (!enabled) return;

    lastActiveRef.current = Date.now();
    activeTimeRef.current = 0;
    isActiveRef.current = true;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (isActiveRef.current) {
          activeTimeRef.current += Date.now() - lastActiveRef.current;
          isActiveRef.current = false;
        }
      } else {
        lastActiveRef.current = Date.now();
        isActiveRef.current = true;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      // Accumulate remaining time on unmount
      if (isActiveRef.current) {
        activeTimeRef.current += Date.now() - lastActiveRef.current;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled]);

  return useCallback(() => {
    let total = activeTimeRef.current;
    if (isActiveRef.current) {
      total += Date.now() - lastActiveRef.current;
    }
    return Math.round(total / 1000);
  }, []);
}
