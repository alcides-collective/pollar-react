import useSWR from 'swr';
import { sejmApi } from '../utils/sejm-api';
import type { SejmMP, MPsResponse } from '../types/sejm';

interface UseMPsParams {
  club?: string;
  active?: boolean;
}

export function useMPs(params?: UseMPsParams) {
  const cacheKey = `/sejm/MPs?${JSON.stringify(params || {})}`;

  const { data, error, isLoading } = useSWR<MPsResponse>(
    cacheKey,
    () => sejmApi.mps.list(params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    }
  );

  return {
    mps: data?.items ?? [],
    clubs: data?.clubs ?? [],
    count: data?.count ?? 0,
    lastUpdate: data?.lastUpdate ?? null,
    loading: isLoading,
    error: error ?? null,
  };
}

export function useActiveMPs() {
  const { mps, ...rest } = useMPs();
  return {
    mps: mps.filter(mp => mp.active),
    ...rest,
  };
}

export function useMPsByClub() {
  const { mps, ...rest } = useMPs();

  const grouped: Record<string, SejmMP[]> = {};
  mps.forEach(mp => {
    if (!grouped[mp.club]) grouped[mp.club] = [];
    grouped[mp.club].push(mp);
  });

  return {
    mpsByClub: grouped,
    ...rest,
  };
}
