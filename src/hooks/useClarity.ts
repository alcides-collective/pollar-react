import { useEffect, useRef } from 'react';
import { useCookieConsent } from '../stores/cookieConsentStore';

const CLARITY_PROJECT_ID = 'vgd5w5i8qv';

/**
 * Loads Microsoft Clarity only when user has given analytics consent.
 * Script is loaded once and persists for the session.
 */
export function useClarity() {
  const consent = useCookieConsent();
  const isLoadedRef = useRef(false);

  useEffect(() => {
    if (!consent?.analytics || isLoadedRef.current) {
      return;
    }

    // Check if already loaded
    const existingScript = Array.from(document.querySelectorAll('script')).find(
      (s) => s.src.includes('clarity.ms')
    );
    if (existingScript) {
      isLoadedRef.current = true;
      return;
    }

    // Initialize Clarity queue
    (window as any).clarity = (window as any).clarity || function (...args: any[]) {
      ((window as any).clarity.q = (window as any).clarity.q || []).push(args);
    };

    // Inject script
    const script = document.createElement('script');
    script.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;
    script.async = true;
    document.head.appendChild(script);

    isLoadedRef.current = true;
  }, [consent?.analytics]);
}
