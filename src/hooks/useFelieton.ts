import { useState, useEffect } from 'react';
import type { Felieton } from '../types/felieton';
import { API_BASE } from '../config/api';
import { sanitizeFelieton } from '../utils/sanitize';
import type { Language } from '../stores/languageStore';
import { useRouteLanguage } from './useRouteLanguage';

export function useFelieton(id: string | undefined, langOverride?: Language) {
  const storeLanguage = useRouteLanguage();
  const lang = langOverride ?? storeLanguage;
  const [felieton, setFelieton] = useState<Felieton | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchFelieton = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/felietony/${id}?lang=${lang}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Felieton = await response.json();
        setFelieton(sanitizeFelieton(data));
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch felieton'));
      } finally {
        setLoading(false);
      }
    };

    fetchFelieton();
  }, [id, lang]);

  return { felieton, loading, error };
}
