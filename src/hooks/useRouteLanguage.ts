import { useLocation } from 'react-router-dom';
import type { Language } from '../stores/languageStore';

/**
 * Derive the current language directly from the URL pathname.
 * Unlike useLanguage() (Zustand store), this is always in sync with the URL —
 * no one-render delay waiting for LanguageRouteHandler's useEffect to fire.
 *
 * Use this in data-fetching hooks and page components that need
 * the language immediately after a navigation (e.g. language switch).
 */
export function useRouteLanguage(): Language {
  const location = useLocation();
  const match = location.pathname.match(/^\/(en|de)(\/|$)/);
  return match ? (match[1] as Language) : 'pl';
}
