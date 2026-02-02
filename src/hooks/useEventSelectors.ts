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

// Main hook that combines all selectors
export function useEventGroups(): EventGroups & { loading: boolean; error: Error | null } {
  const { events, loading, error } = useEvents({ limit: 100, lang: 'pl', articleFields: 'minimal' });
  const selectedCategory = useSelectedCategory();

  const filteredEvents = useMemo(() => {
    if (!selectedCategory) return events;
    return events.filter(e => e.category === selectedCategory);
  }, [events, selectedCategory]);

  // Featured events: prioritize 15+ sources, fill remaining with highest sourceCount
  const featured = useMemo(() => {
    const withMinSources = filteredEvents.filter(e => e.sourceCount >= 15);
    if (withMinSources.length >= 3) {
      return withMinSources.slice(0, 3);
    }
    const usedIds = new Set(withMinSources.map(e => e.id));
    const remaining = filteredEvents
      .filter(e => !usedIds.has(e.id))
      .sort((a, b) => b.sourceCount - a.sourceCount)
      .slice(0, 3 - withMinSources.length);
    return [...withMinSources, ...remaining];
  }, [filteredEvents]);

  // Group events by shared people/countries for tabs
  const categoryGroups = useMemo(() => {
    const featuredIds = new Set(featured.map(e => e.id));
    const eventsForGrid = filteredEvents.filter(e => !featuredIds.has(e.id));
    const usedIds = new Set<string>();
    const groups: Array<[string, Event[]]> = [];

    const findSimilar = (anchor: Event, pool: Event[]) => {
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
  }, [filteredEvents, featured]);

  // Collect all used IDs for remaining calculations
  const usedIds = useMemo(() => {
    const ids = new Set<string>(featured.map(e => e.id));
    categoryGroups.forEach(([_, events]) => events.forEach(e => ids.add(e.id)));
    return ids;
  }, [featured, categoryGroups]);

  // Double hero events
  const doubleHero1 = useMemo(() => {
    const available = filteredEvents.filter(e => !usedIds.has(e.id));
    return available.slice(0, 2);
  }, [filteredEvents, usedIds]);

  const doubleHero2 = useMemo(() => {
    const ids = new Set(usedIds);
    doubleHero1.forEach(e => ids.add(e.id));
    const available = filteredEvents.filter(e => !ids.has(e.id));
    return available.slice(0, 2);
  }, [filteredEvents, usedIds, doubleHero1]);

  // More events
  const moreEvents = useMemo(() => {
    const ids = new Set(usedIds);
    doubleHero1.forEach(e => ids.add(e.id));
    doubleHero2.forEach(e => ids.add(e.id));
    return filteredEvents.filter(e => !ids.has(e.id));
  }, [filteredEvents, usedIds, doubleHero1, doubleHero2]);

  // Group by category
  const eventsByCategory = useMemo(() => {
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

    return sortedCategories.map(category => ({
      category,
      events: grouped.get(category)!
    }));
  }, [moreEvents]);

  // Latest events
  const latestEvents = useMemo(() => {
    return [...filteredEvents]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 6);
  }, [filteredEvents]);

  return {
    featured,
    categoryGroups,
    doubleHero1,
    doubleHero2,
    moreEvents,
    eventsByCategory,
    latestEvents,
    loading,
    error,
  };
}

// Hook for events with archive support (used when category is selected)
export function useEventGroupsWithArchive(): EventGroups & { loading: boolean; error: Error | null } {
  const selectedCategory = useSelectedCategory();
  const { events, loading, error } = useEvents({
    limit: 100,
    lang: 'pl',
    includeArchive: !!selectedCategory,
    articleFields: 'minimal',
  });

  const filteredEvents = useMemo(() => {
    if (!selectedCategory) return events;
    return events.filter(e => e.category === selectedCategory);
  }, [events, selectedCategory]);

  // Featured events: prioritize 15+ sources, fill remaining with highest sourceCount
  const featured = useMemo(() => {
    const withMinSources = filteredEvents.filter(e => e.sourceCount >= 15);
    if (withMinSources.length >= 3) {
      return withMinSources.slice(0, 3);
    }
    const usedIds = new Set(withMinSources.map(e => e.id));
    const remaining = filteredEvents
      .filter(e => !usedIds.has(e.id))
      .sort((a, b) => b.sourceCount - a.sourceCount)
      .slice(0, 3 - withMinSources.length);
    return [...withMinSources, ...remaining];
  }, [filteredEvents]);

  // Group events by shared people/countries for tabs
  const categoryGroups = useMemo(() => {
    const featuredIds = new Set(featured.map(e => e.id));
    const eventsForGrid = filteredEvents.filter(e => !featuredIds.has(e.id));
    const usedIds = new Set<string>();
    const groups: Array<[string, Event[]]> = [];

    const findSimilar = (anchor: Event, pool: Event[]) => {
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
  }, [filteredEvents, featured]);

  // Collect all used IDs for remaining calculations
  const usedIds = useMemo(() => {
    const ids = new Set<string>(featured.map(e => e.id));
    categoryGroups.forEach(([_, events]) => events.forEach(e => ids.add(e.id)));
    return ids;
  }, [featured, categoryGroups]);

  // Double hero events
  const doubleHero1 = useMemo(() => {
    const available = filteredEvents.filter(e => !usedIds.has(e.id));
    return available.slice(0, 2);
  }, [filteredEvents, usedIds]);

  const doubleHero2 = useMemo(() => {
    const ids = new Set(usedIds);
    doubleHero1.forEach(e => ids.add(e.id));
    const available = filteredEvents.filter(e => !ids.has(e.id));
    return available.slice(0, 2);
  }, [filteredEvents, usedIds, doubleHero1]);

  // More events
  const moreEvents = useMemo(() => {
    const ids = new Set(usedIds);
    doubleHero1.forEach(e => ids.add(e.id));
    doubleHero2.forEach(e => ids.add(e.id));
    return filteredEvents.filter(e => !ids.has(e.id));
  }, [filteredEvents, usedIds, doubleHero1, doubleHero2]);

  // Group by category
  const eventsByCategory = useMemo(() => {
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

    return sortedCategories.map(category => ({
      category,
      events: grouped.get(category)!
    }));
  }, [moreEvents]);

  // Latest events
  const latestEvents = useMemo(() => {
    return [...filteredEvents]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 6);
  }, [filteredEvents]);

  return {
    featured,
    categoryGroups,
    doubleHero1,
    doubleHero2,
    moreEvents,
    eventsByCategory,
    latestEvents,
    loading,
    error,
  };
}
