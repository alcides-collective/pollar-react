import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const scrollPositions: Record<string, number> = {};

export function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const isFirstRender = useRef(true);

  // Save scroll position before unmount / route change
  useEffect(() => {
    return () => {
      scrollPositions[pathname] = window.scrollY;
    };
  }, [pathname]);

  // Restore or reset scroll position
  useEffect(() => {
    // Skip first render (initial page load)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (navigationType === 'POP') {
      // Back/forward - restore saved position
      const saved = scrollPositions[pathname];
      if (saved !== undefined) {
        // requestAnimationFrame ensures DOM is ready
        requestAnimationFrame(() => {
          window.scrollTo(0, saved);
        });
      }
    } else {
      // New navigation - scroll to top
      window.scrollTo(0, 0);
    }
  }, [pathname, navigationType]);

  return null;
}
