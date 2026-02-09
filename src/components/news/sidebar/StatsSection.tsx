import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useEvents } from '../../../stores/eventsStore';
import { useArchiveStats } from '../../../hooks/useArchiveStats';
import { useRouteLanguage } from '../../../hooks/useRouteLanguage';

export function StatsSection() {
  const { t } = useTranslation('common');
  const language = useRouteLanguage();

  // Stats data (city names, people) comes from backend in Polish only,
  // so hide entire section for non-Polish languages to avoid mixed-language display
  if (language !== 'pl') return null;

  // Active events (includes /events/archive OLD events which have mentionedPeople)
  const { events: currentEvents, loading: currentLoading } = useEvents({
    limit: 100,
    lang: language,
    skipHiddenFilter: true,
    includeArchive: true,
  });

  // Pre-aggregated stats from pollar-backend-production archive DB
  const { data: archiveStats, loading: archiveLoading } = useArchiveStats();

  const loading = currentLoading || archiveLoading;

  // Merge client-side active event stats with backend archive stats
  const { articlesCount, sourcesCount, topMentioned, topCities } = useMemo(() => {
    // --- People: merge archive backend counts + active event counts ---
    const personCounts = new Map<string, number>();

    // Add archive stats (bulk from DB)
    if (archiveStats?.topPeople) {
      for (const { name, count } of archiveStats.topPeople) {
        personCounts.set(name, count);
      }
    }

    // Add active events (client-side)
    for (const event of currentEvents) {
      const people = event.metadata?.mentionedPeople ?? [];
      for (const person of people) {
        if (person.name) {
          personCounts.set(person.name, (personCounts.get(person.name) ?? 0) + 1);
        }
      }
    }

    const topPeople = Array.from(personCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // --- Cities: merge archive backend counts + active event counts ---
    const cityCounts = new Map<string, number>();

    if (archiveStats?.topCities) {
      for (const { name, count } of archiveStats.topCities) {
        cityCounts.set(name, count);
      }
    }

    for (const event of currentEvents) {
      const locations = event.metadata?.locations ?? [];
      for (const location of locations) {
        if (location.city) {
          cityCounts.set(location.city, (cityCounts.get(location.city) ?? 0) + 1);
        }
      }
      const singleLocation = event.metadata?.location;
      if (singleLocation?.city) {
        cityCounts.set(singleLocation.city, (cityCounts.get(singleLocation.city) ?? 0) + 1);
      }
    }

    const topCitiesResult = Array.from(cityCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // --- Totals ---
    const activeSourceSet = new Set<string>();
    currentEvents.forEach((e) => e.sources?.forEach((s) => activeSourceSet.add(s)));

    const articlesCount = (archiveStats?.totalEvents ?? 0) + currentEvents.length;
    const sourcesCount = Math.max(archiveStats?.totalSources ?? 0, activeSourceSet.size);

    return {
      articlesCount,
      sourcesCount,
      topMentioned: topPeople,
      topCities: topCitiesResult,
    };
  }, [currentEvents, archiveStats]);

  const statItems = [
    {
      icon: 'ri-article-line',
      labelKey: 'stats.articles',
      value: articlesCount,
    },
    {
      icon: 'ri-global-line',
      labelKey: 'stats.sources',
      value: sourcesCount,
    },
  ];

  const formatNumber = (num: number) => {
    return num.toLocaleString('pl-PL');
  };

  return (
    <div className="p-6">
      <h3 className="text-content-heading font-semibold mb-4">{t('stats.title')}</h3>
      <div className="grid grid-cols-2 gap-3">
        {statItems.map((item) => (
          <div
            key={item.labelKey}
            className="bg-surface rounded-lg p-3 text-center"
          >
            <i className={`${item.icon} text-lg text-content-faint mb-1`} />
            <div
              className={`text-xl font-semibold text-content-heading ${
                loading ? 'animate-pulse' : ''
              }`}
            >
              {loading ? '...' : formatNumber(item.value)}
            </div>
            <div className="text-[11px] text-content-subtle mt-0.5">
              {t(item.labelKey)}
            </div>
          </div>
        ))}
      </div>

      {/* Top 10 most mentioned people */}
      {topMentioned.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 text-content-subtle text-[11px] mb-2">
            <i className="ri-user-star-line" />
            {t('stats.mostMentioned')}
          </div>
          <div className={`space-y-1 ${loading ? 'animate-pulse' : ''}`}>
            {topMentioned.map((person, index) => (
              <div
                key={person.name}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-content truncate flex-1">
                  <span className="text-content-faint text-xs mr-1.5">{index + 1}.</span>
                  {person.name}
                </span>
                <span className="text-content-faint text-xs ml-2">{person.count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top 10 cities */}
      {topCities.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 text-content-subtle text-[11px] mb-2">
            <i className="ri-map-pin-line" />
            {t('stats.topCities')}
          </div>
          <div className={`space-y-1 ${loading ? 'animate-pulse' : ''}`}>
            {topCities.map((city, index) => (
              <div
                key={city.name}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-content truncate flex-1">
                  <span className="text-content-faint text-xs mr-1.5">{index + 1}.</span>
                  {city.name}
                </span>
                <span className="text-content-faint text-xs ml-2">{city.count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
