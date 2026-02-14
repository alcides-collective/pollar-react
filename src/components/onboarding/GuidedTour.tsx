import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import './tour.css';

import { useOnboardingStore, useShouldShowTour } from '@/stores/onboardingStore';
import {
  trackOnboardingStarted,
  trackOnboardingStep,
  trackOnboardingCompleted,
  trackOnboardingSkipped,
} from '@/lib/analytics';

const FULLSCREEN_ROUTES = ['/mapa', '/terminal', '/asystent', '/info', '/graf'];

function isFullscreenRoute(pathname: string): boolean {
  const path = pathname.replace(/^\/(en|de)/, '') || '/';
  return FULLSCREEN_ROUTES.some((r) => path.startsWith(r));
}

/** Find the first visible element matching a selector (handles duplicate data-tour attrs) */
function findVisibleElement(selector: string): Element | null {
  const elements = document.querySelectorAll(selector);
  for (const el of elements) {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) return el;
  }
  return null;
}

/** Check if any element matching the selector is visible */
function isElementVisible(selector: string): boolean {
  return findVisibleElement(selector) !== null;
}

/** Elements that live in the fixed header — need scroll-to-top to be visible */
const HEADER_SELECTORS = [
  '[data-tour="category-tabs"]',
  '[data-tour="search-button"]',
  '[data-tour="discover-menu"]',
  '[data-tour="login-button"]',
];

