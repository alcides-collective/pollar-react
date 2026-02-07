import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useEvents } from '../../../stores/eventsStore';
import { useArchiveEvents } from '../../../hooks/useArchiveEvents';
import { useLanguage } from '../../../stores/languageStore';

export function StatsSection() {
  const { t } = useTranslation('common');
  const language = useLanguage();

  // Stats data (city names, people) comes from backend in Polish only,
  // so hide entire section for non-Polish languages to avoid mixed-language display
  if (language !== 'pl') return null;

  // Fetch events (same approach as HeroSection)
  const { events: currentEvents, loading: currentLoading } = useEvents({
    limit: 100,
    lang: language,
    skipHiddenFilter: true,
  });
  const { events: archiveEvents, loading: archiveLoading } = useArchiveEvents({
    limit: 500,
    lang: language,
  });

  const loading = currentLoading || archiveLoading;

  // Calculate stats from events
  const { articlesCount, sourcesCount, topMentioned, topCities } = useMemo(() => {
    // Deduplicate events by ID
    const eventMap = new Map<string, (typeof currentEvents)[0]>();
    currentEvents.forEach((event) => eventMap.set(event.id, event));
    archiveEvents.forEach((event) => {
      if (!eventMap.has(event.id)) eventMap.set(event.id, event);
    });

    const allEvents = Array.from(eventMap.values());

    // Count unique sources
    const allSources = new Set<string>();
    allEvents.forEach((event) => {
      event.sources?.forEach((source) => allSources.add(source));
    });

    // Calculate most mentioned people
    const personCounts = new Map<string, number>();
    for (const event of allEvents) {
      const people = event.metadata?.mentionedPeople ?? [];
      for (const person of people) {
        if (person.name) {
          personCounts.set(person.name, (personCounts.get(person.name) ?? 0) + 1);
        }
      }
    }

    // Sort by count and take top 10
    const topPeople = Array.from(personCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Calculate top cities
    const cityCounts = new Map<string, number>();
    for (const event of allEvents) {
      const locations = event.metadata?.locations ?? [];
      for (const location of locations) {
        if (location.city) {
          cityCounts.set(location.city, (cityCounts.get(location.city) ?? 0) + 1);
        }
      }
      // Also check single location field
      const singleLocation = event.metadata?.location;
      if (singleLocation?.city) {
        cityCounts.set(singleLocation.city, (cityCounts.get(singleLocation.city) ?? 0) + 1);
      }
    }

    const topCities = Array.from(cityCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return {
      articlesCount: allEvents.length,
      sourcesCount: allSources.size,
      topMentioned: topPeople,
      topCities,
    };
  }, [currentEvents, archiveEvents]);

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
      <h3 className="text-zinc-900 font-semibold mb-4">{t('stats.title')}</h3>
      <div className="grid grid-cols-2 gap-3">
        {statItems.map((item) => (
          <div
            key={item.labelKey}
            className="bg-zinc-50 rounded-lg p-3 text-center"
          >
            <i className={`${item.icon} text-lg text-zinc-400 mb-1`} />
            <div
              className={`text-xl font-semibold text-zinc-900 ${
                loading ? 'animate-pulse' : ''
              }`}
            >
              {loading ? '...' : formatNumber(item.value)}
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">
              {t(item.labelKey)}
            </div>
          </div>
        ))}
      </div>

      {/* Top 10 most mentioned people */}
      {topMentioned.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 text-zinc-500 text-[11px] mb-2">
            <i className="ri-user-star-line" />
            {t('stats.mostMentioned')}
          </div>
          <div className={`space-y-1 ${loading ? 'animate-pulse' : ''}`}>
            {topMentioned.map((person, index) => (
              <div
                key={person.name}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-zinc-700 truncate flex-1">
                  <span className="text-zinc-400 text-xs mr-1.5">{index + 1}.</span>
                  {person.name}
                </span>
                <span className="text-zinc-400 text-xs ml-2">{person.count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top 10 cities */}
      {topCities.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 text-zinc-500 text-[11px] mb-2">
            <i className="ri-map-pin-line" />
            {t('stats.topCities')}
          </div>
          <div className={`space-y-1 ${loading ? 'animate-pulse' : ''}`}>
            {topCities.map((city, index) => (
              <div
                key={city.name}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-zinc-700 truncate flex-1">
                  <span className="text-zinc-400 text-xs mr-1.5">{index + 1}.</span>
                  {city.name}
                </span>
                <span className="text-zinc-400 text-xs ml-2">{city.count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
