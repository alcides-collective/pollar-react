import type { Event } from './events';

export type ConnectionType = 'people' | 'countries' | 'sources' | 'category';

export type VisualizationMode = 'force' | 'radial' | 'hierarchical' | 'timeline';

export interface GraphNode {
  id: string;
  event: Event;
  val: number;
  color: string;
  label: string;
  category: string;
  trendingScore: number;
  date: Date;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  type: ConnectionType;
  strength: number;
  sharedItems: string[];
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface ConnectionTypeConfig {
  type: ConnectionType;
  label: string;
  color: string;
  strength: number;
}

export const CONNECTION_CONFIGS: Record<ConnectionType, ConnectionTypeConfig> = {
  people: { type: 'people', label: 'Wspólne osoby', color: '#ef4444', strength: 4 },
  countries: { type: 'countries', label: 'Wspólne kraje', color: '#3b82f6', strength: 3 },
  sources: { type: 'sources', label: 'Wspólne źródła', color: '#22c55e', strength: 2 },
  category: { type: 'category', label: 'Ta sama kategoria', color: '#a855f7', strength: 1 },
};

export const CATEGORY_COLORS: Record<string, string> = {
  'Polityka': '#dc2626',
  'Gospodarka': '#2563eb',
  'Świat': '#059669',
  'Społeczeństwo': '#7c3aed',
  'Sport': '#ea580c',
  'Kultura': '#db2777',
  'Przestępczość': '#f59e0b',
  'Styl Życia': '#ec4899',
  'Pogoda i Środowisko': '#14b8a6',
  'Nauka i Technologia': '#6366f1',
  default: '#71717a',
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.default;
}
