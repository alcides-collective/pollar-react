import useSWR from 'swr';
import { sejmApi } from '../utils/sejm-api';
import type { MPVotingHistoryResponse } from '../types/sejm';

export function useMPVotings(id: number | null, limit: number = 20) {
  const { data, error, isLoading } = useSWR<MPVotingHistoryResponse>(
    id ? `/sejm/MPs/${id}/votings?limit=${limit}` : null,
    () => id ? sejmApi.mps.votings(id, limit) : null as never,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    }
  );

  return {
    votings: data?.items ?? [],
    count: data?.count ?? 0,
    loading: isLoading,
    error: error ?? null,
  };
}
