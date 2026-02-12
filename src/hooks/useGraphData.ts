import { useMemo, useCallback } from 'react';
import { useEvents } from '../stores/eventsStore';
import { useGrafStore } from '../stores/grafStore';
import { useRouteLanguage } from './useRouteLanguage';
import type { Event } from '../types/events';
import type {
  GraphData,
  GraphNode,
  GraphLink,
  ConnectionType,
} from '../types/graph';
import { CONNECTION_CONFIGS, getCategoryColor } from '../types/graph';

function calculateNodeSize(trendingScore: number): number {
  const minSize = 10;
  const maxSize = 40;
  const normalizedScore = Math.min(Math.max(trendingScore, 0), 300) / 300;
  return minSize + normalizedScore * (maxSize - minSize);
}

function findSharedItems(
  event1: Event,
  event2: Event,
  type: ConnectionType
): string[] {
  switch (type) {
    case 'people': {
      const people1 =
        event1.metadata?.mentionedPeople?.map((p) => p.name.toLowerCase()) ||
        [];
      const people2 =
        event2.metadata?.mentionedPeople?.map((p) => p.name.toLowerCase()) ||
        [];
      const shared = people1.filter((p) => people2.includes(p));
      return shared.map(
        (p) =>
          event1.metadata?.mentionedPeople?.find(
            (mp) => mp.name.toLowerCase() === p
          )?.name || p
      );
    }
    case 'countries': {
      const countries1 = event1.metadata?.mentionedCountries || [];
      const countries2 = event2.metadata?.mentionedCountries || [];
      return countries1.filter((c) => countries2.includes(c));
    }
    case 'sources': {
      const sources1 = event1.sources || event1.metadata?.sources || [];
      const sources2 = event2.sources || event2.metadata?.sources || [];
      return sources1.filter((s) => sources2.includes(s));
    }
    case 'category': {
      if (event1.category && event1.category === event2.category) {
        return [event1.category];
      }
      return [];
    }
    default:
      return [];
  }
}

export function useGraphData() {
  const language = useRouteLanguage();
  const { events, loading, error } = useEvents({
    limit: 200,
    lang: language,
    skipHiddenFilter: true,
  });
  const enabledConnections = useGrafStore((s) => s.enabledConnections);
  const minTrendingScore = useGrafStore((s) => s.minTrendingScore);
  const selectedCategories = useGrafStore((s) => s.selectedCategories);

  const graphData = useMemo<GraphData>(() => {
    let filteredEvents = events.filter(
      (e) => (e.trendingScore || 0) >= minTrendingScore
    );

    if (selectedCategories.length > 0) {
      filteredEvents = filteredEvents.filter((e) =>
        selectedCategories.includes(e.category)
      );
    }

    const nodes: GraphNode[] = filteredEvents.map((event) => ({
      id: event.id,
      event,
      val: calculateNodeSize(event.trendingScore || 0),
      color: getCategoryColor(event.category),
      label:
        event.metadata?.ultraShortHeadline ||
        event.metadata?.shortHeadline ||
        event.title.substring(0, 30),
      category: event.category,
      trendingScore: event.trendingScore || 0,
      date: new Date(event.createdAt),
    }));

    const links: GraphLink[] = [];
    const connectionTypes: ConnectionType[] = [
      'people',
      'countries',
      'sources',
      'category',
    ];

    for (let i = 0; i < filteredEvents.length; i++) {
      for (let j = i + 1; j < filteredEvents.length; j++) {
        const event1 = filteredEvents[i];
        const event2 = filteredEvents[j];

        for (const type of connectionTypes) {
          if (!enabledConnections[type]) continue;

          const sharedItems = findSharedItems(event1, event2, type);
          if (sharedItems.length > 0) {
            links.push({
              source: event1.id,
              target: event2.id,
              type,
              strength:
                CONNECTION_CONFIGS[type].strength *
                Math.min(sharedItems.length, 3),
              sharedItems,
            });
          }
        }
      }
    }

    return { nodes, links };
  }, [events, enabledConnections, minTrendingScore, selectedCategories]);

  const getConnectedNodeIds = useCallback(
    (nodeId: string): string[] => {
      const connectedIds = new Set<string>();
      graphData.links.forEach((link) => {
        const sourceId =
          typeof link.source === 'string'
            ? link.source
            : (link.source as GraphNode).id;
        const targetId =
          typeof link.target === 'string'
            ? link.target
            : (link.target as GraphNode).id;
        if (sourceId === nodeId) connectedIds.add(targetId);
        if (targetId === nodeId) connectedIds.add(sourceId);
      });
      return Array.from(connectedIds);
    },
    [graphData.links]
  );

  const getNodeById = useCallback(
    (nodeId: string): GraphNode | undefined => {
      return graphData.nodes.find((n) => n.id === nodeId);
    },
    [graphData.nodes]
  );

  const getNodeConnections = useCallback(
    (nodeId: string) => {
      const nodeLinks = graphData.links.filter((link) => {
        const sourceId =
          typeof link.source === 'string'
            ? link.source
            : (link.source as GraphNode).id;
        const targetId =
          typeof link.target === 'string'
            ? link.target
            : (link.target as GraphNode).id;
        return sourceId === nodeId || targetId === nodeId;
      });

      const byType: Record<
        string,
        { count: number; totalStrength: number; items: Map<string, number> }
      > = {};

      for (const link of nodeLinks) {
        if (!byType[link.type]) {
          byType[link.type] = { count: 0, totalStrength: 0, items: new Map() };
        }
        const entry = byType[link.type];
        entry.count++;
        entry.totalStrength += link.strength;
        for (const item of link.sharedItems) {
          entry.items.set(item, (entry.items.get(item) || 0) + 1);
        }
      }

      return Object.entries(byType).map(([type, data]) => ({
        type: type as ConnectionType,
        count: data.count,
        totalStrength: data.totalStrength,
        maxStrength: CONNECTION_CONFIGS[type as ConnectionType].strength * 3,
        items: [...data.items.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([name, count]) => ({ name, count })),
      }));
    },
    [graphData.links]
  );

  return {
    graphData,
    loading,
    error,
    nodeCount: graphData.nodes.length,
    linkCount: graphData.links.length,
    getConnectedNodeIds,
    getNodeById,
    getNodeConnections,
  };
}
