import { useEffect, useRef } from 'react';
import { useCookieConsent } from '../stores/cookieConsentStore';

const CONTENTSQUARE_SCRIPT_URL = 'https://t.contentsquare.net/uxa/31c492925607b.js';

/**
 * Loads Contentsquare/Hotjar analytics only when user has given analytics consent.
 * Script is loaded once and persists for the session.
 */
export function useContentsquare() {
  const consent = useCookieConsent();
  const isLoadedRef = useRef(false);

  useEffect(() => {
    // Only load if analytics consent is granted and not already loaded
    if (!consent?.analytics || isLoadedRef.current) {
      return;
    }

    // Check if script already exists in DOM
    const existingScript = document.querySelector(
      `script[src="${CONTENTSQUARE_SCRIPT_URL}"]`
    );
    if (existingScript) {
      isLoadedRef.current = true;
      return;
    }

    // Create and inject script
    const script = document.createElement('script');
    script.src = CONTENTSQUARE_SCRIPT_URL;
    script.async = true;
    document.head.appendChild(script);

    isLoadedRef.current = true;
  }, [consent?.analytics]);
}
