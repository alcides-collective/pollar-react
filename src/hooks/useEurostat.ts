import useSWR from 'swr';
import type { EurostatPolandData, EurostatCompareData, EurostatTimeSeriesData } from '../types/dane';
import { API_BASE } from '../utils/dane-api';

export function useEurostatPoland() {
  const { data, error, isLoading } = useSWR(
    `${API_BASE}/eurostat/poland`,
    async (url: string): Promise<EurostatPolandData> => {
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
    data: data ?? null,
    gdp: data?.data.gdp ?? null,
    inflation: data?.data.inflation ?? null,
    unemployment: data?.data.unemployment ?? null,
    population: data?.data.population ?? null,
    loading: isLoading,
    error: error ?? null,
  };
}

interface UseEurostatCompareParams {
  countries: string[];
  indicator: string;
}

export function useEurostatCompare({ countries, indicator }: UseEurostatCompareParams) {
  const params = new URLSearchParams();
  params.set('countries', countries.join(','));
  params.set('indicator', indicator);

  const { data, error, isLoading } = useSWR(
    `${API_BASE}/eurostat/compare?${params}`,
    async (url: string): Promise<EurostatCompareData> => {
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
    data: data ?? null,
    countries: data?.countries ?? [],
    loading: isLoading,
    error: error ?? null,
  };
}

interface UseEurostatTimeSeriesParams {
  indicator: string;
  country?: string;
}

export function useEurostatTimeSeries({ indicator, country = 'PL' }: UseEurostatTimeSeriesParams) {
  const { data, error, isLoading } = useSWR(
    `${API_BASE}/eurostat/${indicator}?country=${country}`,
    async (url: string): Promise<EurostatTimeSeriesData> => {
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
    data: data ?? null,
    timeSeries: data?.data ?? [],
    loading: isLoading,
    error: error ?? null,
  };
}

export function useEurostatSociety() {
  const { data, error, isLoading } = useSWR(
    `${API_BASE}/eurostat/society`,
    async (url: string) => {
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
    data: data ?? null,
    loading: isLoading,
    error: error ?? null,
  };
}
