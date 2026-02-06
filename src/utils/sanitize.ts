import type { Event } from '../types/events';
import type { DailyBrief } from '../types/brief';
import type { Felieton } from '../types/felieton';
import { preventWidows } from './text';

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
    title: preventWidows(decodeHtmlEntities(event.title)),
    lead: preventWidows(decodeHtmlEntities(event.lead)),
    summary: decodeHtmlEntities(event.summary),
  };
}

export function sanitizeFelieton(felieton: Felieton): Felieton {
  return {
    ...felieton,
    title: preventWidows(decodeHtmlEntities(felieton.title)),
    lead: preventWidows(decodeHtmlEntities(felieton.lead)),
    ultraShortHeadline: preventWidows(decodeHtmlEntities(felieton.ultraShortHeadline)),
  };
}

function decodeAndPreventWidows(text: string): string {
  return preventWidows(decodeHtmlEntities(text));
}

export function sanitizeBrief(brief: DailyBrief): DailyBrief {
  return {
    ...brief,
    headline: decodeAndPreventWidows(brief.headline || ''),
    lead: decodeAndPreventWidows(brief.lead || ''),
    executiveSummary: decodeHtmlEntities(brief.executiveSummary || ''),
    greeting: brief.greeting ? decodeAndPreventWidows(brief.greeting) : null,
    sections: brief.sections.map(section => ({
      ...section,
      headline: decodeAndPreventWidows(section.headline || ''),
      content: decodeHtmlEntities(section.content || ''),
      keyEvents: section.keyEvents.map(decodeHtmlEntities),
      insights: section.insights.map(decodeAndPreventWidows),
    })),
    insights: {
      ...brief.insights,
      metaCommentary: decodeHtmlEntities(brief.insights.metaCommentary || ''),
      trends: brief.insights.trends.map(decodeAndPreventWidows),
      correlations: brief.insights.correlations.map(decodeAndPreventWidows),
      anomalies: brief.insights.anomalies.map(decodeAndPreventWidows),
      implications: brief.insights.implications.map(decodeAndPreventWidows),
    },
  };
}
