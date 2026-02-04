import { useBrief } from '../hooks/useBrief';
import { useFelietony } from '../hooks/useFelietony';
import { useEventGroupsWithArchive } from '../hooks/useEventSelectors';
import { useSelectedCategory } from '../stores/uiStore';
import { MarketTicker } from './MarketTicker';
import { FeaturedSection } from './news/FeaturedSection';
import { CategoryTabs } from './news/CategoryTabs';
import { DoubleHeroSection } from './news/DoubleHeroSection';
import { DailyBriefSection } from './news/DailyBriefSection';
import { FelietonySection } from './news/FelietonySection';
import { DiscoverSection } from './news/DiscoverSection';
import { CategoryCarousel } from './news/CategoryCarousel';
import { LatestEvents, /* NewsletterSection, */ MapSection, AboutSection, ContactSection, VersionSection } from './news/sidebar';
import { AISidebarWidget } from './ai';
import { LoadingSpinner } from './common/LoadingSpinner';
import { LazySection } from './common/LazySection';

export function NewsGrid() {
  const selectedCategory = useSelectedCategory();
  const { brief } = useBrief({ lang: 'pl' });
  const { felietony } = useFelietony();
  const isFiltered = !!selectedCategory;
  const {
    featured,
    categoryGroups,
    doubleHero1,
    doubleHero2,
    eventsByCategory,
    latestEvents,
    loading,
    error,
  } = useEventGroupsWithArchive();

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
      <div className="border border-zinc-200">
        {/* Market Ticker */}
        <MarketTicker />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]">
        {/* Main Content */}
        <div className="min-w-0 overflow-hidden lg:border-r border-zinc-200 divide-y divide-zinc-200">
          {!isFiltered && brief && <DailyBriefSection brief={brief} />}

          <FeaturedSection events={featured} />

          <CategoryTabs groups={categoryGroups} />

          <LazySection height="300px">
            <DoubleHeroSection events={doubleHero1} />
          </LazySection>

          {!isFiltered && (
            <LazySection height="200px">
              <DiscoverSection />
            </LazySection>
          )}

          <LazySection height="300px">
            <DoubleHeroSection events={doubleHero2} reversed />
          </LazySection>

          {!isFiltered && (
            <LazySection height="400px">
              <FelietonySection felietony={felietony} />
            </LazySection>
          )}
        </div>

        {/* Sidebar */}
        <aside className="divide-y divide-zinc-200">
          <AISidebarWidget />
          <LatestEvents events={latestEvents} />
          {/* <NewsletterSection /> */}
          <LazySection height="300px" rootMargin="100px">
            <MapSection />
          </LazySection>
          <AboutSection />
          <ContactSection />
          <VersionSection />
        </aside>
        </div>
      </div>

      {/* More News - Full Width, grouped by category with carousel */}
      <div className="border border-t-0 border-zinc-200">
        {eventsByCategory.map(({ category, events }) => (
          <LazySection key={category} height="280px">
            <CategoryCarousel category={category} events={events} />
          </LazySection>
        ))}
      </div>
    </section>
  );
}
