import { useMemo } from 'react';
import type { Event, FreshnessLevel } from '../types/events';
import { CATEGORY_ORDER } from '../constants/categories';
import { useEvents } from '../stores/eventsStore';
import { useSelectedCategory } from '../stores/uiStore';
import { useFavoriteCategories } from '../stores/userStore';
import { useLanguage } from '../stores/languageStore';

// Fresh events can appear in all sections (featured, hero, tabs, latest)
// OLD events are only shown in CategoryCarousel at the bottom
const FRESH_LEVELS: FreshnessLevel[] = ['BREAKING', 'HOT', 'RECENT', 'AGING'];

function isFreshEvent(event: Event): boolean {
  return FRESH_LEVELS.includes(event.freshnessLevel);
}

export interface EventGroups {
  featured: Event[];
  categoryGroups: Array<[string, Event[]]>;
  doubleHeroSections: Event[][]; // Dynamic array of hero sections (2 events each)
  moreEvents: Event[];
  eventsByCategory: Array<{ category: string; events: Event[] }>;
  latestEvents: Event[];
}

interface UseEventGroupsOptions {
  includeArchive?: boolean;
}

function computeEventGroups(
  events: Event[],
  selectedCategory: string | null,
  favoriteCategories: string[] = []
): Omit<EventGroups, 'loading' | 'error'> {
  const filteredEvents = selectedCategory
    ? events.filter(e => e.category === selectedCategory)
    : events;

  // Boost events from favorite categories
  // Create a map with boosted scores for sorting/selection
  const boostedEvents = filteredEvents
    .map(e => {
      const isFavorite = favoriteCategories.includes(e.category);
      return {
        ...e,
        // Boost sourceCount by 10 and trendingScore by 1.5x for favorites
        sourceCount: isFavorite ? e.sourceCount + 10 : e.sourceCount,
        trendingScore: isFavorite ? e.trendingScore * 1.5 : e.trendingScore,
      };
    })
    // Sort by boosted trendingScore (favorites will naturally rise to top)
    .sort((a, b) => b.trendingScore - a.trendingScore);

  // Split into fresh (for main sections) and all events (for carousel)
  // OLD events should only appear in CategoryCarousel at the bottom
  const freshBoostedEvents = boostedEvents.filter(isFreshEvent);

  // Featured events: prioritize 15+ sources, fill remaining with highest sourceCount
  // Only use FRESH events for featured section
  const withMinSources = freshBoostedEvents.filter(e => e.sourceCount >= 15);
  let featured: Event[];
  if (withMinSources.length >= 3) {
    featured = withMinSources.slice(0, 3);
  } else {
    const usedIds = new Set(withMinSources.map(e => e.id));
    const remaining = freshBoostedEvents
      .filter(e => !usedIds.has(e.id))
      .sort((a, b) => b.sourceCount - a.sourceCount)
      .slice(0, 3 - withMinSources.length);
    featured = [...withMinSources, ...remaining];
  }

  // Group events by shared people/countries for tabs
  // Only use FRESH events for category tabs
  const featuredIds = new Set(featured.map(e => e.id));
  const eventsForGrid = freshBoostedEvents.filter(e => !featuredIds.has(e.id));
  const groupUsedIds = new Set<string>();
  const groups: Array<[string, Event[]]> = [];

  // === DYNAMIC ALLOCATION ===
  // Priority: Hero sections FIRST (up to 6 sections = 12 events)
  // Then CategoryGroups get remaining events with similarities

  const MAX_HERO_SECTIONS = 6;
  const HERO_RESERVE = MAX_HERO_SECTIONS * 2; // 12 events for 6 sections
  const availableCount = eventsForGrid.length;

  // Reserve events for hero sections first
  const reserveForHero = Math.min(HERO_RESERVE, availableCount);
  const maxEventsForGroups = Math.max(0, availableCount - reserveForHero);

  const findSimilar = (anchor: Event, pool: Event[], usedIds: Set<string>) => {
    const anchorCategory = anchor.category;
    const anchorPeople = new Set(anchor.metadata?.mentionedPeople?.map(p => p.name) || []);
    const anchorCountries = new Set(anchor.metadata?.mentionedCountries || []);

    return pool.filter(event => {
      if (usedIds.has(event.id)) return false;
      if (event.category !== anchorCategory) return false;

      const eventPeople = event.metadata?.mentionedPeople?.map(p => p.name) || [];
      const eventCountries = event.metadata?.mentionedCountries || [];

      const sharedPeople = eventPeople.some(p => anchorPeople.has(p));
      const sharedCountries = eventCountries.some(c => anchorCountries.has(c));

      return sharedPeople || sharedCountries;
    });
  };

  // Build groups only from events AFTER hero reservation
  let groupEventCount = 0;
  for (const event of eventsForGrid) {
    if (groups.length >= 4) break;
    if (groupEventCount >= maxEventsForGroups) break;
    if (groupUsedIds.has(event.id)) continue;

    // Find similar events
    const remainingSlots = maxEventsForGroups - groupEventCount;
    const similar = findSimilar(event, eventsForGrid, groupUsedIds).slice(0, Math.min(2, remainingSlots - 1));

    // Only create group if we have at least 1 similar event AND budget
    if (similar.length === 0 || remainingSlots < 2) continue;

    groupUsedIds.add(event.id);
    groupEventCount++;
    similar.forEach(e => {
      groupUsedIds.add(e.id);
      groupEventCount++;
    });

    const groupEvents = [event, ...similar];
    const label = event.metadata?.ultraShortHeadline || event.category || 'Inne';
    groups.push([label, groupEvents]);
  }

  // Collect all used IDs (featured + groups)
  const usedIds = new Set<string>(featured.map(e => e.id));
  groups.forEach(([_, evts]) => evts.forEach(e => usedIds.add(e.id)));

  // Double hero sections - use FRESH first, then OLD as fallback (up to 6 sections)
  const doubleHeroSections: Event[][] = [];
  const heroUsedIds = new Set(usedIds);

  for (let i = 0; i < MAX_HERO_SECTIONS; i++) {
    // First try FRESH events
    let availableForHero = freshBoostedEvents.filter(e => !heroUsedIds.has(e.id));

    // If not enough FRESH, fall back to ALL events (including OLD)
    if (availableForHero.length < 2) {
      availableForHero = boostedEvents.filter(e => !heroUsedIds.has(e.id));
    }

    if (availableForHero.length < 2) break; // Really no more events

    const heroSection = availableForHero.slice(0, 2);
    doubleHeroSections.push(heroSection);
    heroSection.forEach(e => heroUsedIds.add(e.id));
  }

  // More events for CategoryCarousel - includes ALL events (fresh + OLD)
  // that weren't used in main sections above
  const moreEvents = boostedEvents.filter(e => !heroUsedIds.has(e.id));

  // Group by category
  const grouped = new Map<string, Event[]>();
  moreEvents.forEach(event => {
    const category = event.category || 'Inne';
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category)!.push(event);
  });

  const sortedCategories = Array.from(grouped.keys()).sort((a, b) => {
    // Favorite categories first
    const aFav = favoriteCategories.includes(a) ? 0 : 1;
    const bFav = favoriteCategories.includes(b) ? 0 : 1;
    if (aFav !== bFav) return aFav - bFav;
    // Then by standard order
    const indexA = CATEGORY_ORDER.indexOf(a);
    const indexB = CATEGORY_ORDER.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  const eventsByCategory = sortedCategories.map(category => ({
    category,
    events: grouped.get(category)!
  }));

  // Latest events - only FRESH events (sorted by date)
  // OLD events shouldn't appear in "Najnowsze" sidebar
  const latestEvents = [...freshBoostedEvents]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  return {
    featured,
    categoryGroups: groups,
    doubleHeroSections,
    moreEvents,
    eventsByCategory,
    latestEvents,
  };
}

// Main hook - supports both regular and archive modes
export function useEventGroups(
  options: UseEventGroupsOptions = {}
): EventGroups & { loading: boolean; error: Error | null } {
  const selectedCategory = useSelectedCategory();
  const favoriteCategories = useFavoriteCategories();
  const language = useLanguage();
  const includeArchive = options.includeArchive ?? !!selectedCategory;

  const { events, loading, error } = useEvents({
    limit: 100,
    lang: language,
    includeArchive,
    articleFields: 'minimal',
  });

  const groups = useMemo(
    () => computeEventGroups(events, selectedCategory, favoriteCategories),
    [events, selectedCategory, favoriteCategories]
  );

  return {
    ...groups,
    loading: loading ?? false,
    error,
  };
}

// Backwards-compatible alias
export function useEventGroupsWithArchive(): EventGroups & { loading: boolean; error: Error | null } {
  return useEventGroups({ includeArchive: true });
}
