import useSWR from 'swr';
import { sejmApi } from '../utils/sejm-api';
import type { SejmCommittee, CommitteeSitting } from '../types/sejm';

export function useCommittees() {
  const { data, error, isLoading } = useSWR<SejmCommittee[]>(
    '/sejm/committees',
    () => sejmApi.committees.list(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    }
  );

  return {
    committees: data ?? [],
    loading: isLoading,
    error: error ?? null,
  };
}

export function useCommittee(code: string | null) {
  const { data, error, isLoading } = useSWR<SejmCommittee | null>(
    code ? `/sejm/committees/${code}` : null,
    () => code ? sejmApi.committees.get(code) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    }
  );

  return {
    committee: data ?? null,
    loading: isLoading,
    error: error ?? null,
  };
}

export function useCommitteeSittings(code: string | null) {
  const { data, error, isLoading } = useSWR<CommitteeSitting[]>(
    code ? `/sejm/committees/${code}/sittings` : null,
    () => code ? sejmApi.committees.sittings(code) : [],
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    }
  );

  return {
    sittings: data ?? [],
    loading: isLoading,
    error: error ?? null,
  };
}
