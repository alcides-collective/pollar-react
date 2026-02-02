import useSWR from 'swr';
import type { HousingDataset, HousingSummary } from '../types/dane';
import { API_BASE } from '../utils/dane-api';

interface HousingDatasetsResponse {
  datasets: HousingDataset[];
  totalCount: number;
}

export function useHousing() {
  const { data, error, isLoading } = useSWR(
    `${API_BASE}/mieszkania`,
    async (url: string): Promise<HousingDatasetsResponse> => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    datasets: data?.datasets ?? [],
    totalCount: data?.totalCount ?? 0,
    loading: isLoading,
    error: error ?? null,
  };
}

export function useHousingSummary() {
  const { data, error, isLoading } = useSWR(
    `${API_BASE}/mieszkania/summary`,
    async (url: string): Promise<HousingSummary> => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    summary: data ?? null,
    loading: isLoading,
    error: error ?? null,
  };
}