/** Scroll to top and wait for header show animation */
function ensureHeaderVisible(): Promise<void> {
  return new Promise((resolve) => {
    if (window.scrollY < 50) {
      resolve();
      return;
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    // Wait for header framer-motion spring animation to settle
    setTimeout(resolve, 350);
  });
}

export function GuidedTour() {
  const { t } = useTranslation('onboarding');
  const shouldStart = useShouldShowTour();
  const location = useLocation();
  const activeRef = useRef(false);
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);
  /** Guard against async callbacks firing after destroy */
  const destroyedRef = useRef(false);

  useEffect(() => {
    if (!shouldStart || activeRef.current) return;
    if (isFullscreenRoute(location.pathname)) return;

    activeRef.current = true;
    destroyedRef.current = false;

    // Wait for CookiePopup exit animation (300ms) + buffer
    const timer = setTimeout(() => {
      // Verify core tour target exists in DOM
      if (!document.querySelector('[data-tour="category-tabs"]')) {
        activeRef.current = false;
        return;
      }

      const store = useOnboardingStore.getState();
      const isMobile = window.innerWidth < 768;

      // Build steps dynamically — core 3 always present,
      // brief & AI target actual on-page elements when visible
      const steps: (DriveStep & { _name: string })[] = [
        {
          _name: 'category-tabs',
          element: '[data-tour="category-tabs"]',
          popover: {
            title: t('tour.steps.categories.title'),
            description: t('tour.steps.categories.description'),
            side: 'bottom' as const,
            align: 'start' as const,
          },
        },
        {
          _name: 'search-button',
          element: '[data-tour="search-button"]',
          popover: {
            title: t('tour.steps.search.title'),
            description: t('tour.steps.search.description'),
            side: 'bottom' as const,
            align: 'end' as const,
          },
        },
        {
          _name: 'discover-menu',
          element: '[data-tour="discover-menu"]',
          popover: {
            title: t('tour.steps.discover.title'),
            description: isMobile
              ? t('tour.steps.discover.descriptionMobile')
              : t('tour.steps.discover.description'),
            side: 'bottom' as const,
            align: 'end' as const,
          },
        },
      ];

      // Step 4: Daily Brief — point to actual section if visible on page
      if (isElementVisible('[data-tour="daily-brief"]')) {
        steps.push({
          _name: 'daily-brief',
          element: '[data-tour="daily-brief"]',
          popover: {
            title: t('tour.steps.brief.title'),
            description: t('tour.steps.brief.description'),
            side: 'bottom' as const,
            align: 'end' as const,
          },
        });
      } else {
        // Fallback: point to discover menu (brief is accessible from there)
        steps.push({
          _name: 'daily-brief',
          element: '[data-tour="discover-menu"]',
          popover: {
            title: t('tour.steps.brief.title'),
            description: t('tour.steps.brief.description'),
            side: 'bottom' as const,
            align: 'end' as const,
          },
        });
      }

      // Step 5: AI Companion — point to sidebar widget if visible (desktop only)
      if (isElementVisible('[data-tour="ai-sidebar"]')) {
        steps.push({
          _name: 'ai-companion',
          element: '[data-tour="ai-sidebar"]',
          popover: {
            title: t('tour.steps.aiCompanion.title'),
            description: t('tour.steps.aiCompanion.description'),
            side: 'bottom' as const,
            align: 'end' as const,
          },
        });
      } else {
        // Fallback on mobile: point to discover menu
        steps.push({
          _name: 'ai-companion',
          element: '[data-tour="discover-menu"]',
          popover: {
            title: t('tour.steps.aiCompanion.title'),
            description: t('tour.steps.aiCompanion.description'),
            side: 'bottom' as const,
            align: 'end' as const,
          },
        });
      }

      // Step 6: Login — find the visible login button (desktop vs mobile have separate DOM elements)
      const loginEl = findVisibleElement('[data-tour="login-button"]');
      if (loginEl) {
        steps.push({
          _name: 'login',
          element: loginEl,
          popover: {
            title: t('tour.steps.login.title'),
            description: t('tour.steps.login.description'),
            side: 'bottom' as const,
            align: 'end' as const,
          },
        });
      }

      // Extract step names for analytics
      const stepNames = steps.map((s) => s._name);
      let stepCount = 0;

      const driverObj = driver({
        showProgress: true,
        animate: true,
        popoverClass: 'pollar-tour',
        nextBtnText: t('tour.next'),
        prevBtnText: t('tour.prev'),
        doneBtnText: t('tour.finish'),
        progressText: `{{current}} ${t('tour.of')} {{total}}`,
        steps,
        onHighlightStarted: (_el, step) => {
          stepCount++;
          const name = stepNames[stepCount - 1] || `step-${stepCount}`;
          trackOnboardingStep({ step_name: name, step_number: stepCount });
          store.completeTourStep(name);

          // If this step targets a header element and we're scrolled down,
          // hide popover → scroll to top → wait for header animation → refresh + show
          const rawElement = (step as DriveStep).element;
          const selector = typeof rawElement === 'string'
            ? rawElement
            : rawElement instanceof Element
              ? rawElement.closest('[data-tour]')?.getAttribute('data-tour')
                ? `[data-tour="${rawElement.getAttribute('data-tour')}"]`
                : null
              : null;
          if (selector && HEADER_SELECTORS.includes(selector) && window.scrollY >= 50) {
            const popover = document.querySelector('.driver-popover') as HTMLElement | null;
            if (popover) {
              popover.style.opacity = '0';
              popover.style.pointerEvents = 'none';
            }
            ensureHeaderVisible().then(() => {
              // Guard: don't refresh if driver was destroyed during scroll
              if (destroyedRef.current) return;
              driverObj.refresh();
              if (popover) {
                popover.style.opacity = '';
                popover.style.pointerEvents = '';
              }
            });
          }
        },
        onDestroyed: () => {
          destroyedRef.current = true;
          driverRef.current = null;
          activeRef.current = false;
          if (stepCount > 0) {
            store.completeTour();
            const startedAt = useOnboardingStore.getState().tourStartedAt;
            trackOnboardingCompleted({
              time_spent: startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0,
              total_steps: stepCount,
            });
          } else {
            store.skipTour();
            trackOnboardingSkipped();
          }
        },
      });

      driverRef.current = driverObj;
      driverObj.drive();
      trackOnboardingStarted({ language: document.documentElement.lang || 'pl' });
    }, 600);

    return () => {
      clearTimeout(timer);
      // If driver is running when effect cleans up (e.g. route change),
      // tear it down so overlay/popover/classes don't leak into the DOM.
      // destroy() triggers onDestroyed synchronously → completeTour/skipTour.
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }
      // Reset so the tour can re-attempt on the next eligible page
      // (e.g. user navigated during the 600ms delay before driver started)
      activeRef.current = false;
    };
    // Only depend on shouldStart — we read t/language inside the timeout
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldStart, location.pathname]);

  return null;
}
