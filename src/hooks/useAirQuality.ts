import useSWR from 'swr';
import { useMemo } from 'react';
import type { AirQualityData, AirQualitySummary } from '../types/dane';
import { API_BASE } from '../utils/dane-api';

interface AirQualityAllResponse {
  data: AirQualityData[];
  count: number;
}

interface AirQualitySummaryResponse {
  summary: AirQualitySummary[];
}

async function fetchAirQualityAll(url: string): Promise<AirQualityData[]> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data: AirQualityAllResponse = await response.json();
  return data.data;
}

async function fetchAirQualitySummary(url: string): Promise<AirQualitySummary[]> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data: AirQualitySummaryResponse = await response.json();
  return data.summary;
}

export function useAirQuality() {
  const { data, error, isLoading, mutate } = useSWR(
    `${API_BASE}/powietrze/all`,
    fetchAirQualityAll,
    {
      revalidateOnFocus: false,
      refreshInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
      dedupingInterval: 60000,
    }
  );

  // Derived: worst stations (highest pollution)
  const worstStations = useMemo(() =>
    [...(data ?? [])]
      .filter(s => s.indexInfo.level >= 0)
      .sort((a, b) => b.indexInfo.level - a.indexInfo.level)
      .slice(0, 10),
    [data]
  );

  // Derived: best stations (lowest pollution)
  const bestStations = useMemo(() =>
    [...(data ?? [])]
      .filter(s => s.indexInfo.level >= 0)
      .sort((a, b) => a.indexInfo.level - b.indexInfo.level)
      .slice(0, 10),
    [data]
  );

  // Derived: stations grouped by province
  const stationsByProvince = useMemo(() => {
    const map = new Map<string, AirQualityData[]>();
    for (const station of data ?? []) {
      const province = station.station.city.commune.provinceName;
      if (!map.has(province)) map.set(province, []);
      map.get(province)!.push(station);
    }
    return map;
  }, [data]);

  // Derived: national average
  const nationalAverage = useMemo(() => {
    const stations = data ?? [];
    if (stations.length === 0) return null;

    const validStations = stations.filter(s => s.indexInfo.level >= 0);
    if (validStations.length === 0) return null;

    const avgLevel = validStations.reduce((sum, s) => sum + s.indexInfo.level, 0) / validStations.length;
    return {
      level: Math.round(avgLevel * 10) / 10,
      stationCount: validStations.length,
    };
  }, [data]);

  return {
    stations: data ?? [],
    worstStations,
    bestStations,
    stationsByProvince,
    nationalAverage,
    loading: isLoading,
    error: error ?? null,
    refresh: mutate,
  };
}

export function useAirQualitySummary() {
  const { data, error, isLoading } = useSWR(
    `${API_BASE}/powietrze/summary`,
    fetchAirQualitySummary,
    {
      revalidateOnFocus: false,
      refreshInterval: 5 * 60 * 1000,
      dedupingInterval: 60000,
    }
  );

  return {
    summary: data ?? [],
    loading: isLoading,
    error: error ?? null,
  };
}
