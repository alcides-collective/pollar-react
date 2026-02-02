import useSWR from 'swr';
import type { DailyBrief, BriefResponse } from '../types/brief';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://pollar.up.railway.app/api';

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
    '&lsquo;': "\u2018",
    '&rsquo;': "\u2019",
  };

  let result = text;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replaceAll(entity, char);
  }
  return result;
}

function sanitizeBrief(brief: DailyBrief): DailyBrief {
  return {
    ...brief,
    headline: decodeHtmlEntities(brief.headline || ''),
    lead: decodeHtmlEntities(brief.lead || ''),
    executiveSummary: decodeHtmlEntities(brief.executiveSummary || ''),
    greeting: brief.greeting ? decodeHtmlEntities(brief.greeting) : null,
    sections: brief.sections.map(section => ({
      ...section,
      headline: decodeHtmlEntities(section.headline || ''),
      content: decodeHtmlEntities(section.content || ''),
      keyEvents: section.keyEvents.map(decodeHtmlEntities),
      insights: section.insights.map(decodeHtmlEntities),
    })),
    insights: {
      ...brief.insights,
      metaCommentary: decodeHtmlEntities(brief.insights.metaCommentary || ''),
      trends: brief.insights.trends.map(decodeHtmlEntities),
      correlations: brief.insights.correlations.map(decodeHtmlEntities),
      anomalies: brief.insights.anomalies.map(decodeHtmlEntities),
      implications: brief.insights.implications.map(decodeHtmlEntities),
    },
  };
}

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
  lang?: 'pl' | 'en' | 'ua';
}

export function useBrief(options: UseBriefOptions = {}) {
  const { lang = 'pl' } = options;
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
