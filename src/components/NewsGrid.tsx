import { useMemo } from 'react';
import { useBrief } from '../hooks/useBrief';
import { useFelietony } from '../hooks/useFelietony';
import { useEventGroupsWithArchive } from '../hooks/useEventSelectors';
import { useSelectedCategory } from '../stores/uiStore';
import { useEvents } from '../stores/eventsStore';
import { useLanguage } from '../stores/languageStore';
import { MarketTicker } from './MarketTicker';
import { FeaturedSection } from './news/FeaturedSection';
import { CategoryTabs } from './news/CategoryTabs';
import { DoubleHeroSection } from './news/DoubleHeroSection';
import { DailyBriefSection } from './news/DailyBriefSection';
import { FelietonySection } from './news/FelietonySection';
import { DiscoverSection } from './news/DiscoverSection';
import { OlympicsSection, isOlympicEvent } from './news/OlympicsSection';
import { CategoryCarousel } from './news/CategoryCarousel';
import { LatestEvents, /* NewsletterSection, */ MapSection, AboutSection, ContactSection, VersionSection, StatsSection } from './news/sidebar';
import { AISidebarWidget } from './ai';
import { LoadingSpinner } from './common/LoadingSpinner';
import { LazySection } from './common/LazySection';

export function NewsGrid() {
  const selectedCategory = useSelectedCategory();
  const { brief } = useBrief();
  const { felietony } = useFelietony();
  const language = useLanguage();
  const isFiltered = !!selectedCategory;
  const {
    featured,
    categoryGroups,
    doubleHeroSections,
    eventsByCategory,
    latestEvents,
    loading,
    error,
  } = useEventGroupsWithArchive();

  const { events: allEvents } = useEvents({ limit: 100, lang: language });
  const showOlympics = isFiltered && selectedCategory === 'Sport'
    && Date.now() >= new Date('2026-02-06').getTime()
    && Date.now() <= new Date('2026-02-23').getTime();

  const olympicEvents = useMemo(
    () => showOlympics
      ? allEvents
          .filter(e => e.category === 'Sport' && isOlympicEvent(e))
          .sort((a, b) => b.trendingScore - a.trendingScore)
          .slice(0, 4)
      : [],
    [allEvents, showOlympics]
  );

  // Exclude olympic events from other sections to avoid duplicates
  const olympicIds = useMemo(() => new Set(olympicEvents.map(e => e.id)), [olympicEvents]);
  const filteredFeatured = useMemo(() => olympicIds.size > 0 ? featured.filter(e => !olympicIds.has(e.id)) : featured, [featured, olympicIds]);
  const filteredCategoryGroups = useMemo(() => olympicIds.size > 0 ? categoryGroups.map(([label, evts]) => [label, evts.filter(e => !olympicIds.has(e.id))] as [string, typeof evts]).filter(([, evts]) => evts.length > 0) : categoryGroups, [categoryGroups, olympicIds]);
  const filteredDoubleHero = useMemo(() => olympicIds.size > 0 ? doubleHeroSections.map(evts => evts.filter(e => !olympicIds.has(e.id))).filter(evts => evts.length === 2) : doubleHeroSections, [doubleHeroSections, olympicIds]);
  const filteredLatest = useMemo(() => olympicIds.size > 0 ? latestEvents.filter(e => !olympicIds.has(e.id)) : latestEvents, [latestEvents, olympicIds]);
  const filteredByCategory = useMemo(() => olympicIds.size > 0 ? eventsByCategory.map(({ category, events }) => ({ category, events: events.filter(e => !olympicIds.has(e.id)) })).filter(({ events }) => events.length > 0) : eventsByCategory, [eventsByCategory, olympicIds]);

  if (loading && featured.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <section className="max-w-[1400px] mx-auto px-4 pb-6">
        <div className="text-red-500 text-center py-12">Błąd: {error.message}</div>
      </section>
    );
  }

  return (
    <section className="max-w-[1400px] mx-auto px-0 lg:px-6 pb-10 -mt-3">
      {/* SEO: Hidden h1 for search engines and screen readers */}
      <h1 className="sr-only">Pollar News - Wszystkie najważniejsze wiadomości w jednym miejscu</h1>
      <div className="border border-divider">
        {/* Market Ticker */}
        <MarketTicker />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]">
        {/* Main Content */}
        <div className="min-w-0 overflow-hidden lg:border-r border-divider divide-y divide-divider [&>*:last-child]:border-b [&>*:last-child]:border-divider">
          {!isFiltered && brief && <DailyBriefSection brief={brief} />}

          {showOlympics && olympicEvents.length > 0 && (
            <LazySection height="300px">
              <OlympicsSection events={olympicEvents} />
            </LazySection>
          )}

          <FeaturedSection events={filteredFeatured} />

          <CategoryTabs groups={filteredCategoryGroups} />

          {/* Hero sections interspersed with other content */}
          {filteredDoubleHero[0] && (
            <LazySection height="300px">
              <DoubleHeroSection events={filteredDoubleHero[0]} />
            </LazySection>
          )}

          {!isFiltered && (
            <LazySection height="200px">
              <DiscoverSection />
            </LazySection>
          )}

          {filteredDoubleHero[1] && (
            <LazySection height="300px">
              <DoubleHeroSection events={filteredDoubleHero[1]} reversed />
            </LazySection>
          )}

          {!isFiltered && (
            <LazySection height="400px">
              <FelietonySection felietony={felietony} />
            </LazySection>
          )}

          {/* Additional hero sections when categoryGroups is empty */}
          {filteredDoubleHero.slice(2).map((events, idx) => (
            <LazySection key={`hero-${idx + 2}`} height="300px">
              <DoubleHeroSection events={events} reversed={idx % 2 === 1} />
            </LazySection>
          ))}
        </div>

        {/* Sidebar - hidden on mobile */}
        <aside className="hidden lg:block divide-y divide-divider [&>*:last-child]:border-b [&>*:last-child]:border-divider">
          <AISidebarWidget />
          <LatestEvents events={filteredLatest} />
          {/* <NewsletterSection /> */}
          <LazySection height="300px" rootMargin="100px">
            <MapSection />
          </LazySection>
          <AboutSection />
          <ContactSection />
          <VersionSection />
          <StatsSection />
          {/* CategoryCarousel in sidebar - at the end */}
          {/* When filtered: list view, when not filtered: sidebar carousel */}
          {filteredByCategory.map(({ category, events }) => (
            <CategoryCarousel
              key={category}
              category={category}
              events={events}
              variant={isFiltered ? 'list' : 'sidebar'}
            />
          ))}
        </aside>
        </div>
      </div>

      {/* More News - Mobile only (desktop has it in sidebar) */}
      <div className="lg:hidden border border-t-0 border-divider">
        {filteredByCategory.map(({ category, events }) => (
          isFiltered ? (
            <CategoryCarousel
              key={category}
              category={category}
              events={events}
              variant="list"
            />
          ) : (
            <LazySection key={category} height="280px">
              <CategoryCarousel category={category} events={events} />
            </LazySection>
          )
        ))}
      </div>
    </section>
  );
}
