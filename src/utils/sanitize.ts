import type { Event } from '../types/events';
import type { DailyBrief } from '../types/brief';
import type { Felieton } from '../types/felieton';

const HTML_ENTITIES: Record<string, string> = {
  '&rdquo;': '"',
  '&ldquo;': '"',
  '&bdquo;': '„',
  '&quot;': '"',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&nbsp;': '\u00A0',
  '&ndash;': '–',
  '&mdash;': '—',
  '&hellip;': '…',
  '&apos;': "'",
  '&lsquo;': '\u2018',
  '&rsquo;': '\u2019',
  '&laquo;': '«',
  '&raquo;': '»',
};

export function decodeHtmlEntities(text: string): string {
  let result = text;
  for (const [entity, char] of Object.entries(HTML_ENTITIES)) {
    result = result.replaceAll(entity, char);
  }
  return result;
}

export function sanitizeEvent(event: Event): Event {
  return {
    ...event,
    title: decodeHtmlEntities(event.title),
    lead: decodeHtmlEntities(event.lead),
    summary: decodeHtmlEntities(event.summary),
  };
}

export function sanitizeFelieton(felieton: Felieton): Felieton {
  return {
    ...felieton,
    title: decodeHtmlEntities(felieton.title),
    lead: decodeHtmlEntities(felieton.lead),
    ultraShortHeadline: decodeHtmlEntities(felieton.ultraShortHeadline),
  };
}

export function sanitizeBrief(brief: DailyBrief): DailyBrief {
  return {
    ...brief,
    headline: decodeHtmlEntities(brief.headline || ''),
    lead: decodeHtmlEntities(brief.lead || ''),
    executiveSummary: decodeHtmlEntities(brief.executiveSummary || ''),
    greeting: brief.greeting ? decodeHtmlEntities(brief.greeting) : null,
    sections: brief.sections.map(section => ({
      ...section,
      headline: decodeHtmlEntities(section.headline || ''),
      content: decodeHtmlEntities(section.content || ''),
      keyEvents: section.keyEvents.map(decodeHtmlEntities),
      insights: section.insights.map(decodeHtmlEntities),
    })),
    insights: {
      ...brief.insights,
      metaCommentary: decodeHtmlEntities(brief.insights.metaCommentary || ''),
      trends: brief.insights.trends.map(decodeHtmlEntities),
      correlations: brief.insights.correlations.map(decodeHtmlEntities),
      anomalies: brief.insights.anomalies.map(decodeHtmlEntities),
      implications: brief.insights.implications.map(decodeHtmlEntities),
    },
  };
}
