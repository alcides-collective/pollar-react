import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPersistedCountries } from '../stores/uiStore';
import { useRouteLanguage } from './useRouteLanguage';
import { buildCountrySlugsParam, COUNTRY_SEGMENT } from '../utils/countrySlug';

/**
 * Redirects to persisted country URL when the user lands on '/'.
 *
 * Priority: URL > sessionStorage > localStorage.
 * Safe from loops because:
 *  - "All" / logo click clears storage BEFORE navigating to '/'
 *  - Country URLs are '/kraj/...' not '/' — hook won't fire
 */
export function useCountryRedirect() {
  const location = useLocation();
  const navigate = useNavigate();
  const language = useRouteLanguage();

  useEffect(() => {
    const pathWithoutLang = location.pathname.replace(/^\/(en|de)/, '') || '/';
    if (pathWithoutLang !== '/') {
      console.log(`[DBG useCountryRedirect] path=${pathWithoutLang} — not root, skip`);
      return;
    }

    const persisted = getPersistedCountries();
    console.log(`[DBG useCountryRedirect] on root, persisted=[${persisted}] language=${language}`);
    if (persisted.length === 0) return;

    const prefix = language !== 'pl' ? `/${language}` : '';
    const seg = COUNTRY_SEGMENT[language];
    const countrySlugs = buildCountrySlugsParam(persisted, language);
    const target = `${prefix}/${seg}/${countrySlugs}`;
    console.log(`[DBG useCountryRedirect] redirecting to: ${target}`);
    navigate(target, { replace: true });
  }, [location.pathname, language, navigate]);
}
