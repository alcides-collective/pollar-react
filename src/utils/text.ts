/**
 * Text utilities for processing custom HTML tags in summaries
 * Ported from pollar-web/pollar-sveltekit/src/lib/utils/text.ts
 */

import type { Language } from '../stores/languageStore';
import i18n from '../i18n';

function label(key: string, lang: Language): string {
  return i18n.t(`summaryLabels.${key}`, { lng: lang, postProcess: [] as string[] });
}

// ==========================================
// Extraction functions for sidebar display
// ==========================================

/**
 * Extract event UUIDs from text content
 * Matches patterns like (event UUID) or just (UUID)
 */
export function extractEventIds(text: string | undefined): string[] {
  if (!text) return [];

  const uuidPattern = /\((?:event\s+)?([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\)/gi;
  const matches: string[] = [];
  let match;

  while ((match = uuidPattern.exec(text)) !== null) {
    if (!matches.includes(match[1])) {
      matches.push(match[1]);
    }
  }

  return matches;
}

export interface ExtractedKeyNumber {
  value: string;
  description: string;
}

export interface TimelineEvent {
  data?: string;
  tytul?: string;
  opis?: string;
}

export interface ExtractedTimeline {
  title: string;
  events: TimelineEvent[];
}

export interface ExtractedLineChart {
  id: string;
  title: string;
  unit: string;
  items: { label: string; value: number }[];
}

/**
 * Normalize English tag names and attributes to Polish equivalents.
 * Allows the parser to handle summaries generated in either language.
 */
function normalizeEnglishTags(text: string): string {
  return text
    // Tag names: EN → PL
    .replace(/<(\/?)note(\s|>)/gi, '<$1przypis$2')
    .replace(/<(\/?)context>/gi, '<$1kontekst>')
    .replace(/<(\/?)quote(\s|>)/gi, '<$1cytat$2')
    .replace(/<(\/?)key-number(\s|>)/gi, '<$1kluczowa-liczba$2')
    .replace(/<(\/?)comparison(\s|>)/gi, '<$1porównanie$2')
    .replace(/<(\/?)poll(\s|>)/gi, '<$1ankieta$2')
    .replace(/<(\/?)manipulation(\s|>)/gi, '<$1manipulacja$2')
    .replace(/<(\/?)verification(\s|>)/gi, '<$1weryfikacja$2')
    .replace(/<(\/?)fact-check(\s|>)/gi, '<$1weryfikacja$2')
    // Chart tag names: EN → PL
    .replace(/<(\/?)bar-chart(\s|>)/gi, '<$1wykres-słupkowy$2')
    .replace(/<(\/?)line-chart(\s|>)/gi, '<$1wykres-liniowy$2')
    .replace(/<(\/?)pie-chart(\s|>)/gi, '<$1wykres-kołowy$2')
    // Attribute names within specific tags: EN → PL
    .replace(/(<przypis\s[^>]*)description=/gi, '$1opis=')
    .replace(/(<cytat\s[^>]*)author=/gi, '$1autor=')
    .replace(/(<cytat\s[^>]*)place=/gi, '$1miejsce=')
    .replace(/(<kluczowa-liczba\s[^>]*)value=/gi, '$1wartość=')
    .replace(/(<timeline\s[^>]*)title=/gi, '$1tytuł=')
    .replace(/(<porównanie\s[^>]*)title=/gi, '$1tytuł=')
    .replace(/(<ankieta\s[^>]*)question=/gi, '$1pytanie=')
    .replace(/(<manipulacja\s[^>]*)author=/gi, '$1autor=')
    .replace(/(<manipulacja\s[^>]*)quote=/gi, '$1cytat=')
    .replace(/(<weryfikacja\s[^>]*)verdict=/gi, '$1werdykt=')
    .replace(/(<weryfikacja\s[^>]*)source=/gi, '$1źródło=')
    // Chart attribute names: title → tytuł, unit → jednostka
    .replace(/(<wykres-s[łt][uó]pkowy\s[^>]*)title=/gi, '$1tytuł=')
    .replace(/(<wykres-s[łt][uó]pkowy\s[^>]*)unit=/gi, '$1jednostka=')
    .replace(/(<wykres-liniowy\s[^>]*)title=/gi, '$1tytuł=')
    .replace(/(<wykres-liniowy\s[^>]*)unit=/gi, '$1jednostka=')
    .replace(/(<wykres-kołowy\s[^>]*)title=/gi, '$1tytuł=')
    .replace(/(<wykres-kołowy\s[^>]*)unit=/gi, '$1jednostka=');
}

/**
 * Extract key number from summary for display in sidebar (desktop only)
 */
export function extractKeyNumber(summary: string | undefined): ExtractedKeyNumber | null {
  if (!summary) return null;

  const s = normalizeEnglishTags(summary);

  // Try double quotes first, then single quotes
  const match = s.match(/<kluczowa-liczba\s+wartość\s*=\s*"([^"]+)">([\s\S]*?)<\/kluczowa-liczba>/i)
    || s.match(/<kluczowa-liczba\s+wartość\s*=\s*'([^']+)'>([\s\S]*?)<\/kluczowa-liczba>/i);
  if (!match) return null;

  return {
    value: preventWidows(match[1]),
    description: preventWidows(match[2].trim())
  };
}

/**
 * Extract timeline from summary for display in sidebar (desktop only)
 */
export function extractTimeline(summary: string | undefined): ExtractedTimeline | null {
  if (!summary) return null;

  const s = normalizeEnglishTags(summary);

  // Try double quotes first, then single quotes
  const match = s.match(/<timeline\s+tytu[łl]u?\s*=\s*"([^"]+)">([\s\S]*?)<\/timeline>/i)
    || s.match(/<timeline\s+tytu[łl]u?\s*=\s*'([^']+)'>([\s\S]*?)<\/timeline>/i);
  if (!match) return null;

  try {
    const events = JSON.parse(match[2].trim());
    if (!Array.isArray(events)) return null;
    return {
      title: preventWidows(match[1]),
      events: events.map((e: { data?: string; tytul?: string; opis?: string }) => ({
        ...e,
        data: e.data ? preventWidows(e.data) : e.data,
        tytul: e.tytul ? preventWidows(e.tytul) : e.tytul,
        opis: e.opis ? preventWidows(e.opis) : e.opis,
      })),
    };
  } catch {
    return null;
  }
}

/**
 * Extract all line charts from summary for rendering as React components
 * Returns array of chart data with unique IDs
 */
export function extractLineCharts(summary: string | undefined): ExtractedLineChart[] {
  if (!summary) return [];

  const charts: ExtractedLineChart[] = [];

  // Match both attribute orders and quote types: tytuł + jednostka and jednostka + tytuł
  const regexes = [
    // tytuł + jednostka (double quotes)
    { regex: /<wykres-liniowy\s+tytu[łlć]?u?\s*=\s*"([^"]+)"\s+jednostk[ai]?\s*=\s*"([^"]+)">([\s\S]*?)<\/wykres-liniowy>/gi, order: 'title-unit' },
    // tytuł + jednostka (single quotes)
    { regex: /<wykres-liniowy\s+tytu[łlć]?u?\s*=\s*'([^']+)'\s+jednostk[ai]?\s*=\s*'([^']+)'>([\s\S]*?)<\/wykres-liniowy>/gi, order: 'title-unit' },
    // jednostka + tytuł (double quotes)
    { regex: /<wykres-liniowy\s+jednostk[ai]?\s*=\s*"([^"]+)"\s+tytu[łlć]?u?\s*=\s*"([^"]+)">([\s\S]*?)<\/wykres-liniowy>/gi, order: 'unit-title' },
    // jednostka + tytuł (single quotes)
    { regex: /<wykres-liniowy\s+jednostk[ai]?\s*=\s*'([^']+)'\s+tytu[łlć]?u?\s*=\s*'([^']+)'>([\s\S]*?)<\/wykres-liniowy>/gi, order: 'unit-title' },
  ];

  let chartIndex = 0;

  for (const { regex, order } of regexes) {
    let match;
    while ((match = regex.exec(summary)) !== null) {
      const [, first, second, dataStr] = match;
      const title = order === 'title-unit' ? first : second;
      const unit = order === 'title-unit' ? second : first;
      const items = parseChartData(dataStr);
      if (items.length > 0) {
        charts.push({
          id: `line-chart-${chartIndex++}`,
          title,
          unit,
          items
        });
      }
    }
  }

  return charts;
}

