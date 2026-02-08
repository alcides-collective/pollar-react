import { useState, useEffect, useRef } from 'react';

const ARCHIVE_API_BASE = 'https://pollar-backend-production.up.railway.app/api';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface ArchiveStats {
  totalEvents: number;
  totalSources: number;
  topPeople: Array<{ name: string; count: number }>;
  topCities: Array<{ name: string; count: number }>;
}

let cachedData: ArchiveStats | null = null;
let cachedAt = 0;

export function useArchiveStats() {
  const [data, setData] = useState<ArchiveStats | null>(cachedData);
  const [loading, setLoading] = useState(!cachedData);
  const [error, setError] = useState<Error | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (cachedData && Date.now() - cachedAt < CACHE_TTL) {
      setData(cachedData);
      setLoading(false);
      return;
    }

    if (fetchedRef.current) return;
    fetchedRef.current = true;

    setLoading(true);
    fetch(`${ARCHIVE_API_BASE}/archive/stats/mentions`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: ArchiveStats) => {
        cachedData = json;
        cachedAt = Date.now();
        setData(json);
        setError(null);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
