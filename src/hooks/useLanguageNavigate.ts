import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { NavigateOptions } from 'react-router-dom';
import { useLanguage, type Language } from '../stores/languageStore';

/**
 * Returns a navigate function that automatically adds the language prefix.
 * Polish (default) has no prefix, English uses /en/, German uses /de/.
 */
export function useLanguageNavigate() {
  const navigate = useNavigate();
  const language = useLanguage();

  return useCallback(
    (to: string | number, options?: NavigateOptions) => {
      if (typeof to === 'number') {
        navigate(to);
        return;
      }

      const prefix = language !== 'pl' ? `/${language}` : '';
      navigate(prefix + to, options);
    },
    [navigate, language]
  );
}

/**
 * Returns the current path without the language prefix.
 */
export function usePathWithoutLang(): string {
  const location = useLocation();
  return location.pathname.replace(/^\/(en|de)/, '') || '/';
}

/**
 * Builds a localized path with the appropriate language prefix.
 */
export function buildLocalizedPath(path: string, lang: Language): string {
  const prefix = lang !== 'pl' ? `/${lang}` : '';
  return prefix + path;
}
