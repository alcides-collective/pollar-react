import useSWR from 'swr';
import type { DailyBrief, BriefResponse } from '../types/brief';
import { API_BASE } from '../config/api';
import { sanitizeBrief } from '../utils/sanitize';
import type { Language } from '../stores/languageStore';
import { useRouteLanguage } from './useRouteLanguage';

async function fetchBrief(url: string): Promise<DailyBrief | null> {
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: BriefResponse = await response.json();
  return sanitizeBrief(data.data);
}

interface UseBriefOptions {
  lang?: Language;
}

export function useBrief(options: UseBriefOptions = {}) {
  const storeLanguage = useRouteLanguage();
  const lang = options.lang ?? storeLanguage;
  const url = `${API_BASE}/brief?lang=${lang}`;

  const { data, error, isLoading } = useSWR(url, fetchBrief, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  return {
    brief: data ?? null,
    loading: isLoading,
    error: error ?? null,
  };
}
