import useSWR from 'swr';
import type { NameEntry, NamesDataset } from '../types/dane';
import { API_BASE } from '../utils/dane-api';

interface NamesRankingResponse {
  ranking: NameEntry[];
  availableYears?: number[];
  year?: number;
}

interface NamesParams {
  year?: number;
  gender?: 'M' | 'K';
  limit?: number;
}

async function fetchNamesRanking(url: string): Promise<NamesRankingResponse> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export function useNames(params: NamesParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.year) searchParams.set('year', String(params.year));
  if (params.gender) searchParams.set('gender', params.gender);
  searchParams.set('limit', String(params.limit ?? 50));

  const url = `${API_BASE}/imiona/ranking?${searchParams}`;

  const { data, error, isLoading } = useSWR(url, fetchNamesRanking, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  return {
    ranking: data?.ranking ?? [],
    availableYears: data?.availableYears ?? [],
    selectedYear: data?.year,
    loading: isLoading,
    error: error ?? null,
  };
}

export function useNamesDatasets() {
  const { data, error, isLoading } = useSWR(
    `${API_BASE}/imiona`,
    async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      return result.datasets as NamesDataset[];
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    datasets: data ?? [],
    loading: isLoading,
    error: error ?? null,
  };
}
