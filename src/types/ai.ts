// AI Companion types

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: AIEventSource[];
  timestamp: number;
}

export interface AIEventSource {
  id: string;
  title: string;
  date: string;
}

export interface DebugStep {
  step:
    | 'keywordsAndExpansion'
    | 'parallelSearch'
    | 'fusion'
    | 'rerank'
    | 'searchComplete'
    | 'generating'
    | 'complete'
    | 'latestEvents'
    | 'keywords';
  model?: string;
  keywords?: string[];
  expandedQueries?: string[];
  hypotheticalAnswer?: string;
  isLatest?: boolean;
  timeMs?: number;
  eventsTotal?: number;
  eventsMatched?: number;
  finalResults?: number;
  usedLSH?: boolean;
  topEvents?: Array<{ title: string; score: number }>;
  generationTimeMs?: number;
  totalTimeMs?: number;
  // Parallel search details
  keyword?: { resultsCount: number };
  vector?: {
    enabled: boolean;
    model: string;
    usedHyDE?: boolean;
    resultsCount: number;
  };
  bm25?: { enabled: boolean; resultsCount: number };
  // Fusion details
  method?: string;
  weights?: number[];
  inputs?: number[];
  output?: number;
  // Rerank details
  enabled?: boolean;
  input?: number;
}

export interface AIStatusResponse {
  remaining: number;
  limit: number;
  authenticated: boolean;
}

export interface AISuggestionsResponse {
  suggestions: string[];
  generatedAt?: string;
}

export interface SSEEvent {
  content?: string;
  sources?: AIEventSource[];
  debug?: DebugStep;
  follow_ups?: string[];
  remaining?: number;
  done?: boolean;
  blocked?: boolean;
  error?: string;
  status?: string;
}

export type TypingLabelKey = 'analyzing' | 'searching' | 'generating';
