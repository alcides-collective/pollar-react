import { useState, useEffect } from 'react';
import type { Event } from '../types/events';
import { API_BASE } from '../config/api';
import { sanitizeEvent } from '../utils/sanitize';
import type { Language } from '../stores/languageStore';
import { useRouteLanguage } from './useRouteLanguage';

const ARCHIVE_API_BASE = 'https://pollar-backend-production.up.railway.app/api';

/** Map archive API response to frontend Event shape */
function mapArchiveEvent(raw: any): Event {
  return {
    id: raw.originalEventId ?? raw.id,
    title: raw.title ?? '',
    lead: raw.lead ?? '',
    summary: raw.summary ?? '',
    createdAt: raw.originalCreatedAt ?? raw.archivedAt,
    updatedAt: raw.originalUpdatedAt ?? raw.archivedAt,
    lastContentUpdate: raw.originalUpdatedAt ?? raw.archivedAt,
    lastSummarizationComplete: raw.archivedAt,
    imageUrl: raw.metadata?.imageUrl ?? '',
    category: raw.category ?? raw.metadata?.category ?? 'Inne',
    sources: raw.sources ?? raw.metadata?.sources ?? [],
    trendingScore: raw.metadata?.trendingScore ?? 0,
    articleCount: raw.articleCount ?? raw.metadata?.articleCount ?? 0,
    sourceCount: raw.sources?.length ?? raw.metadata?.sourceCount ?? 0,
    viewCount: raw.metadata?.viewCount ?? 0,
    freshnessLevel: 'OLD',
    metadata: {
      category: raw.category ?? raw.metadata?.category ?? 'Inne',
      trending: false,
      trendingScore: raw.metadata?.trendingScore ?? 0,
      location: raw.location ?? raw.metadata?.location,
      locations: raw.metadata?.locations ?? [],
      keyPoints: raw.keyPoints ?? raw.metadata?.keyPoints ?? [],
      mentionedPeople: raw.metadata?.mentionedPeople ?? [],
      mentionedCountries: raw.metadata?.mentionedCountries ?? [],
      shortHeadline: raw.metadata?.shortHeadline ?? '',
      ultraShortHeadline: raw.metadata?.ultraShortHeadline ?? '',
      sources: raw.sources ?? raw.metadata?.sources ?? [],
      articleCount: raw.articleCount ?? 0,
      sourceCount: raw.sources?.length ?? 0,
      imageAttribution: raw.metadata?.imageAttribution ?? null,
      isLowQualityContent: raw.metadata?.isLowQualityContent ?? false,
      viewCount: raw.metadata?.viewCount ?? 0,
    },
    articles: raw.articles,
  };
}

export function useEvent(eventId: string | undefined, langOverride?: Language) {
  const storeLanguage = useRouteLanguage();
  const lang = langOverride ?? storeLanguage;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isTranslated, setIsTranslated] = useState(true);

  useEffect(() => {

    if (!eventId) {
      setLoading(false);
      return;
    }

    // Track if this effect is still current (prevents race conditions)
    let cancelled = false;

    const fetchEvent = async () => {
      setLoading(true);
      setError(null);
      setIsTranslated(true);

      try {
        const response = await fetch(`${API_BASE}/events/${eventId}?lang=${lang}`);

        if (response.ok) {
          const data = await response.json();
          if (!cancelled) {
            setEvent(sanitizeEvent(data));

            // For non-PL: compare raw leads to detect untranslated content
            if (lang !== 'pl') {
              try {
                const plRes = await fetch(`${API_BASE}/events/${eventId}?lang=pl`);
                if (plRes.ok) {
                  const plData = await plRes.json();
                  if (!cancelled && data.lead && plData.lead === data.lead) {
                    setIsTranslated(false);
                  }
                }
              } catch { /* ignore comparison failure */ }
            }
          }
          return;
        }

        // On 404 — try archive API as fallback
        if (response.status === 404) {
          const archiveResponse = await fetch(
            `${ARCHIVE_API_BASE}/archive/${eventId}?lang=${lang}`
          );

          if (archiveResponse.ok) {
            const archiveData = await archiveResponse.json();
            if (!cancelled) {
              const mapped = mapArchiveEvent(archiveData);
              setEvent(sanitizeEvent(mapped));

              if (lang !== 'pl') {
                try {
                  const plRes = await fetch(`${ARCHIVE_API_BASE}/archive/${eventId}?lang=pl`);
                  if (plRes.ok) {
                    const plData = await plRes.json();
                    const plMapped = mapArchiveEvent(plData);
                    if (!cancelled && mapped.lead && plMapped.lead === mapped.lead) {
                      setIsTranslated(false);
                    }
                  }
                } catch { /* ignore */ }
              }
            }
            return;
          }

          throw new Error('Wydarzenie nie zostało znalezione');
        }

        throw new Error(`HTTP error! status: ${response.status}`);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch event'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchEvent();

    // Cleanup: mark this effect as cancelled when a new one runs
    return () => {
      cancelled = true;
    };
  }, [eventId, lang]);

  return { event, loading, error, isTranslated };
}
