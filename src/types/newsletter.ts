export interface Newsletter {
  id: string;
  weekStart: string;
  weekEnd: string;
  generatedAt: string;
  status: 'draft' | 'approved' | 'sent';
  headline: string;
  intro: string;
  topEvents: NewsletterEvent[];
  categorySections: NewsletterCategorySection[];
  metadata: NewsletterMetadata;
}

export interface NewsletterEvent {
  eventId: string;
  title: string;
  lead: string;
  category: string;
  historicalMaxSourceCount: number;
  sourceCount: number;
  imageUrl?: string;
  originalCreatedAt: string;
}

export interface NewsletterCategorySection {
  category: string;
  summary: string;
  events: NewsletterEvent[];
}

export interface NewsletterMetadata {
  model: string;
  categoryModel: string;
  processingTimeMs: number;
  totalEventsConsidered: number;
}

export interface NewsletterResponse {
  data: Newsletter;
}
