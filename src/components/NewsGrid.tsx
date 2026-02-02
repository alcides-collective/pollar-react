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
import { CategoryCarousel } from './news/CategoryCarousel';
import { LatestEvents, NewsletterSection, MapSection, AboutSection, ContactSection } from './news/sidebar';

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
      <section className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="text-zinc-500 text-center py-12">Ładowanie...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="text-red-500 text-center py-12">Błąd: {error.message}</div>
      </section>
    );
  }

  return (
    <section className="max-w-[1400px] mx-auto px-0 lg:px-6 pb-10">
      <div className="border border-zinc-200">
        {/* Market Ticker */}
        <MarketTicker />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]">
        {/* Main Content */}
        <div className="min-w-0 overflow-hidden lg:border-r border-zinc-200 divide-y divide-zinc-200">
          <FeaturedSection events={featured} />

          <CategoryTabs groups={categoryGroups} />

          <DoubleHeroSection events={doubleHero1} />

          {!isFiltered && brief && <DailyBriefSection brief={brief} />}

          <DoubleHeroSection events={doubleHero2} reversed />

          {!isFiltered && <FelietonySection felietony={felietony} />}
        </div>

        {/* Sidebar */}
        <aside className="divide-y divide-zinc-200">
          <LatestEvents events={latestEvents} />
          <NewsletterSection />
          <MapSection />
          <AboutSection />
          <ContactSection />
        </aside>
        </div>
      </div>

      {/* More News - Full Width, grouped by category with carousel */}
      <div className="border border-t-0 border-zinc-200">
        {eventsByCategory.map(({ category, events }) => (
          <CategoryCarousel key={category} category={category} events={events} />
        ))}
      </div>
    </section>
  );
}
