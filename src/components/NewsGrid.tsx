import { useMemo, useState } from 'react';
import { useEvents } from '../hooks/useEvents';
import { useBrief } from '../hooks/useBrief';
import { useCategory } from '../context/CategoryContext';
import dailyBriefImg from '../assets/images/daily/day.png';

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'teraz';
  if (diffMins < 60) return `${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} godz.`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} dni`;
}

export function NewsGrid() {
  const { selectedCategory } = useCategory();
  const { brief } = useBrief({ lang: 'pl' });
  const { events, loading, error } = useEvents({
    limit: 100,
    lang: 'pl',
    includeArchive: !!selectedCategory
  });

  const categories = useMemo(() => {
    const uniqueCategories = new Set(events.map(e => e.category).filter(Boolean));
    return Array.from(uniqueCategories).slice(0, 8);
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (!selectedCategory) return events;
    return events.filter(e => e.category === selectedCategory);
  }, [events, selectedCategory]);

  // Featured events: minimum 15 unique sources, take top 3
  const featuredEvents = useMemo(() => {
    return filteredEvents
      .filter(e => e.sourceCount >= 15)
      .slice(0, 3);
  }, [filteredEvents]);

  // Group events by shared people/countries for tabs (excluding featured)
  const categoryGroups = useMemo(() => {
    const featuredIds = new Set(featuredEvents.map(e => e.id));
    const eventsForGrid = filteredEvents.filter(e => !featuredIds.has(e.id));
    const usedIds = new Set<string>();
    const groups: Array<[string, typeof eventsForGrid]> = [];

    // Find similar events by same category AND shared people or countries
    const findSimilar = (anchor: typeof eventsForGrid[0], pool: typeof eventsForGrid) => {
      const anchorCategory = anchor.category;
      const anchorPeople = new Set(anchor.metadata?.mentionedPeople?.map(p => p.name) || []);
      const anchorCountries = new Set(anchor.metadata?.mentionedCountries || []);

      return pool.filter(event => {
        if (usedIds.has(event.id)) return false;
        // Must be same category
        if (event.category !== anchorCategory) return false;

        const eventPeople = event.metadata?.mentionedPeople?.map(p => p.name) || [];
        const eventCountries = event.metadata?.mentionedCountries || [];

        // Check for shared people
        const sharedPeople = eventPeople.some(p => anchorPeople.has(p));
        // Check for shared countries
        const sharedCountries = eventCountries.some(c => anchorCountries.has(c));

        return sharedPeople || sharedCountries;
      });
    };

    // Build 4 groups
    for (const event of eventsForGrid) {
      if (groups.length >= 4) break;
      if (usedIds.has(event.id)) continue;

      usedIds.add(event.id);
      const similar = findSimilar(event, eventsForGrid).slice(0, 2);
      similar.forEach(e => usedIds.add(e.id));

      const groupEvents = [event, ...similar];
      const label = event.metadata?.ultraShortHeadline || event.category || 'Inne';
      groups.push([label, groupEvents]);
    }

    return groups;
  }, [filteredEvents, featuredEvents]);

  const [selectedTab, setSelectedTab] = useState(0);
  const selectedGroup = categoryGroups[selectedTab];

  // Double hero events (next 2 after tabs)
  const doubleHeroEvents = useMemo(() => {
    const usedIds = new Set<string>(featuredEvents.map(e => e.id));
    categoryGroups.forEach(([_, events]) => events.forEach(e => usedIds.add(e.id)));
    const available = filteredEvents.filter(e => !usedIds.has(e.id));
    return available.slice(0, 2);
  }, [filteredEvents, categoryGroups, featuredEvents]);

  // Events not used in groups go to "More News"
  const moreEvents = useMemo(() => {
    const usedIds = new Set<string>(featuredEvents.map(e => e.id));
    categoryGroups.forEach(([_, events]) => events.forEach(e => usedIds.add(e.id)));
    doubleHeroEvents.forEach(e => usedIds.add(e.id));
    return filteredEvents.filter(e => !usedIds.has(e.id));
  }, [filteredEvents, categoryGroups, featuredEvents, doubleHeroEvents]);

  const latestEvents = useMemo(() => {
    return [...filteredEvents]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 6);
  }, [filteredEvents]);

  if (loading) {
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
    <section className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] border border-zinc-200">
        {/* Main Content */}
        <div className="border-r border-zinc-200">
          {/* Featured Section - 1 main + 2 breaking */}
          {featuredEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 border-b border-zinc-200">
              {/* Left: Main event image */}
              <div className="p-6 border-r border-zinc-200">
                {featuredEvents[0].imageUrl && (
                  <img
                    src={featuredEvents[0].imageUrl}
                    alt=""
                    className="w-full aspect-video object-cover"
                  />
                )}
              </div>

              {/* Right: Main title + 2 breaking events */}
              <div className="p-6">
                <span className="text-zinc-500 text-sm">{featuredEvents[0].category}</span>
                <h2 className="text-3xl font-bold text-zinc-900 mt-1 mb-4 leading-tight hover:underline cursor-pointer">
                  {featuredEvents[0].title}
                </h2>

                {/* Secondary featured events */}
                <div className="border-t border-zinc-200 pt-4 mt-4 space-y-4">
                  {featuredEvents.slice(1, 3).map((event) => (
                    <div key={event.id} className="hover:bg-zinc-50 transition-colors cursor-pointer flex gap-3 p-2 -mx-2 rounded">
                      {event.imageUrl && (
                        <img
                          src={event.imageUrl}
                          alt=""
                          className="w-28 aspect-video object-cover shrink-0"
                        />
                      )}
                      <div>
                        <span className="text-zinc-400 text-xs">{event.category}</span>
                        <h3 className="text-zinc-900 font-semibold text-sm leading-tight">
                          {event.title}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Category tabs with switching */}
          <div className="border-b border-zinc-200">
            {/* Tab headers */}
            <div className="flex items-center border-b border-zinc-200">
              {categoryGroups.map(([_, events], index) => (
                <button
                  key={index}
                  onClick={() => setSelectedTab(index)}
                  className={`text-sm px-6 py-4 transition-colors border-r border-zinc-200 last:border-r-0 ${
                    selectedTab === index
                      ? 'text-zinc-900 font-bold bg-zinc-50'
                      : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  {events[0]?.metadata?.ultraShortHeadline || events[0]?.category}
                </button>
              ))}
            </div>

            {/* Selected tab content */}
            {selectedGroup && (
              <div className="flex">
                {/* First event with image */}
                {selectedGroup[1][0] && (
                  <article className="group cursor-pointer flex gap-4 flex-[2] p-6 border-r border-zinc-200">
                    {selectedGroup[1][0].imageUrl && (
                      <div className="w-80 shrink-0">
                        <img
                          src={selectedGroup[1][0].imageUrl}
                          alt=""
                          className="w-full aspect-video object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <span className="text-zinc-400 text-xs">{selectedGroup[1][0].category}</span>
                      <h4 className="text-zinc-900 font-semibold text-xl leading-tight group-hover:underline">
                        {selectedGroup[1][0].title}
                      </h4>
                      <p className="text-sm text-zinc-600 mt-2 leading-snug">
                        {selectedGroup[1][0].lead}
                      </p>
                    </div>
                  </article>
                )}
                {/* Other events */}
                <div className="flex-1 divide-y divide-zinc-200">
                  {selectedGroup[1].slice(1).map((event) => (
                    <article key={event.id} className="group cursor-pointer p-6 hover:bg-zinc-50 transition-colors">
                      <h4 className="text-zinc-600 text-sm leading-tight group-hover:underline">
                        {event.title}
                      </h4>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Double Hero Section */}
          {doubleHeroEvents.length === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] border-b border-zinc-200">
              {/* Left - smaller */}
              <article className="group cursor-pointer p-6 border-r border-zinc-200 hover:bg-zinc-50 transition-colors">
                {doubleHeroEvents[0].imageUrl && (
                  <img
                    src={doubleHeroEvents[0].imageUrl}
                    alt=""
                    className="w-full aspect-video object-cover mb-4"
                  />
                )}
                <span className="text-zinc-400 text-xs">{doubleHeroEvents[0].category}</span>
                <h3 className="text-xl text-zinc-900 font-semibold leading-tight group-hover:underline">
                  {doubleHeroEvents[0].title}
                </h3>
                <p className="text-sm text-zinc-600 mt-2 leading-snug">
                  {doubleHeroEvents[0].lead}
                </p>
              </article>

              {/* Right - larger */}
              <article className="group cursor-pointer p-6 hover:bg-zinc-50 transition-colors">
                {doubleHeroEvents[1].imageUrl && (
                  <img
                    src={doubleHeroEvents[1].imageUrl}
                    alt=""
                    className="w-full aspect-video object-cover mb-4"
                  />
                )}
                <span className="text-zinc-400 text-xs">{doubleHeroEvents[1].category}</span>
                <h3 className="text-2xl text-zinc-900 font-semibold leading-tight group-hover:underline">
                  {doubleHeroEvents[1].title}
                </h3>
                <p className="text-zinc-600 mt-3 leading-snug">
                  {doubleHeroEvents[1].lead}
                </p>
              </article>
            </div>
          )}

          {/* Daily Brief Hero */}
          {brief && (
            <div className="border-b border-zinc-200 bg-sky-50 hover:bg-sky-100 transition-colors cursor-pointer">
              <p className="text-sm text-sky-700 px-6 pt-6 pb-4">
                Daily Brief na {new Date(brief.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}{brief.greeting && ` — ${brief.greeting}`}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 px-6 pb-6">
                <img
                  src={dailyBriefImg}
                  alt=""
                  className="w-full aspect-video object-cover"
                />
                <div>
                  <h2 className="text-3xl font-bold text-zinc-900 mb-4 leading-tight hover:underline">
                    {brief.headline}
                  </h2>
                  <p className="text-lg text-zinc-700 leading-snug">
                    {brief.lead}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* More News */}
          <div className="grid grid-cols-1 md:grid-cols-3">
            {moreEvents.map((event, index) => (
              <article
                key={event.id}
                className={`group cursor-pointer p-6 hover:bg-zinc-50 transition-colors border-b border-zinc-200 last:border-b-0 ${
                  (index + 1) % 3 !== 0 ? 'md:border-r' : ''
                }`}
              >
                {event.imageUrl && (
                  <img
                    src={event.imageUrl}
                    alt=""
                    className="w-full aspect-video object-cover mb-4"
                  />
                )}
                <span className="text-zinc-400 text-xs">{event.category}</span>
                <h3 className="text-zinc-900 font-semibold leading-tight group-hover:underline">
                  {event.title}
                </h3>
              </article>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="divide-y divide-zinc-200">
          {/* Latest */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-red-500 font-semibold">Najnowsze</h3>
              <button className="text-sm text-zinc-500 border border-zinc-300 rounded px-3 py-1 hover:border-zinc-400 transition-colors">
                Wszystkie
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <div className="space-y-5">
              {latestEvents.map((event) => (
                <article key={event.id} className="flex gap-4 group cursor-pointer">
                  <span className="text-red-500 text-xs shrink-0 w-12">{formatTimeAgo(event.updatedAt)}</span>
                  <div>
                    <span className="text-zinc-400 text-xs block">{event.category}</span>
                    <h4 className="text-sm text-zinc-600 leading-tight group-hover:text-zinc-900 transition-colors">
                      {event.title}
                    </h4>
                  </div>
                </article>
              ))}
            </div>

            <a href="#" className="text-zinc-500 text-sm mt-4 inline-flex items-center gap-1 hover:text-zinc-900 transition-colors">
              Zobacz wszystkie
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* In Focus */}
          <div className="p-6">
            <h3 className="text-zinc-900 font-semibold mb-3">Kategorie</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <a
                  key={category}
                  href="#"
                  className="text-sm text-zinc-600 border border-zinc-300 rounded-full px-3 py-1 hover:border-zinc-400 hover:text-zinc-900 transition-colors"
                >
                  {category}
                </a>
              ))}
            </div>
          </div>

          {/* Listen, Watch and Catch Up */}
          <div className="p-6">
            <h3 className="text-zinc-900 font-semibold mb-3">Słuchaj i oglądaj</h3>
            <div className="bg-zinc-50 p-4">
              <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Newsletter</p>
              <h4 className="text-zinc-900 font-semibold leading-tight">
                Zapisz się do naszego newslettera
              </h4>
            </div>
          </div>

          {/* Pollar News Now */}
          <div className="p-6">
            <h3 className="text-zinc-900 font-semibold mb-3">Pollar News Now</h3>
            <p className="text-zinc-500 text-sm">
              Słuchaj najnowszych wiadomości z Polski i świata
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
