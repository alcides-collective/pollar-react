import useSWR from 'swr';
import { sejmApi } from '../utils/sejm-api';
import type { MPWithStats } from '../types/sejm';

export function useMP(id: number | null) {
  const { data, error, isLoading } = useSWR<MPWithStats | null>(
    id ? `/sejm/MPs/${id}` : null,
    () => id ? sejmApi.mps.get(id) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    }
  );

  return {
    mp: data ?? null,
    loading: isLoading,
    error: error ?? null,
  };
}
