import useSWR from 'swr';
import type { TransportCategory } from '../types/dane';
import { API_BASE } from '../utils/dane-api';

interface TransportOverviewResponse {
  categories: TransportCategory[];
}

export function useTransport() {
  const { data, error, isLoading } = useSWR(
    `${API_BASE}/transport`,
    async (url: string): Promise<TransportOverviewResponse> => {
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
    categories: data?.categories ?? [],
    loading: isLoading,
    error: error ?? null,
  };
}

export function useRailway() {
  const { data, error, isLoading } = useSWR(
    `${API_BASE}/transport/kolej`,
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

export function usePorts() {
  const { data, error, isLoading } = useSWR(
    `${API_BASE}/transport/porty`,
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
