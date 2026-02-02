import { useState, useEffect } from 'react';
import type { DailyBrief, BriefResponse } from '../types/brief';

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

interface UseBriefOptions {
  lang?: 'pl' | 'en' | 'ua';
}

export function useBrief(options: UseBriefOptions = {}) {
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { lang = 'pl' } = options;

  useEffect(() => {
    const fetchBrief = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = `${API_BASE}/brief?lang=${lang}`;
        const response = await fetch(url);

        if (!response.ok) {
          if (response.status === 404) {
            setBrief(null);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: BriefResponse = await response.json();
        setBrief(sanitizeBrief(data.data));
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch brief'));
      } finally {
        setLoading(false);
      }
    };

    fetchBrief();
  }, [lang]);

  return { brief, loading, error };
}
