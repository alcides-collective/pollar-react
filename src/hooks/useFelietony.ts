import useSWR from 'swr';
import type { Felieton, FelietonyResponse } from '../types/felieton';
import { API_BASE } from '../config/api';
import { sanitizeFelieton } from '../utils/sanitize';
import type { Language } from '../stores/languageStore';
import { useRouteLanguage } from './useRouteLanguage';

async function fetchFelietony(url: string): Promise<Felieton[]> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: FelietonyResponse = await response.json();
  return data.felietony.map(sanitizeFelieton);
}

export function useFelietony(langOverride?: Language) {
  const storeLanguage = useRouteLanguage();
  const lang = langOverride ?? storeLanguage;
  const url = `${API_BASE}/felietony/today?lang=${lang}`;

  const { data, error, isLoading } = useSWR(url, fetchFelietony, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  return {
    felietony: data ?? [],
    loading: isLoading,
    error: error ?? null,
  };
}
