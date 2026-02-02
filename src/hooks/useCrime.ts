import useSWR from 'swr';
import type { CrimeSummary } from '../types/dane';
import { API_BASE } from '../utils/dane-api';

async function fetchCrimeSummary(url: string): Promise<CrimeSummary> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export function useCrime() {
  const { data, error, isLoading } = useSWR(
    `${API_BASE}/przestepczosc/summary`,
    fetchCrimeSummary,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    summary: data ?? null,
    yearRange: data?.yearRange ?? null,
    latestYear: data?.latestYear ?? null,
    totalCrimes: data?.totalCrimes ?? 0,
    solvingRate: data?.solvingRate ?? 0,
    trend: data?.trend ?? null,
    categories: data?.categories ?? null,
    topRegions: data?.topRegions ?? [],
    timeSeries: data?.timeSeries ?? null,
    loading: isLoading,
    error: error ?? null,
  };
}
