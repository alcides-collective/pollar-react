import useSWR from 'swr';
import { sejmApi } from '../utils/sejm-api';
import type { SejmProcess } from '../types/sejm';

interface UseProcessesParams {
  limit?: number;
  passed?: boolean;
}

export function useProcesses(params?: UseProcessesParams) {
  const cacheKey = `/sejm/processes?${JSON.stringify(params || {})}`;

  const { data, error, isLoading } = useSWR<SejmProcess[]>(
    cacheKey,
    () => sejmApi.processes.list(params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    }
  );

  return {
    processes: data ?? [],
    loading: isLoading,
    error: error ?? null,
  };
}
