import { useMemo } from 'react';
import type { Event } from '../types/events';
import { CATEGORY_ORDER } from '../constants/categories';
import { useEvents } from '../stores/eventsStore';
import { useSelectedCategory } from '../stores/uiStore';

export interface EventGroups {
  featured: Event[];
  categoryGroups: Array<[string, Event[]]>;
  doubleHero1: Event[];
  doubleHero2: Event[];
  moreEvents: Event[];
  eventsByCategory: Array<{ category: string; events: Event[] }>;
  latestEvents: Event[];
}

interface UseEventGroupsOptions {
  includeArchive?: boolean;
}

function computeEventGroups(
  events: Event[],
  selectedCategory: string | null
): Omit<EventGroups, 'loading' | 'error'> {
  const filteredEvents = selectedCategory
    ? events.filter(e => e.category === selectedCategory)
    : events;

  // Featured events: prioritize 15+ sources, fill remaining with highest sourceCount
  const withMinSources = filteredEvents.filter(e => e.sourceCount >= 15);
  let featured: Event[];
  if (withMinSources.length >= 3) {
    featured = withMinSources.slice(0, 3);
  } else {
    const usedIds = new Set(withMinSources.map(e => e.id));
    const remaining = filteredEvents
      .filter(e => !usedIds.has(e.id))
      .sort((a, b) => b.sourceCount - a.sourceCount)
      .slice(0, 3 - withMinSources.length);
    featured = [...withMinSources, ...remaining];
  }

  // Group events by shared people/countries for tabs
  const featuredIds = new Set(featured.map(e => e.id));
  const eventsForGrid = filteredEvents.filter(e => !featuredIds.has(e.id));
  const groupUsedIds = new Set<string>();
  const groups: Array<[string, Event[]]> = [];

  const findSimilar = (anchor: Event, pool: Event[]) => {
    const anchorCategory = anchor.category;
    const anchorPeople = new Set(anchor.metadata?.mentionedPeople?.map(p => p.name) || []);
    const anchorCountries = new Set(anchor.metadata?.mentionedCountries || []);

    return pool.filter(event => {
      if (groupUsedIds.has(event.id)) return false;
      if (event.category !== anchorCategory) return false;

      const eventPeople = event.metadata?.mentionedPeople?.map(p => p.name) || [];
      const eventCountries = event.metadata?.mentionedCountries || [];

      const sharedPeople = eventPeople.some(p => anchorPeople.has(p));
      const sharedCountries = eventCountries.some(c => anchorCountries.has(c));

      return sharedPeople || sharedCountries;
    });
  };

  for (const event of eventsForGrid) {
    if (groups.length >= 4) break;
    if (groupUsedIds.has(event.id)) continue;

    groupUsedIds.add(event.id);
    const similar = findSimilar(event, eventsForGrid).slice(0, 2);
    similar.forEach(e => groupUsedIds.add(e.id));

    const groupEvents = [event, ...similar];
    const label = event.metadata?.ultraShortHeadline || event.category || 'Inne';
    groups.push([label, groupEvents]);
  }

  // Collect all used IDs
  const usedIds = new Set<string>(featured.map(e => e.id));
  groups.forEach(([_, evts]) => evts.forEach(e => usedIds.add(e.id)));

  // Double hero events
  const availableForHero1 = filteredEvents.filter(e => !usedIds.has(e.id));
  const doubleHero1 = availableForHero1.slice(0, 2);

  const hero1Ids = new Set(usedIds);
  doubleHero1.forEach(e => hero1Ids.add(e.id));
  const availableForHero2 = filteredEvents.filter(e => !hero1Ids.has(e.id));
  const doubleHero2 = availableForHero2.slice(0, 2);

  // More events
  const allUsedIds = new Set(hero1Ids);
  doubleHero2.forEach(e => allUsedIds.add(e.id));
  const moreEvents = filteredEvents.filter(e => !allUsedIds.has(e.id));

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
    const indexA = CATEGORY_ORDER.indexOf(a);
    const indexB = CATEGORY_ORDER.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  const eventsByCategory = sortedCategories.map(category => ({
    category,
    events: grouped.get(category)!
  }));

  // Latest events
  const latestEvents = [...filteredEvents]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  return {
    featured,
    categoryGroups: groups,
    doubleHero1,
    doubleHero2,
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
  const includeArchive = options.includeArchive ?? !!selectedCategory;

  const { events, loading, error } = useEvents({
    limit: 100,
    lang: 'pl',
    includeArchive,
    articleFields: 'minimal',
  });

  const groups = useMemo(
    () => computeEventGroups(events, selectedCategory),
    [events, selectedCategory]
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
