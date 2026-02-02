/**
 * Search Types for Frontend
 */

export type SearchResultType = 'event' | 'mp' | 'voting' | 'print' | 'committee';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  score: number;
  url: string;
  imageUrl?: string;
  metadata?: {
    category?: string;
    club?: string;
    date?: string;
    sitting?: number;
  };
}

export interface PopularSearch {
  term: string;
  count: number;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  totalCount: number;
  popularSearches?: PopularSearch[];
  suggestions?: string[];
}
