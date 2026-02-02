import useSWR from 'swr';
import type { NameEntry } from '../types/dane';
import { API_BASE } from '../utils/dane-api';

interface SurnamesRankingResponse {
  ranking: NameEntry[];
}

interface SurnamesParams {
  gender?: 'M' | 'K';
  limit?: number;
}

async function fetchSurnamesRanking(url: string): Promise<SurnamesRankingResponse> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export function useSurnames(params: SurnamesParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.gender) searchParams.set('gender', params.gender);
  searchParams.set('limit', String(params.limit ?? 50));

  const url = `${API_BASE}/nazwiska/ranking?${searchParams}`;

  const { data, error, isLoading } = useSWR(url, fetchSurnamesRanking, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  return {
    ranking: data?.ranking ?? [],
    loading: isLoading,
    error: error ?? null,
  };
}
