import useSWR from 'swr';
import { sejmApi } from '../utils/sejm-api';
import type { SejmVoting } from '../types/sejm';

export function useVoting(sitting: number | null, votingNumber: number | null) {
  const { data, error, isLoading } = useSWR<SejmVoting | null>(
    sitting && votingNumber ? `/sejm/votings/${sitting}/${votingNumber}` : null,
    () => sitting && votingNumber ? sejmApi.votings.get(sitting, votingNumber) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    }
  );

  return {
    voting: data ?? null,
    loading: isLoading,
    error: error ?? null,
  };
}
