import { useEffect } from 'react';
import useSWR from 'swr';
import type { Newsletter, NewsletterResponse } from '../types/newsletter';
import { API_BASE } from '../config/api';
import { showBackendErrorToast } from '../utils/backendToast';

async function fetchNewsletter(url: string): Promise<Newsletter | null> {
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: NewsletterResponse = await response.json();
  return data.data;
}

export function useNewsletter() {
  const url = `${API_BASE}/newsletter`;

  const { data, error, isLoading } = useSWR(url, fetchNewsletter, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  useEffect(() => {
    showBackendErrorToast('main', error ?? null);
  }, [error]);

  return {
    newsletter: data ?? null,
    loading: isLoading,
    error: error ?? null,
  };
}
