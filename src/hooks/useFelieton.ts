import { useState, useEffect } from 'react';
import type { Felieton } from '../types/felieton';
import { API_BASE } from '../config/api';
import { sanitizeFelieton } from '../utils/sanitize';

export function useFelieton(id: string | undefined) {
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
        const response = await fetch(`${API_BASE}/felietony/${id}`);

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
  }, [id]);

  return { felieton, loading, error };
}
