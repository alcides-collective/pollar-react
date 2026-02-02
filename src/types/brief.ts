export interface BriefSection {
  category: string;
  headline: string;
  content: string;
  keyEvents: string[];
  insights: string[];
  keyPoints?: string[];
}

export interface SourceStat {
  source: string;
  count: number;
}

export interface CategoryStat {
  category: string;
  count: number;
  percentage: number;
}

export interface BriefAnalytics {
  totalEvents: number;
  totalArticles: number;
  topSources: SourceStat[];
  categoryDistribution: CategoryStat[];
  trendingTopics: string[];
}

export interface BriefInsights {
  trends: string[];
  correlations: string[];
  anomalies: string[];
  implications: string[];
  metaCommentary: string;
}

export interface BriefMentionedPerson {
  name: string;
  context: string;
  eventIds: string[];
}

export interface WordOfTheDay {
  word: string;
  etymology: string;
  encyclopedicDefinition: string;
  editorialDefinition: string;
  context: string;
}

export interface BriefMetadata {
  model: string;
  processingTimeMs: number;
  articleCount: number;
  eventCount: number;
  version: number;
}

export type AudioStatus = 'pending' | 'generating' | 'ready' | 'error';

export interface DailyBrief {
  id: string;
  date: string;
  generatedAt: string;
  greeting: string | null;
  headline: string;
  lead: string;
  executiveSummary: string;
  sections: BriefSection[];
  analytics: BriefAnalytics;
  insights: BriefInsights;
  mentionedPeople: BriefMentionedPerson[];
  mentionedOrganizations: string[];
  mentionedCountries: string[];
  wordOfTheDay: WordOfTheDay | null;
  metadata: BriefMetadata;
  audioUrl: string | null;
  audioDuration: number | null;
  audioStatus: AudioStatus | null;
  radioScript: string | null;
}

export interface BriefResponse {
  data: DailyBrief;
}
