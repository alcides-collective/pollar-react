import useSWR from 'swr';
import type { Felieton, FelietonyResponse } from '../types/felieton';

const API_BASE = 'https://pollar.news/api';

function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&rdquo;': '"',
    '&ldquo;': '"',
    '&bdquo;': '„',
    '&quot;': '"',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&nbsp;': ' ',
    '&ndash;': '–',
    '&mdash;': '—',
    '&hellip;': '…',
    '&apos;': "'",
    '&lsquo;': '\u2018',
    '&rsquo;': '\u2019',
  };

  let result = text;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replaceAll(entity, char);
  }
  return result;
}

function sanitizeFelieton(felieton: Felieton): Felieton {
  return {
    ...felieton,
    title: decodeHtmlEntities(felieton.title),
    lead: decodeHtmlEntities(felieton.lead),
    ultraShortHeadline: decodeHtmlEntities(felieton.ultraShortHeadline),
  };
}

async function fetchFelietony(url: string): Promise<Felieton[]> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: FelietonyResponse = await response.json();
  return data.felietony.map(sanitizeFelieton);
}

export function useFelietony() {
  const url = `${API_BASE}/felietony/today`;

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
