import useSWR from 'swr';
import { sejmApi } from '../utils/sejm-api';
import type { SejmStats } from '../types/sejm';

export function useSejmStats() {
  const { data, error, isLoading } = useSWR<SejmStats>(
    '/sejm/stats',
    () => sejmApi.stats(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    stats: data ?? null,
    loading: isLoading,
    error: error ?? null,
  };
}
