export type FelietonCategory = 'ekonomia' | 'geopolityka' | 'polska-polityka';
export type FelietonEdition = 'morning' | 'evening';

export interface SourceEvent {
  id: string;
  title: string;
  date: string | { _seconds: number; _nanoseconds: number };
}

export interface Felieton {
  id: string;
  category: FelietonCategory;
  edition: FelietonEdition;
  date: string;
  title: string;
  ultraShortHeadline: string;
  lead: string;
  content: string;
  sourceEvents: SourceEvent[];
  generatedAt: string;
  model: string;
  wordCount: number;
}

export interface FelietonyResponse {
  felietony: Felieton[];
  date: string;
  edition: FelietonEdition | 'all';
  count: number;
}

export const FELIETON_CATEGORY_NAMES: Record<FelietonCategory, string> = {
  'ekonomia': 'Ekonomia',
  'geopolityka': 'Geopolityka',
  'polska-polityka': 'Polska Polityka',
};

