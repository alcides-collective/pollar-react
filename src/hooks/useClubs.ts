import useSWR from 'swr';
import { sejmApi } from '../utils/sejm-api';
import type { SejmClub } from '../types/sejm';

export function useClubs() {
  const { data, error, isLoading } = useSWR<SejmClub[]>(
    '/sejm/clubs',
    () => sejmApi.clubs.list(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    }
  );

  return {
    clubs: data ?? [],
    loading: isLoading,
    error: error ?? null,
  };
}

export function useClub(id: string | null) {
  const { data, error, isLoading } = useSWR<SejmClub | null>(
    id ? `/sejm/clubs/${id}` : null,
    () => id ? sejmApi.clubs.get(id) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    }
  );

  return {
    club: data ?? null,
    loading: isLoading,
    error: error ?? null,
  };
}
