export type FreshnessLevel = 'BREAKING' | 'HOT' | 'RECENT' | 'AGING' | 'OLD';

export interface EventLocation {
  city: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface KeyPoint {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface MentionedPerson {
  name: string;
  wikipediaUrl?: string;
  context?: string;
}

export interface Article {
  id: string;
  title: string;
  source: string;
  url: string;
  imageUrl?: string;
  publishDate: string | { _seconds: number; _nanoseconds: number };
}

export interface EventGenealogy {
  bornAt: string;
  bornFrom: 'split' | 'merge' | 'new';
  parentIds?: string[];
  splitFrom?: string;
  mergedFrom?: string[];
  generationNumber?: number;
  lastTransitionAt?: string;
  lastTransitionType?: string;
}

export interface EventMetadata {
  category: string;
  trending: boolean;
  trendingScore: number;
  location: EventLocation;
  locations: EventLocation[];
  keyPoints: KeyPoint[];
  mentionedPeople: MentionedPerson[];
  mentionedCountries: string[];
  shortHeadline: string;
  ultraShortHeadline: string;
  sources: string[];
  articleCount: number;
  sourceCount: number;
  imageAttribution: string | null;
  isLowQualityContent: boolean;
  viewCount: number;
  summarizationModel?: string;
  ttsText?: string;
  seo?: {
    metaTitle: string;
    metaDescription: string;
    ogDescription: string;
    keywords: string[];
    hashtags: string[];
  };
  genealogy?: EventGenealogy;
}

export interface Event {
  id: string;
  title: string;
  lead: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
  lastContentUpdate: string;
  lastSummarizationComplete: string;
  metadata: EventMetadata;
  imageUrl: string;
  audioUrl?: string;
  summarizationModel?: string;
  category: string;
  sources: string[];
  trendingScore: number;
  articleCount: number;
  sourceCount: number;
  viewCount: number;
  freshnessLevel: FreshnessLevel;
  articles?: Article[];
}

export interface EventsResponse {
  data: Event[];
}

export interface EventsParams {
  page?: number;
  limit?: number;
  category?: string;
  trending?: boolean;
  lang?: string;
  articleFields?: 'none' | 'minimal' | 'full';
}