/**
 * Parse chart data string into label/value pairs
 */
function parseChartData(dataStr: string): { label: string; value: number }[] {
  const items: { label: string; value: number }[] = [];
  dataStr.split(',').forEach((pair: string) => {
    const match = pair.trim().match(/^([^:]+):\s*([\d.,]+)/);
    if (match) {
      items.push({
        label: match[1].trim(),
        value: parseFloat(match[2].replace(',', '.'))
      });
    }
  });
  return items;
}


/**
 * Remove extracted sidebar elements from summary to avoid duplication
 * Call this before sanitizeAndProcessHtml() when displaying in main content
 */
export function removeExtractedElements(summary: string | undefined): string {
  if (!summary) return '';

  return normalizeEnglishTags(summary)
    // Remove kluczowa-liczba tags (double quotes)
    .replace(/<kluczowa-liczba\s+wartość\s*=\s*"[^"]+">[\s\S]*?<\/kluczowa-liczba>/gi, '')
    // Remove kluczowa-liczba tags (single quotes)
    .replace(/<kluczowa-liczba\s+wartość\s*=\s*'[^']+'>[\s\S]*?<\/kluczowa-liczba>/gi, '')
    // Remove timeline tags (double quotes)
    .replace(/<timeline\s+tytu[łl]u?\s*=\s*"[^"]+">[\s\S]*?<\/timeline>/gi, '')
    // Remove timeline tags (single quotes)
    .replace(/<timeline\s+tytu[łl]u?\s*=\s*'[^']+'>[\s\S]*?<\/timeline>/gi, '')
    // Clean up extra whitespace/newlines left behind
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Prevents widows/orphans by replacing the space AFTER short (1-2 char) tokens
 * with a non-breaking space (\u00A0) wrapped in Word Joiners (U+2060).
 * Matches short words (a, i, o, w, do, na, ze...) AND short numbers (5, 12, 60...).
 * The combination ensures no line break can occur between the short token
 * and the following word. Uses lookbehind so consecutive short tokens
 * (e.g. "a w domu", "z 5 lutego") are all matched.
 */
const NBSP = '\u2060\u00A0\u2060';

export function preventWidows(text: string): string {
  if (!text || typeof text !== 'string') return text ?? '';

  return text.replace(
    /(?<=\s|^)([a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ0-9]{1,2})\s/g,
    `$1${NBSP}`,
  );
}

/**
 * Applies preventWidows only to text nodes in HTML, skipping tags and attributes.
 * Splits HTML into tag/text segments and processes only the text parts.
 */
export function preventWidowsInHtml(html: string): string {
  if (!html) return html;
  const parts = html.split(/(<[^>]*>)/);
  return parts.map(part => part.startsWith('<') ? part : preventWidows(part)).join('');
}

/**
 * Strips all HTML tags from text, leaving only plain text content.
 * Also decodes HTML entities and replaces Polish quotes.
 */
export function stripHtmlForPlainText(text: string): string {
  if (!text || typeof text !== 'string') return text ?? '';

  return normalizeEnglishTags(text)
    .replace(/&amp;lt;/g, '<')
    .replace(/&amp;gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&bdquo;/g, '„')
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&hellip;/g, '…')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/<przypis[^>]*>([\s\S]*?)<\/przypis>/gi, '$1')
    .replace(/<manipulacja[^>]*>([\s\S]*?)<\/manipulacja>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Sanitizes HTML and processes custom tags into styled components
 * Main function for processing summary content
 */
export function sanitizeAndProcessHtml(text: string, lang: Language = 'pl'): string {
  if (!text || typeof text !== 'string') return text ?? '';

  // FIRST: Decode ALL HTML entities that might appear in tag attributes
  let processedText = text
    .replace(/&amp;lt;/g, '&lt;')
    .replace(/&amp;gt;/g, '&gt;')
    .replace(/&amp;/g, '&')
    .replace(/&bdquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '…');

  // Process custom tags
  processedText = processedText
    // Convert <br> tags to double line breaks
    .replace(/<br\s*\/?>/gi, '\n\n')
    // Decode HTML entities for custom tags
    .replace(/&lt;(\/?)cytat/gi, '<$1cytat')
    .replace(/<\/cytat>[.,]\s/gi, '</cytat>')
    .replace(/&lt;(\/?)kontekst/gi, '<$1kontekst')
    .replace(/&lt;(\/?)bias/gi, '<$1bias')
    .replace(/&lt;(\/?)przypis/gi, '<$1przypis')
    .replace(/&lt;(\/?)manipulacja/gi, '<$1manipulacja')
    .replace(/&lt;(\/?)wykres-liniowy/gi, '<$1wykres-liniowy')
    .replace(/&lt;(\/?)wykres-s[łt][uó]pkowy/gi, '<$1wykres-słupkowy')
    .replace(/&lt;(\/?)wykres-kołowy/gi, '<$1wykres-kołowy')
    .replace(/&lt;(\/?)wykres-porównanie/gi, '<$1wykres-porównanie')
    .replace(/&lt;(\/?)wykres-wyniki/gi, '<$1wykres-wyniki')
    .replace(/&lt;(\/?)tabela-wynikow/gi, '<$1tabela-wynikow')
    .replace(/&lt;(\/?)ranking/gi, '<$1ranking')
    .replace(/&lt;(\/?)kalendarz/gi, '<$1kalendarz')
    .replace(/&lt;(\/?)kluczowa-liczba/gi, '<$1kluczowa-liczba')
    .replace(/&lt;(\/?)timeline/gi, '<$1timeline')
    .replace(/&lt;(\/?)ankieta/gi, '<$1ankieta')
    .replace(/&lt;(\/?)porównanie/gi, '<$1porównanie')
    .replace(/&lt;(\/?)layout-por[oó]wnanie/gi, '<$1layout-porownanie')
    .replace(/&lt;(\/?)weryfikacja/gi, '<$1weryfikacja')
    .replace(/&lt;(\/?)sekcja/gi, '<$1sekcja')
    // English tag entity decoders
    .replace(/&lt;(\/?)note/gi, '<$1note')
    .replace(/&lt;(\/?)context/gi, '<$1context')
    .replace(/&lt;(\/?)quote/gi, '<$1quote')
    .replace(/&lt;(\/?)key-number/gi, '<$1key-number')
    .replace(/&lt;(\/?)comparison/gi, '<$1comparison')
    .replace(/&lt;(\/?)poll/gi, '<$1poll')
    .replace(/&lt;(\/?)manipulation/gi, '<$1manipulation')
    .replace(/&lt;(\/?)verification/gi, '<$1verification')
    .replace(/&lt;(\/?)fact-check/gi, '<$1fact-check')
    // English chart tag entity decoders
    .replace(/&lt;(\/?)bar-chart/gi, '<$1bar-chart')
    .replace(/&lt;(\/?)line-chart/gi, '<$1line-chart')
    .replace(/&lt;(\/?)pie-chart/gi, '<$1pie-chart')
    .replace(/&gt;/g, '>');

  // Normalize English tag names and attributes to Polish equivalents
  processedText = normalizeEnglishTags(processedText);

  processedText = processedText
    // Convert markdown bold **text** to <b>text</b>
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    // Convert <sekcja tytuł="..."> to section header (double quotes)
    .replace(/<sekcja\s+tytu[łlć]?u?\s*=\s*"([^"]+)">([\s\S]*?)<\/sekcja>/gi,
      (_, title, content) => {
        const processedContent = content.replace(/\n\n+/g, '</p><p>');
        return `\n\n<div class="section-box"><h3 class="section-title">${title}</h3><div class="section-content"><p>${processedContent}</p></div></div>\n\n`;
      })
    // Convert <sekcja tytuł='...'> to section header (single quotes)
    .replace(/<sekcja\s+tytu[łlć]?u?\s*=\s*'([^']+)'>([\s\S]*?)<\/sekcja>/gi,
      (_, title, content) => {
        const processedContent = content.replace(/\n\n+/g, '</p><p>');
        return `\n\n<div class="section-box"><h3 class="section-title">${title}</h3><div class="section-content"><p>${processedContent}</p></div></div>\n\n`;
      })
    // Convert <kontekst> tags to styled context box
    .replace(/<kontekst>([\s\S]*?)<\/kontekst>/gi,
      '\n\n<div class="context-box"><p class="context-text">$1</p></div>\n\n')
    // Convert <bias left="..." right="..."> tags to styled bias comparison box
    // Use [^"]* for double-quoted and [^']* for single-quoted attrs to allow apostrophes/quotes inside
    .replace(/<bias\s+left\s*=\s*"([^"]*)"\s+right\s*=\s*"([^"]*)"\s*(?:\/>|><\/bias>)/gi,
      (_, left, right) => `\n\n<div class="bias-wrapper"><span class="bias-header">${label('politicalPerspectives', lang)}</span><div class="bias-columns"><div class="bias-column bias-left"><span class="bias-label">${label('liberalSources', lang)}</span><p class="bias-text">${left}</p></div><div class="bias-column bias-right"><span class="bias-label">${label('conservativeSources', lang)}</span><p class="bias-text">${right}</p></div></div></div>\n\n`)
    .replace(/<bias\s+left\s*=\s*'([^']*)'\s+right\s*=\s*'([^']*)'\s*(?:\/>|><\/bias>)/gi,
      (_, left, right) => `\n\n<div class="bias-wrapper"><span class="bias-header">${label('politicalPerspectives', lang)}</span><div class="bias-columns"><div class="bias-column bias-left"><span class="bias-label">${label('liberalSources', lang)}</span><p class="bias-text">${left}</p></div><div class="bias-column bias-right"><span class="bias-label">${label('conservativeSources', lang)}</span><p class="bias-text">${right}</p></div></div></div>\n\n`)
    // Handle alternate attribute order: right first, then left
    .replace(/<bias\s+right\s*=\s*"([^"]*)"\s+left\s*=\s*"([^"]*)"\s*(?:\/>|><\/bias>)/gi,
      (_, right, left) => `\n\n<div class="bias-wrapper"><span class="bias-header">${label('politicalPerspectives', lang)}</span><div class="bias-columns"><div class="bias-column bias-left"><span class="bias-label">${label('liberalSources', lang)}</span><p class="bias-text">${left}</p></div><div class="bias-column bias-right"><span class="bias-label">${label('conservativeSources', lang)}</span><p class="bias-text">${right}</p></div></div></div>\n\n`)
    .replace(/<bias\s+right\s*=\s*'([^']*)'\s+left\s*=\s*'([^']*)'\s*(?:\/>|><\/bias>)/gi,
      (_, right, left) => `\n\n<div class="bias-wrapper"><span class="bias-header">${label('politicalPerspectives', lang)}</span><div class="bias-columns"><div class="bias-column bias-left"><span class="bias-label">${label('liberalSources', lang)}</span><p class="bias-text">${left}</p></div><div class="bias-column bias-right"><span class="bias-label">${label('conservativeSources', lang)}</span><p class="bias-text">${right}</p></div></div></div>\n\n`)
    // Convert <manipulacja autor="..." cytat="...">explanation</manipulacja> to styled manipulation callout
    .replace(/<manipulacja\s+autor\s*=\s*["']([^"']+)["']\s+cytat\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/manipulacja>/gi,
      (_, autor, cytat, explanation) => `\n\n<div class="manipulation-box"><span class="manipulation-label">${label('manipulationDetected', lang)}</span><div class="manipulation-source">${label('source', lang)}: ${autor}</div><blockquote class="manipulation-quote">„${cytat}"</blockquote><p class="manipulation-explanation">${explanation}</p></div>\n\n`)
    // Handle alternate attribute order: cytat first, then autor
    .replace(/<manipulacja\s+cytat\s*=\s*["']([^"']+)["']\s+autor\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/manipulacja>/gi,
      (_, cytat, autor, explanation) => `\n\n<div class="manipulation-box"><span class="manipulation-label">${label('manipulationDetected', lang)}</span><div class="manipulation-source">${label('source', lang)}: ${autor}</div><blockquote class="manipulation-quote">„${cytat}"</blockquote><p class="manipulation-explanation">${explanation}</p></div>\n\n`)
    // Convert <kluczowa-liczba wartość="...">description</kluczowa-liczba> to number callout (double quotes)
    .replace(/<kluczowa-liczba\s+wartość\s*=\s*"([^"]+)">([\s\S]*?)<\/kluczowa-liczba>/gi,
      '\n\n<div class="key-number-box"><span class="key-number-value">$1</span><span class="key-number-description">$2</span></div>\n\n')
    // Convert <kluczowa-liczba wartość='...'>description</kluczowa-liczba> to number callout (single quotes)
    .replace(/<kluczowa-liczba\s+wartość\s*=\s*'([^']+)'>([\s\S]*?)<\/kluczowa-liczba>/gi,
      '\n\n<div class="key-number-box"><span class="key-number-value">$1</span><span class="key-number-description">$2</span></div>\n\n')
    // Convert <weryfikacja werdykt="..." źródło="...">explanation</weryfikacja> to fact-check box
    .replace(/<weryfikacja\s+werdykt\s*=\s*["']([^"']+)["']\s+źródło\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/weryfikacja>/gi,
      (_, verdict, source, explanation) => {
        const verdictClass = verdict.toLowerCase().includes('fałsz') ? 'verdict-false' :
                            verdict.toLowerCase().includes('prawdziwe') || verdict.toLowerCase() === 'prawda' ? 'verdict-true' : 'verdict-partial';
        const verdictIcon = verdict.toLowerCase().includes('fałsz') ? '✗' :
                           verdict.toLowerCase().includes('prawdziwe') || verdict.toLowerCase() === 'prawda' ? '✓' : '~';
        return `\n\n<div class="factcheck-box ${verdictClass}"><span class="factcheck-label">${label('factCheck', lang)}</span><div class="factcheck-verdict"><span class="verdict-icon">${verdictIcon}</span><span class="verdict-text">${verdict}</span></div><p class="factcheck-explanation">${explanation}</p><div class="factcheck-source">${label('source', lang)}: ${source}</div></div>\n\n`;
      })
    // Handle alternate attribute order for weryfikacja
    .replace(/<weryfikacja\s+źródło\s*=\s*["']([^"']+)["']\s+werdykt\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/weryfikacja>/gi,
      (_, source, verdict, explanation) => {
        const verdictClass = verdict.toLowerCase().includes('fałsz') ? 'verdict-false' :
                            verdict.toLowerCase().includes('prawdziwe') || verdict.toLowerCase() === 'prawda' ? 'verdict-true' : 'verdict-partial';
        const verdictIcon = verdict.toLowerCase().includes('fałsz') ? '✗' :
                           verdict.toLowerCase().includes('prawdziwe') || verdict.toLowerCase() === 'prawda' ? '✓' : '~';
        return `\n\n<div class="factcheck-box ${verdictClass}"><span class="factcheck-label">${label('factCheck', lang)}</span><div class="factcheck-verdict"><span class="verdict-icon">${verdictIcon}</span><span class="verdict-text">${verdict}</span></div><p class="factcheck-explanation">${explanation}</p><div class="factcheck-source">${label('source', lang)}: ${source}</div></div>\n\n`;
      })
    // Convert <cytat autor="..." miejsce="..."> tags to styled quote box (double quotes)
    .replace(/<cytat\s+autor\s*=\s*"([^"]+)"\s+miejsce\s*=\s*"([^"]+)">([\s\S]*?)<\/cytat>/gi,
      (_, autor, miejsce, text) => {
        const hasQuotes = /^[\u201E„"'\u201C]/.test(text.trim()) && /[\u201D"'\u201C"]$/.test(text.trim());
        const quotedText = hasQuotes ? text : `„${text}"`;
        return `\n\n<blockquote class="quote-box" data-author="${autor}"><span class="quote-location">${miejsce}</span><p class="quote-text">${quotedText}</p><cite class="quote-author">${autor}</cite></blockquote>\n\n`;
      })
    // Convert <cytat autor='...' miejsce='...'> tags to styled quote box (single quotes)
    .replace(/<cytat\s+autor\s*=\s*'([^']+)'\s+miejsce\s*=\s*'([^']+)'>([\s\S]*?)<\/cytat>/gi,
      (_, autor, miejsce, text) => {
        const hasQuotes = /^[\u201E„"'\u201C]/.test(text.trim()) && /[\u201D"'\u201C"]$/.test(text.trim());
        const quotedText = hasQuotes ? text : `„${text}"`;
        return `\n\n<blockquote class="quote-box" data-author="${autor}"><span class="quote-location">${miejsce}</span><p class="quote-text">${quotedText}</p><cite class="quote-author">${autor}</cite></blockquote>\n\n`;
      })
    // Convert <cytat miejsce="..." autor="..."> (alternate order, double quotes)
    .replace(/<cytat\s+miejsce\s*=\s*"([^"]+)"\s+autor\s*=\s*"([^"]+)">([\s\S]*?)<\/cytat>/gi,
      (_, miejsce, autor, text) => {
        const hasQuotes = /^[\u201E„"'\u201C]/.test(text.trim()) && /[\u201D"'\u201C"]$/.test(text.trim());
        const quotedText = hasQuotes ? text : `„${text}"`;
        return `\n\n<blockquote class="quote-box" data-author="${autor}"><span class="quote-location">${miejsce}</span><p class="quote-text">${quotedText}</p><cite class="quote-author">${autor}</cite></blockquote>\n\n`;
      })
    // Convert <cytat miejsce='...' autor='...'> (alternate order, single quotes)
    .replace(/<cytat\s+miejsce\s*=\s*'([^']+)'\s+autor\s*=\s*'([^']+)'>([\s\S]*?)<\/cytat>/gi,
      (_, miejsce, autor, text) => {
        const hasQuotes = /^[\u201E„"'\u201C]/.test(text.trim()) && /[\u201D"'\u201C"]$/.test(text.trim());
        const quotedText = hasQuotes ? text : `„${text}"`;
        return `\n\n<blockquote class="quote-box" data-author="${autor}"><span class="quote-location">${miejsce}</span><p class="quote-text">${quotedText}</p><cite class="quote-author">${autor}</cite></blockquote>\n\n`;
      })
    // Convert <cytat autor="..."> (without location, double quotes)
    .replace(/<cytat\s+autor\s*=\s*"([^"]+)">([\s\S]*?)<\/cytat>/gi,
      (_, autor, text) => {
        const hasQuotes = /^[\u201E„"'\u201C]/.test(text.trim()) && /[\u201D"'\u201C"]$/.test(text.trim());
        const quotedText = hasQuotes ? text : `„${text}"`;
        return `\n\n<blockquote class="quote-box" data-author="${autor}"><p class="quote-text">${quotedText}</p><cite class="quote-author">${autor}</cite></blockquote>\n\n`;
      })
    // Convert <cytat autor='...'> (without location, single quotes)
    .replace(/<cytat\s+autor\s*=\s*'([^']+)'>([\s\S]*?)<\/cytat>/gi,
      (_, autor, text) => {
        const hasQuotes = /^[\u201E„"'\u201C]/.test(text.trim()) && /[\u201D"'\u201C"]$/.test(text.trim());
        const quotedText = hasQuotes ? text : `„${text}"`;
        return `\n\n<blockquote class="quote-box" data-author="${autor}"><p class="quote-text">${quotedText}</p><cite class="quote-author">${autor}</cite></blockquote>\n\n`;
      })
    // Convert <przypis title="..." opis="...">term</przypis> to tooltip (double quotes)
    .replace(/<przypis\s+title\s*=\s*"([^"]+)"\s+opis\s*=\s*"([^"]+)"\s*\/?>([\s\S]*?)<\/przypis>/gi,
      '<span class="footnote" tabindex="0"><span class="footnote-term">$3</span><span class="footnote-tooltip"><span class="footnote-title">$1</span><span class="footnote-desc">$2</span></span></span>')
    // Convert <przypis title='...' opis='...'>term</przypis> to tooltip (single quotes)
    .replace(/<przypis\s+title\s*=\s*'([^']+)'\s+opis\s*=\s*'([^']+)'\s*\/?>([\s\S]*?)<\/przypis>/gi,
      '<span class="footnote" tabindex="0"><span class="footnote-term">$3</span><span class="footnote-tooltip"><span class="footnote-title">$1</span><span class="footnote-desc">$2</span></span></span>')
    // Handle alternate attribute order: opis first, then title (double quotes)
    .replace(/<przypis\s+opis\s*=\s*"([^"]+)"\s+title\s*=\s*"([^"]+)"\s*\/?>([\s\S]*?)<\/przypis>/gi,
      '<span class="footnote" tabindex="0"><span class="footnote-term">$3</span><span class="footnote-tooltip"><span class="footnote-title">$2</span><span class="footnote-desc">$1</span></span></span>')
    // Handle alternate attribute order: opis first, then title (single quotes)
    .replace(/<przypis\s+opis\s*=\s*'([^']+)'\s+title\s*=\s*'([^']+)'\s*\/?>([\s\S]*?)<\/przypis>/gi,
      '<span class="footnote" tabindex="0"><span class="footnote-term">$3</span><span class="footnote-tooltip"><span class="footnote-title">$2</span><span class="footnote-desc">$1</span></span></span>')
    // Handle self-closing przypis (double quotes)
    .replace(/<przypis\s+title\s*=\s*"([^"]+)"\s+opis\s*=\s*"([^"]+)"\s*\/>/gi,
      '<span class="footnote" tabindex="0"><span class="footnote-term">$1</span><span class="footnote-tooltip"><span class="footnote-title">$1</span><span class="footnote-desc">$2</span></span></span>')
    // Handle self-closing przypis (single quotes)
    .replace(/<przypis\s+title\s*=\s*'([^']+)'\s+opis\s*=\s*'([^']+)'\s*\/>/gi,
      '<span class="footnote" tabindex="0"><span class="footnote-term">$1</span><span class="footnote-tooltip"><span class="footnote-title">$1</span><span class="footnote-desc">$2</span></span></span>')
    // Fallback: any remaining przypis tags - strip keeping content
    .replace(/<przypis[^>]*>([\s\S]*?)<\/przypis>/gi, '$1')
    // Remove <ankieta> tags - polls are temporarily disabled
    // Use separate patterns for double and single quoted attributes to allow apostrophes/quotes inside
    .replace(/<ankieta\s+pytanie\s*=\s*"[^"]*">[\s\S]*?<\/ankieta>/gi, '')
    .replace(/<ankieta\s+pytanie\s*=\s*'[^']*'>[\s\S]*?<\/ankieta>/gi, '')
    // Convert <timeline tytuł="...">JSON</timeline> to timeline (double quotes)
    .replace(/<timeline\s+tytu[łlć]?u?\s*=\s*"([^"]+)">([\s\S]*?)<\/timeline>/gi,
      (_, title, jsonData) => {
        try {
          const events = JSON.parse(jsonData.trim());
          if (!Array.isArray(events)) return '';
          const eventsHtml = events.map((e: {data?: string, tytul?: string, opis?: string}, i: number) =>
            `<div class="timeline-event${i === events.length - 1 ? ' timeline-event-last' : ''}">` +
            `<div class="timeline-dot"></div>` +
            `<div class="timeline-content">` +
            `<div class="timeline-date">${e.data || ''}</div>` +
            `<div class="timeline-event-title">${e.tytul || ''}</div>` +
            `<div class="timeline-event-desc">${e.opis || ''}</div>` +
            `</div></div>`
          ).join('');
          return `\n\n<div class="timeline-box"><div class="timeline-title">${title}</div><div class="timeline-events"><div class="timeline-line"></div>${eventsHtml}</div></div>\n\n`;
        } catch {
          return '';
        }
      })
    // Convert <timeline tytuł='...'>JSON</timeline> to timeline (single quotes)
    .replace(/<timeline\s+tytu[łlć]?u?\s*=\s*'([^']+)'>([\s\S]*?)<\/timeline>/gi,
      (_, title, jsonData) => {
        try {
          const events = JSON.parse(jsonData.trim());
          if (!Array.isArray(events)) return '';
          const eventsHtml = events.map((e: {data?: string, tytul?: string, opis?: string}, i: number) =>
            `<div class="timeline-event${i === events.length - 1 ? ' timeline-event-last' : ''}">` +
            `<div class="timeline-dot"></div>` +
            `<div class="timeline-content">` +
            `<div class="timeline-date">${e.data || ''}</div>` +
            `<div class="timeline-event-title">${e.tytul || ''}</div>` +
            `<div class="timeline-event-desc">${e.opis || ''}</div>` +
            `</div></div>`
          ).join('');
          return `\n\n<div class="timeline-box"><div class="timeline-title">${title}</div><div class="timeline-events"><div class="timeline-line"></div>${eventsHtml}</div></div>\n\n`;
        } catch {
          return '';
        }
      })
    // Convert <porównanie tytuł="...">JSON</porównanie> to comparison cards (double quotes)
    .replace(/<porównanie\s+tytu[łlć]?u?\s*=\s*"([^"]+)">([\s\S]*?)<\/porównanie>/gi,
      (_, title, jsonData) => {
        try {
          const items = JSON.parse(jsonData.trim());
          if (!Array.isArray(items)) return '';
          const cardsHtml = items.map((item: Record<string, string>) => {
            const keys = Object.keys(item);
            const przedKey = keys.find(k => k.toLowerCase().startsWith('przed'));
            const poKey = keys.find(k => k.toLowerCase().startsWith('po'));
            const przedValue = przedKey ? item[przedKey] : '';
            const poValue = poKey ? item[poKey] : '';
            return `<div class="comparison-card">` +
            `<div class="comparison-aspect">${item.aspekt || ''}</div>` +
            `<div class="comparison-columns">` +
            `<div class="comparison-before"><span class="comparison-change-label">${label('before', lang)}</span><span class="comparison-change-text">${przedValue}</span></div>` +
            `<div class="comparison-after"><span class="comparison-change-label">${label('after', lang)}</span><span class="comparison-change-text">${poValue}</span></div>` +
            `</div></div>`;
          }).join('');
          return `\n\n<div class="comparison-box"><span class="comparison-label">${label('comparison', lang)}</span><div class="comparison-title">${title}</div><div class="comparison-cards">${cardsHtml}</div></div>\n\n`;
        } catch {
          return '';
        }
      })
    // Convert <porównanie tytuł='...'>JSON</porównanie> to comparison cards (single quotes)
    .replace(/<porównanie\s+tytu[łlć]?u?\s*=\s*'([^']+)'>([\s\S]*?)<\/porównanie>/gi,
      (_, title, jsonData) => {
        try {
          const items = JSON.parse(jsonData.trim());
          if (!Array.isArray(items)) return '';
          const cardsHtml = items.map((item: Record<string, string>) => {
            const keys = Object.keys(item);
            const przedKey = keys.find(k => k.toLowerCase().startsWith('przed'));
            const poKey = keys.find(k => k.toLowerCase().startsWith('po'));
            const przedValue = przedKey ? item[przedKey] : '';
            const poValue = poKey ? item[poKey] : '';
            return `<div class="comparison-card">` +
            `<div class="comparison-aspect">${item.aspekt || ''}</div>` +
            `<div class="comparison-columns">` +
            `<div class="comparison-before"><span class="comparison-change-label">${label('before', lang)}</span><span class="comparison-change-text">${przedValue}</span></div>` +
            `<div class="comparison-after"><span class="comparison-change-label">${label('after', lang)}</span><span class="comparison-change-text">${poValue}</span></div>` +
            `</div></div>`;
          }).join('');
          return `\n\n<div class="comparison-box"><span class="comparison-label">${label('comparison', lang)}</span><div class="comparison-title">${title}</div><div class="comparison-cards">${cardsHtml}</div></div>\n\n`;
        } catch {
          return '';
        }
      })
    // Convert <layout-porownanie> alias (double quotes)
    .replace(/<layout-por[oó]wnanie\s+tytu[łlć]?u?\s*=\s*"([^"]+)">([\s\S]*?)<\/layout-por[oó]wnanie>/gi,
      (_, title, jsonData) => {
        try {
          const items = JSON.parse(jsonData.trim());
          if (!Array.isArray(items)) return '';
          const cardsHtml = items.map((item: Record<string, string>) => {
            const keys = Object.keys(item);
            const przedKey = keys.find(k => k.toLowerCase().startsWith('przed'));
            const poKey = keys.find(k => k.toLowerCase().startsWith('po'));
            const przedValue = przedKey ? item[przedKey] : '';
            const poValue = poKey ? item[poKey] : '';
            return `<div class="comparison-card">` +
            `<div class="comparison-aspect">${item.aspekt || ''}</div>` +
            `<div class="comparison-columns">` +
            `<div class="comparison-before"><span class="comparison-change-label">${label('before', lang)}</span><span class="comparison-change-text">${przedValue}</span></div>` +
            `<div class="comparison-after"><span class="comparison-change-label">${label('after', lang)}</span><span class="comparison-change-text">${poValue}</span></div>` +
            `</div></div>`;
          }).join('');
          return `\n\n<div class="comparison-box"><span class="comparison-label">${label('comparison', lang)}</span><div class="comparison-title">${title}</div><div class="comparison-cards">${cardsHtml}</div></div>\n\n`;
        } catch {
          return '';
        }
      })
    // Convert <layout-porownanie> alias (single quotes)
    .replace(/<layout-por[oó]wnanie\s+tytu[łlć]?u?\s*=\s*'([^']+)'>([\s\S]*?)<\/layout-por[oó]wnanie>/gi,
      (_, title, jsonData) => {
        try {
          const items = JSON.parse(jsonData.trim());
          if (!Array.isArray(items)) return '';
          const cardsHtml = items.map((item: Record<string, string>) => {
            const keys = Object.keys(item);
            const przedKey = keys.find(k => k.toLowerCase().startsWith('przed'));
            const poKey = keys.find(k => k.toLowerCase().startsWith('po'));
            const przedValue = przedKey ? item[przedKey] : '';
            const poValue = poKey ? item[poKey] : '';
            return `<div class="comparison-card">` +
            `<div class="comparison-aspect">${item.aspekt || ''}</div>` +
            `<div class="comparison-columns">` +
            `<div class="comparison-before"><span class="comparison-change-label">${label('before', lang)}</span><span class="comparison-change-text">${przedValue}</span></div>` +
            `<div class="comparison-after"><span class="comparison-change-label">${label('after', lang)}</span><span class="comparison-change-text">${poValue}</span></div>` +
            `</div></div>`;
          }).join('');
          return `\n\n<div class="comparison-box"><span class="comparison-label">${label('comparison', lang)}</span><div class="comparison-title">${title}</div><div class="comparison-cards">${cardsHtml}</div></div>\n\n`;
        } catch {
          return '';
        }
      })
    // Convert <wykres-wyniki> to sports results (double quotes)
    .replace(/<wykres-wyniki\s+tytu[łlć]?u?\s*=\s*"([^"]+)">([\s\S]*?)<\/wykres-wyniki>/gi,
      (_, title, jsonData) => {
        try {
          const matches = JSON.parse(jsonData.trim());
          if (!Array.isArray(matches) || matches.length === 0) return '';

          if (matches.length === 1) {
            const match = matches[0] as {strona1?: string, strona2?: string, wynik1?: number, wynik2?: number, runda?: string};
            const score1 = match.wynik1 ?? 0;
            const score2 = match.wynik2 ?? 0;
            const winner = score1 > score2 ? 1 : score1 < score2 ? 2 : 0;
            return `\n\n<div class="results-box results-box-single">` +
              `<div class="results-single-header">` +
              `<span class="results-label">${label('resultSingle', lang)}</span>` +
              `<span class="results-title">${title}</span>` +
              `</div>` +
              `<div class="results-single-match">` +
              `<span class="match-team${winner === 1 ? ' match-winner' : ''}">${match.strona1 || ''}</span>` +
              `<span class="match-score">${score1} : ${score2}</span>` +
              `<span class="match-team${winner === 2 ? ' match-winner' : ''}">${match.strona2 || ''}</span>` +
              `</div>` +
              (match.runda ? `<div class="results-single-round">${match.runda}</div>` : '') +
              `</div>\n\n`;
          }

          const matchesHtml = matches.map((match: {strona1?: string, strona2?: string, wynik1?: number, wynik2?: number, runda?: string}) => {
            const score1 = match.wynik1 ?? 0;
            const score2 = match.wynik2 ?? 0;
            const winner = score1 > score2 ? 1 : score1 < score2 ? 2 : 0;
            return `<div class="match-row">` +
              (match.runda ? `<div class="match-round">${match.runda}</div>` : '') +
              `<div class="match-teams">` +
              `<span class="match-team${winner === 1 ? ' match-winner' : ''}">${match.strona1 || ''}</span>` +
              `<span class="match-score">${score1} : ${score2}</span>` +
              `<span class="match-team${winner === 2 ? ' match-winner' : ''}">${match.strona2 || ''}</span>` +
              `</div></div>`;
          }).join('');
          return `\n\n<div class="results-box"><span class="results-label">${label('resultMultiple', lang)}</span><div class="results-title">${title}</div><div class="results-matches">${matchesHtml}</div></div>\n\n`;
        } catch {
          return '';
        }
      })
    // Convert <wykres-wyniki> to sports results (single quotes)
    .replace(/<wykres-wyniki\s+tytu[łlć]?u?\s*=\s*'([^']+)'>([\s\S]*?)<\/wykres-wyniki>/gi,
      (_, title, jsonData) => {
        try {
          const matches = JSON.parse(jsonData.trim());
          if (!Array.isArray(matches) || matches.length === 0) return '';

          if (matches.length === 1) {
            const match = matches[0] as {strona1?: string, strona2?: string, wynik1?: number, wynik2?: number, runda?: string};
            const score1 = match.wynik1 ?? 0;
            const score2 = match.wynik2 ?? 0;
            const winner = score1 > score2 ? 1 : score1 < score2 ? 2 : 0;
            return `\n\n<div class="results-box results-box-single">` +
              `<div class="results-single-header">` +
              `<span class="results-label">${label('resultSingle', lang)}</span>` +
              `<span class="results-title">${title}</span>` +
              `</div>` +
              `<div class="results-single-match">` +
              `<span class="match-team${winner === 1 ? ' match-winner' : ''}">${match.strona1 || ''}</span>` +
              `<span class="match-score">${score1} : ${score2}</span>` +
              `<span class="match-team${winner === 2 ? ' match-winner' : ''}">${match.strona2 || ''}</span>` +
              `</div>` +
              (match.runda ? `<div class="results-single-round">${match.runda}</div>` : '') +
              `</div>\n\n`;
          }

          const matchesHtml = matches.map((match: {strona1?: string, strona2?: string, wynik1?: number, wynik2?: number, runda?: string}) => {
            const score1 = match.wynik1 ?? 0;
            const score2 = match.wynik2 ?? 0;
            const winner = score1 > score2 ? 1 : score1 < score2 ? 2 : 0;
            return `<div class="match-row">` +
              (match.runda ? `<div class="match-round">${match.runda}</div>` : '') +
              `<div class="match-teams">` +
              `<span class="match-team${winner === 1 ? ' match-winner' : ''}">${match.strona1 || ''}</span>` +
              `<span class="match-score">${score1} : ${score2}</span>` +
              `<span class="match-team${winner === 2 ? ' match-winner' : ''}">${match.strona2 || ''}</span>` +
              `</div></div>`;
          }).join('');
          return `\n\n<div class="results-box"><span class="results-label">${label('resultMultiple', lang)}</span><div class="results-title">${title}</div><div class="results-matches">${matchesHtml}</div></div>\n\n`;
        } catch {
          return '';
        }
      })
    // Convert <tabela-wynikow> to rankings table (double quotes)
    .replace(/<tabela-wynikow\s+tytu[łlć]?u?\s*=\s*"([^"]+)">([\s\S]*?)<\/tabela-wynikow>/gi,
      (_, title, jsonData) => {
        try {
          const entries = JSON.parse(jsonData.trim());
          if (!Array.isArray(entries)) return '';
          const rowsHtml = entries.map((entry: {pozycja?: number, nazwa?: string, info?: string, wynik?: string}) => {
            return `<tr class="ranking-row">` +
              `<td class="ranking-position">${entry.pozycja || ''}</td>` +
              `<td class="ranking-name">${entry.nazwa || ''}${entry.info ? `<span class="ranking-info">${entry.info}</span>` : ''}</td>` +
              `<td class="ranking-score">${entry.wynik || ''}</td>` +
              `</tr>`;
          }).join('');
          return `\n\n<div class="ranking-box"><span class="ranking-label">${label('classification', lang)}</span><div class="ranking-title">${title}</div><table class="ranking-table"><tbody>${rowsHtml}</tbody></table></div>\n\n`;
        } catch {
          return '';
        }
      })
    // Convert <tabela-wynikow> to rankings table (single quotes)
    .replace(/<tabela-wynikow\s+tytu[łlć]?u?\s*=\s*'([^']+)'>([\s\S]*?)<\/tabela-wynikow>/gi,
      (_, title, jsonData) => {
        try {
          const entries = JSON.parse(jsonData.trim());
          if (!Array.isArray(entries)) return '';
          const rowsHtml = entries.map((entry: {pozycja?: number, nazwa?: string, info?: string, wynik?: string}) => {
            return `<tr class="ranking-row">` +
              `<td class="ranking-position">${entry.pozycja || ''}</td>` +
              `<td class="ranking-name">${entry.nazwa || ''}${entry.info ? `<span class="ranking-info">${entry.info}</span>` : ''}</td>` +
              `<td class="ranking-score">${entry.wynik || ''}</td>` +
              `</tr>`;
          }).join('');
          return `\n\n<div class="ranking-box"><span class="ranking-label">${label('classification', lang)}</span><div class="ranking-title">${title}</div><table class="ranking-table"><tbody>${rowsHtml}</tbody></table></div>\n\n`;
        } catch {
          return '';
        }
      })
    // Convert <ranking tytuł="..." typ="...">JSON</ranking> (double quotes)
    .replace(/<ranking\s+tytu[łlć]?u?\s*=\s*"([^"]+)"\s+typ\s*=\s*"([^"]+)">([\s\S]*?)<\/ranking>/gi,
      (_, title, typ, jsonData) => {
        try {
          const entries = JSON.parse(jsonData.trim());
          if (!Array.isArray(entries)) return '';
          const isTrofea = typ.toLowerCase() === 'trofea';
          const rankLabel = isTrofea ? label('achievements', lang) : label('ranking', lang);
          const rowsHtml = entries.map((entry: {pozycja?: number, nazwa?: string, info?: string}, index: number) => {
            const position = isTrofea ? `<span class="ranking-trophy"><i class="ri-trophy-fill"></i></span>` : `<span class="ranking-pos">${entry.pozycja || index + 1}.</span>`;
            return `<div class="ranking-item">` +
              position +
              `<span class="ranking-name">${entry.nazwa || ''}</span>` +
              (entry.info ? `<span class="ranking-info">${entry.info}</span>` : '') +
              `</div>`;
          }).join('');
          return `\n\n<div class="ranking-list-box ${isTrofea ? 'ranking-trofea' : 'ranking-pozycje'}"><span class="ranking-label">${rankLabel}</span><div class="ranking-title">${title}</div><div class="ranking-items">${rowsHtml}</div></div>\n\n`;
        } catch {
          return '';
        }
      })
    // Convert <ranking tytuł='...' typ='...'>JSON</ranking> (single quotes)
    .replace(/<ranking\s+tytu[łlć]?u?\s*=\s*'([^']+)'\s+typ\s*=\s*'([^']+)'>([\s\S]*?)<\/ranking>/gi,
      (_, title, typ, jsonData) => {
        try {
          const entries = JSON.parse(jsonData.trim());
          if (!Array.isArray(entries)) return '';
          const isTrofea = typ.toLowerCase() === 'trofea';
          const rankLabel = isTrofea ? label('achievements', lang) : label('ranking', lang);
          const rowsHtml = entries.map((entry: {pozycja?: number, nazwa?: string, info?: string}, index: number) => {
            const position = isTrofea ? `<span class="ranking-trophy"><i class="ri-trophy-fill"></i></span>` : `<span class="ranking-pos">${entry.pozycja || index + 1}.</span>`;
            return `<div class="ranking-item">` +
              position +
              `<span class="ranking-name">${entry.nazwa || ''}</span>` +
              (entry.info ? `<span class="ranking-info">${entry.info}</span>` : '') +
              `</div>`;
          }).join('');
          return `\n\n<div class="ranking-list-box ${isTrofea ? 'ranking-trofea' : 'ranking-pozycje'}"><span class="ranking-label">${rankLabel}</span><div class="ranking-title">${title}</div><div class="ranking-items">${rowsHtml}</div></div>\n\n`;
        } catch {
          return '';
        }
      })
    // Handle alternate attribute order for ranking (double quotes)
    .replace(/<ranking\s+typ\s*=\s*"([^"]+)"\s+tytu[łlć]?u?\s*=\s*"([^"]+)">([\s\S]*?)<\/ranking>/gi,
      (_, typ, title, jsonData) => {
        try {
          const entries = JSON.parse(jsonData.trim());
          if (!Array.isArray(entries)) return '';
          const isTrofea = typ.toLowerCase() === 'trofea';
          const rankLabel = isTrofea ? label('achievements', lang) : label('ranking', lang);
          const rowsHtml = entries.map((entry: {pozycja?: number, nazwa?: string, info?: string}, index: number) => {
            const position = isTrofea ? `<span class="ranking-trophy"><i class="ri-trophy-fill"></i></span>` : `<span class="ranking-pos">${entry.pozycja || index + 1}.</span>`;
            return `<div class="ranking-item">` +
              position +
              `<span class="ranking-name">${entry.nazwa || ''}</span>` +
              (entry.info ? `<span class="ranking-info">${entry.info}</span>` : '') +
              `</div>`;
          }).join('');
          return `\n\n<div class="ranking-list-box ${isTrofea ? 'ranking-trofea' : 'ranking-pozycje'}"><span class="ranking-label">${rankLabel}</span><div class="ranking-title">${title}</div><div class="ranking-items">${rowsHtml}</div></div>\n\n`;
        } catch {
          return '';
        }
      })
    // Handle alternate attribute order for ranking (single quotes)
    .replace(/<ranking\s+typ\s*=\s*'([^']+)'\s+tytu[łlć]?u?\s*=\s*'([^']+)'>([\s\S]*?)<\/ranking>/gi,
      (_, typ, title, jsonData) => {
        try {
          const entries = JSON.parse(jsonData.trim());
          if (!Array.isArray(entries)) return '';
          const isTrofea = typ.toLowerCase() === 'trofea';
          const rankLabel = isTrofea ? label('achievements', lang) : label('ranking', lang);
          const rowsHtml = entries.map((entry: {pozycja?: number, nazwa?: string, info?: string}, index: number) => {
            const position = isTrofea ? `<span class="ranking-trophy"><i class="ri-trophy-fill"></i></span>` : `<span class="ranking-pos">${entry.pozycja || index + 1}.</span>`;
            return `<div class="ranking-item">` +
              position +
              `<span class="ranking-name">${entry.nazwa || ''}</span>` +
              (entry.info ? `<span class="ranking-info">${entry.info}</span>` : '') +
              `</div>`;
          }).join('');
          return `\n\n<div class="ranking-list-box ${isTrofea ? 'ranking-trofea' : 'ranking-pozycje'}"><span class="ranking-label">${rankLabel}</span><div class="ranking-title">${title}</div><div class="ranking-items">${rowsHtml}</div></div>\n\n`;
        } catch {
          return '';
        }
      })
    // Convert <kalendarz> to calendar events (double quotes)
    .replace(/<kalendarz\s+tytu[łlć]?u?\s*=\s*"([^"]+)">([\s\S]*?)<\/kalendarz>/gi,
      (_, title, jsonData) => {
        try {
          const events = JSON.parse(jsonData.trim());
          if (!Array.isArray(events)) return '';
          const rowsHtml = events.map((event: {data?: string, wydarzenie?: string}) => {
            return `<tr class="calendar-row">` +
              `<td class="calendar-date">${event.data || ''}</td>` +
              `<td class="calendar-desc">${event.wydarzenie || ''}</td>` +
              `</tr>`;
          }).join('');
          return `\n\n<div class="calendar-box"><span class="calendar-label">${label('calendar', lang)}</span><div class="calendar-title">${title}</div><table class="calendar-table"><tbody>${rowsHtml}</tbody></table></div>\n\n`;
        } catch {
          return '';
        }
      })
    // Convert <kalendarz> to calendar events (single quotes)
    .replace(/<kalendarz\s+tytu[łlć]?u?\s*=\s*'([^']+)'>([\s\S]*?)<\/kalendarz>/gi,
      (_, title, jsonData) => {
        try {
          const events = JSON.parse(jsonData.trim());
          if (!Array.isArray(events)) return '';
          const rowsHtml = events.map((event: {data?: string, wydarzenie?: string}) => {
            return `<tr class="calendar-row">` +
              `<td class="calendar-date">${event.data || ''}</td>` +
              `<td class="calendar-desc">${event.wydarzenie || ''}</td>` +
              `</tr>`;
          }).join('');
          return `\n\n<div class="calendar-box"><span class="calendar-label">${label('calendar', lang)}</span><div class="calendar-title">${title}</div><table class="calendar-table"><tbody>${rowsHtml}</tbody></table></div>\n\n`;
        } catch {
          return '';
        }
      })
    // Remove <wykres-słupkowy> tags - they are handled separately as React components in EventSummary
    .replace(/<wykres-s[łt][uó]pkowy\s+tytu[łlć]?u?\s*=\s*["'][^"']+["']\s+jednostk[ai]?\s*=\s*["'][^"']+["']>[\s\S]*?<\/wykres-s[łt][uó]pkowy>/gi, '')
    .replace(/<wykres-s[łt][uó]pkowy\s+jednostk[ai]?\s*=\s*["'][^"']+["']\s+tytu[łlć]?u?\s*=\s*["'][^"']+["']>[\s\S]*?<\/wykres-s[łt][uó]pkowy>/gi, '')
    // Remove <wykres-liniowy> tags - they are handled separately as React components in EventSummary
    .replace(/<wykres-liniowy\s+tytu[łlć]?u?\s*=\s*["'][^"']+["']\s+jednostk[ai]?\s*=\s*["'][^"']+["']>[\s\S]*?<\/wykres-liniowy>/gi, '')
    .replace(/<wykres-liniowy\s+jednostk[ai]?\s*=\s*["'][^"']+["']\s+tytu[łlć]?u?\s*=\s*["'][^"']+["']>[\s\S]*?<\/wykres-liniowy>/gi, '')
    // Convert <wykres-kołowy> to stacked bar representation (double quotes)
    .replace(/<wykres-kołowy\s+tytu[łlć]?u?\s*=\s*"([^"]+)"(?:\s+jednostk[ai]?\s*=\s*"[^"]*")?>([\s\S]*?)<\/wykres-kołowy>/gi,
      (_, title, dataStr) => {
        const COLORS = ['#e23c0f', '#3c3c3c', '#969696', '#c8c8c8', '#1e1e1e', '#787878'];
        const items: {label: string, value: number}[] = [];
        dataStr.split(',').forEach((pair: string) => {
          const match = pair.trim().match(/^([^:]+):\s*([\d.,]+)/);
          if (match) {
            items.push({ label: match[1].trim(), value: parseFloat(match[2].replace(',', '.')) });
          }
        });
        if (items.length < 2) return '';
        const total = items.reduce((sum, item) => sum + item.value, 0);
        if (total === 0) return '';
        const segmentsHtml = items.map((item, i) => {
          const pct = (item.value / total) * 100;
          return `<div class="stacked-segment" style="width: ${pct}%; background: ${COLORS[i % COLORS.length]};"></div>`;
        }).join('');
        const legendHtml = items.map((item, i) => {
          const pct = Math.round((item.value / total) * 100);
          return `<div class="stacked-legend-item"><span class="stacked-legend-color" style="background: ${COLORS[i % COLORS.length]};"></span><span class="stacked-legend-text">${item.label}</span><span class="stacked-legend-pct">${pct}%</span></div>`;
        }).join('');
        return `\n\n<div class="stacked-box"><span class="stacked-label">${label('structure', lang)}</span><div class="stacked-title">${title}</div><div class="stacked-bar">${segmentsHtml}</div><div class="stacked-legend">${legendHtml}</div></div>\n\n`;
      })
    // Convert <wykres-kołowy> to stacked bar representation (single quotes)
    .replace(/<wykres-kołowy\s+tytu[łlć]?u?\s*=\s*'([^']+)'(?:\s+jednostk[ai]?\s*=\s*'[^']*')?>([\s\S]*?)<\/wykres-kołowy>/gi,
      (_, title, dataStr) => {
        const COLORS = ['#e23c0f', '#3c3c3c', '#969696', '#c8c8c8', '#1e1e1e', '#787878'];
        const items: {label: string, value: number}[] = [];
        dataStr.split(',').forEach((pair: string) => {
          const match = pair.trim().match(/^([^:]+):\s*([\d.,]+)/);
          if (match) {
            items.push({ label: match[1].trim(), value: parseFloat(match[2].replace(',', '.')) });
          }
        });
        if (items.length < 2) return '';
        const total = items.reduce((sum, item) => sum + item.value, 0);
        if (total === 0) return '';
        const segmentsHtml = items.map((item, i) => {
          const pct = (item.value / total) * 100;
          return `<div class="stacked-segment" style="width: ${pct}%; background: ${COLORS[i % COLORS.length]};"></div>`;
        }).join('');
        const legendHtml = items.map((item, i) => {
          const pct = Math.round((item.value / total) * 100);
          return `<div class="stacked-legend-item"><span class="stacked-legend-color" style="background: ${COLORS[i % COLORS.length]};"></span><span class="stacked-legend-text">${item.label}</span><span class="stacked-legend-pct">${pct}%</span></div>`;
        }).join('');
        return `\n\n<div class="stacked-box"><span class="stacked-label">${label('structure', lang)}</span><div class="stacked-title">${title}</div><div class="stacked-bar">${segmentsHtml}</div><div class="stacked-legend">${legendHtml}</div></div>\n\n`;
      })
    // Remove all remaining HTML tags except allowed ones
    .replace(/<(?!a\s|\/a>|b>|\/b>|i\s|\/i>|strong>|\/strong>|div\s|\/div>|span\s|\/span>|p\s|\/p>|blockquote\s|\/blockquote>|cite\s|\/cite>|table\s|\/table>|thead>|\/thead>|tbody>|\/tbody>|tr\s|\/tr>|th>|\/th>|td\s|\/td>|h3\s|\/h3>|br\s|br>|br\/>)[^>]+>/gi, '')
    // Sanitize <a> tags to only allow href
    .replace(/<a\s[^>]*?href\s*=\s*["']([^"']*?)["'][^>]*?>/gi, '<a href="$1" target="_blank" rel="noopener noreferrer">')
    .replace(/<a(?!\s[^>]*href)[^>]*>/gi, '')
    .replace(/<\/a>/gi, '</a>')
    .replace(/<\/b>/gi, '</b>')
    .replace(/<b>/gi, '<b>');

  // Convert to paragraphs
  const paragraphs = processedText
    .split('\n\n')
    .filter(p => p.trim())
    .map(p => {
      // Don't wrap block elements in <p>
      const isBlock = /class="(context-box|quote-box|bias-wrapper|manipulation-box|chart-box|timeline-box|comparison-box|factcheck-box|results-box|ranking-box|key-number-box|stacked-box|calendar-box|section-box|ranking-list-box)"/.test(p);
      return isBlock ? p : `<p>${p}</p>`;
    })
    .join('');

  // Remove event UUID/ID references like (ID: 123), (event bd6b1f5c-...), or just (bd6b1f5c-...)
  const cleaned = paragraphs.replace(/\s*\((?:ID:\s*\d+|(?:event\s+)?[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\)/gi, '');

  // Apply widow prevention to text nodes only (after all HTML processing)
  return preventWidowsInHtml(cleaned);
}

/**
 * Simplified version for inline contexts (no paragraph wrapping)
 */
// ==========================================
// SEO utilities for meta tags
// ==========================================

const OG_TITLE_MAX_LENGTH = 60;
const OG_DESCRIPTION_MAX_LENGTH = 160;

/**
 * Truncates text to specified length, breaking at word boundary.
 * Adds ellipsis if text was truncated.
 */
function truncateAtWord(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  // If we found a space and it's not too far back, break there
  if (lastSpace > maxLength * 0.7) {
    return truncated.slice(0, lastSpace) + '…';
  }

  return truncated.slice(0, maxLength - 1) + '…';
}

/**
 * Prepares text for og:title - strips HTML, decodes entities, truncates to 60 chars
 */
export function prepareOgTitle(text: string | undefined): string {
  if (!text) return '';
  const plain = stripHtmlForPlainText(text);
  return truncateAtWord(plain, OG_TITLE_MAX_LENGTH);
}

/**
 * Prepares text for og:description - strips HTML, decodes entities, truncates to 160 chars
 */
export function prepareOgDescription(text: string | undefined): string {
  if (!text) return '';
  const plain = stripHtmlForPlainText(text);
  return truncateAtWord(plain, OG_DESCRIPTION_MAX_LENGTH);
}

/**
 * Simplified version for inline contexts (no paragraph wrapping)
 */
export function sanitizeAndProcessInlineHtml(text: string, _lang: Language = 'pl'): string {
  if (!text || typeof text !== 'string') return text ?? '';

  let processedText = text
    .replace(/&amp;lt;/g, '&lt;')
    .replace(/&amp;gt;/g, '&gt;')
    .replace(/&amp;/g, '&')
    .replace(/&bdquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '…');

  processedText = processedText
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/&lt;(\/?)przypis/gi, '<$1przypis')
    .replace(/&lt;(\/?)note/gi, '<$1note')
    .replace(/&gt;/g, '>');

  // Normalize English tag names and attributes to Polish equivalents
  processedText = normalizeEnglishTags(processedText);

  processedText = processedText
    // Convert przypis to tooltip
    .replace(/<przypis\s+title\s*=\s*["']([^"']+)["']\s+opis\s*=\s*["']([^"']+)["']\s*\/?>([\s\S]*?)<\/przypis>/gi,
      '<span class="footnote" tabindex="0"><span class="footnote-term">$3</span><span class="footnote-tooltip"><span class="footnote-title">$1</span><span class="footnote-desc">$2</span></span></span>')
    .replace(/<przypis\s+opis\s*=\s*["']([^"']+)["']\s+title\s*=\s*["']([^"']+)["']\s*\/?>([\s\S]*?)<\/przypis>/gi,
      '<span class="footnote" tabindex="0"><span class="footnote-term">$3</span><span class="footnote-tooltip"><span class="footnote-title">$2</span><span class="footnote-desc">$1</span></span></span>')
    .replace(/<przypis\s+title\s*=\s*["']([^"']+)["']\s+opis\s*=\s*["']([^"']+)["']\s*\/>/gi,
      '<span class="footnote" tabindex="0"><span class="footnote-term">$1</span><span class="footnote-tooltip"><span class="footnote-title">$1</span><span class="footnote-desc">$2</span></span></span>')
    .replace(/<przypis[^>]*>([\s\S]*?)<\/przypis>/gi, '$1')
    // Remove all tags except a, b, span
    .replace(/<(?!a\s|\/a>|b>|\/b>|span\s|\/span>)[^>]+>/gi, '')
    .replace(/<a\s[^>]*?href\s*=\s*["']([^"']*?)["'][^>]*?>/gi, '<a href="$1" target="_blank" rel="noopener noreferrer">')
    .replace(/<a(?!\s[^>]*href)[^>]*>/gi, '')
    .replace(/<\/a>/gi, '</a>')
    .replace(/<\/b>/gi, '</b>')
    .replace(/<b>/gi, '<b>');

  const cleaned = processedText.replace(/\s*\((?:ID:\s*\d+|event\s+[a-f0-9-]+)\)/gi, '');

  // Apply widow prevention to text nodes only (after all HTML processing)
  return preventWidowsInHtml(cleaned);
}
