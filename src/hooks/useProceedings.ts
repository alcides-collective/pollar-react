import useSWR from 'swr';
import { sejmApi } from '../utils/sejm-api';
import type { SejmProceeding } from '../types/sejm';

export function useProceedings() {
  const { data, error, isLoading } = useSWR<SejmProceeding[]>(
    '/sejm/proceedings',
    () => sejmApi.proceedings.list(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    }
  );

  return {
    proceedings: data ?? [],
    loading: isLoading,
    error: error ?? null,
  };
}

export function useCurrentProceeding() {
  const { data, error, isLoading } = useSWR<SejmProceeding | null>(
    '/sejm/proceedings/current',
    () => sejmApi.proceedings.current(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Check more often for live proceeding
    }
  );

  return {
    proceeding: data ?? null,
    loading: isLoading,
    error: error ?? null,
  };
}

export function useProceeding(number: number | null) {
  const { data, error, isLoading } = useSWR<SejmProceeding | null>(
    number ? `/sejm/proceedings/${number}` : null,
    () => number ? sejmApi.proceedings.get(number) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    }
  );

  return {
    proceeding: data ?? null,
    loading: isLoading,
    error: error ?? null,
  };
}
