import useSWR from 'swr';
import type { EnergySummary } from '../types/dane';
import { API_BASE } from '../utils/dane-api';

async function fetchEnergySummary(url: string): Promise<EnergySummary> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export function useEnergy() {
  const { data, error, isLoading } = useSWR(
    `${API_BASE}/energia/summary`,
    fetchEnergySummary,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    summary: data ?? null,
    currentYear: data?.currentYear ?? null,
    energyMix: data?.energyMix ?? null,
    balance: data?.balance ?? null,
    timeSeries: data?.timeSeries ?? null,
    comparison: data?.comparison ?? null,
    electricityPrice: data?.electricityPrice ?? null,
    loading: isLoading,
    error: error ?? null,
  };
}
