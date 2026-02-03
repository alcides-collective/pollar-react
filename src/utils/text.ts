/**
 * Text utilities for processing custom HTML tags in summaries
 * Ported from pollar-web/pollar-sveltekit/src/lib/utils/text.ts
 */

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
 * Extract key number from summary for display in sidebar (desktop only)
 */
export function extractKeyNumber(summary: string | undefined): ExtractedKeyNumber | null {
  if (!summary) return null;

  const match = summary.match(/<kluczowa-liczba\s+wartość\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/kluczowa-liczba>/i);
  if (!match) return null;

  return {
    value: match[1],
    description: match[2].trim()
  };
}

/**
 * Extract timeline from summary for display in sidebar (desktop only)
 */
export function extractTimeline(summary: string | undefined): ExtractedTimeline | null {
  if (!summary) return null;

  const match = summary.match(/<timeline\s+tytu[łl]u?\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/timeline>/i);
  if (!match) return null;

  try {
    const events = JSON.parse(match[2].trim());
    if (!Array.isArray(events)) return null;
    return {
      title: match[1],
      events
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

  // Match both attribute orders: tytuł + jednostka and jednostka + tytuł
  const regex1 = /<wykres-liniowy\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["']\s+jednostk?a?\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/wykres-liniowy>/gi;
  const regex2 = /<wykres-liniowy\s+jednostk?a?\s*=\s*["']([^"']+)["']\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/wykres-liniowy>/gi;

  let match;
  let chartIndex = 0;

  // Process first order (tytuł, jednostka)
  while ((match = regex1.exec(summary)) !== null) {
    const [, title, unit, dataStr] = match;
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

  // Process second order (jednostka, tytuł)
  while ((match = regex2.exec(summary)) !== null) {
    const [, unit, title, dataStr] = match;
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

  return summary
    // Remove kluczowa-liczba tags
    .replace(/<kluczowa-liczba\s+wartość\s*=\s*["'][^"']+["']>[\s\S]*?<\/kluczowa-liczba>/gi, '')
    // Remove timeline tags
    .replace(/<timeline\s+tytu[łl]u?\s*=\s*["'][^"']+["']>[\s\S]*?<\/timeline>/gi, '')
    // Clean up extra whitespace/newlines left behind
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Prevents widows/orphans by replacing spaces after single characters with non-breaking spaces
 * Handles Polish characters as well
 */
export function preventWidows(text: string): string {
  if (!text || typeof text !== 'string') return text ?? '';

  return text
    .replace(/\s+([a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ])\s+/g, ' $1\u00A0')
    .replace(/\s+([a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ])$/g, ' $1');
}

/**
 * Strips all HTML tags from text, leaving only plain text content.
 * Also decodes HTML entities and replaces Polish quotes.
 */
export function stripHtmlForPlainText(text: string): string {
  if (!text || typeof text !== 'string') return text ?? '';

  return text
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
export function sanitizeAndProcessHtml(text: string): string {
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

  // Apply widow prevention
  processedText = preventWidows(processedText);

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
    .replace(/&gt;/g, '>')
    // Convert markdown bold **text** to <b>text</b>
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    // Convert <sekcja tytuł="..."> to section header
    // Replace \n\n inside section content with paragraph break div
    .replace(/<sekcja\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/sekcja>/gi,
      (_, title, content) => {
        const processedContent = content.replace(/\n\n+/g, '</p><p>');
        return `\n\n<div class="section-box"><h3 class="section-title">${title}</h3><div class="section-content"><p>${processedContent}</p></div></div>\n\n`;
      })
    // Convert <kontekst> tags to styled context box
    .replace(/<kontekst>([\s\S]*?)<\/kontekst>/gi,
      '\n\n<div class="context-box"><p class="context-text">$1</p></div>\n\n')
    // Convert <bias left="..." right="..."> tags to styled bias comparison box
    .replace(/<bias\s+left\s*=\s*["']([^"']+)["']\s+right\s*=\s*["']([^"']+)["']><\/bias>/gi,
      '\n\n<div class="bias-wrapper"><span class="bias-header">PERSPEKTYWY POLITYCZNE</span><div class="bias-columns"><div class="bias-column bias-left"><span class="bias-label">Źródła liberalne</span><p class="bias-text">$1</p></div><div class="bias-column bias-right"><span class="bias-label">Źródła konserwatywne</span><p class="bias-text">$2</p></div></div></div>\n\n')
    // Handle alternate attribute order: right first, then left
    .replace(/<bias\s+right\s*=\s*["']([^"']+)["']\s+left\s*=\s*["']([^"']+)["']><\/bias>/gi,
      '\n\n<div class="bias-wrapper"><span class="bias-header">PERSPEKTYWY POLITYCZNE</span><div class="bias-columns"><div class="bias-column bias-left"><span class="bias-label">Źródła liberalne</span><p class="bias-text">$2</p></div><div class="bias-column bias-right"><span class="bias-label">Źródła konserwatywne</span><p class="bias-text">$1</p></div></div></div>\n\n')
    // Convert <manipulacja autor="..." cytat="...">explanation</manipulacja> to styled manipulation callout
    .replace(/<manipulacja\s+autor\s*=\s*["']([^"']+)["']\s+cytat\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/manipulacja>/gi,
      '\n\n<div class="manipulation-box"><span class="manipulation-label">WYKRYTO MANIPULACJĘ</span><div class="manipulation-source">Źródło: $1</div><blockquote class="manipulation-quote">„$2"</blockquote><p class="manipulation-explanation">$3</p></div>\n\n')
    // Handle alternate attribute order: cytat first, then autor
    .replace(/<manipulacja\s+cytat\s*=\s*["']([^"']+)["']\s+autor\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/manipulacja>/gi,
      '\n\n<div class="manipulation-box"><span class="manipulation-label">WYKRYTO MANIPULACJĘ</span><div class="manipulation-source">Źródło: $2</div><blockquote class="manipulation-quote">„$1"</blockquote><p class="manipulation-explanation">$3</p></div>\n\n')
    // Convert <kluczowa-liczba wartość="...">description</kluczowa-liczba> to number callout
    .replace(/<kluczowa-liczba\s+wartość\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/kluczowa-liczba>/gi,
      '\n\n<div class="key-number-box"><span class="key-number-value">$1</span><span class="key-number-description">$2</span></div>\n\n')
    // Convert <weryfikacja werdykt="..." źródło="...">explanation</weryfikacja> to fact-check box
    .replace(/<weryfikacja\s+werdykt\s*=\s*["']([^"']+)["']\s+źródło\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/weryfikacja>/gi,
      (_, verdict, source, explanation) => {
        const verdictClass = verdict.toLowerCase().includes('fałsz') ? 'verdict-false' :
                            verdict.toLowerCase().includes('prawdziwe') || verdict.toLowerCase() === 'prawda' ? 'verdict-true' : 'verdict-partial';
        const verdictIcon = verdict.toLowerCase().includes('fałsz') ? '✗' :
                           verdict.toLowerCase().includes('prawdziwe') || verdict.toLowerCase() === 'prawda' ? '✓' : '~';
        return `\n\n<div class="factcheck-box ${verdictClass}"><span class="factcheck-label">WERYFIKACJA</span><div class="factcheck-verdict"><span class="verdict-icon">${verdictIcon}</span><span class="verdict-text">${verdict}</span></div><p class="factcheck-explanation">${explanation}</p><div class="factcheck-source">Źródło: ${source}</div></div>\n\n`;
      })
    // Handle alternate attribute order for weryfikacja
    .replace(/<weryfikacja\s+źródło\s*=\s*["']([^"']+)["']\s+werdykt\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/weryfikacja>/gi,
      (_, source, verdict, explanation) => {
        const verdictClass = verdict.toLowerCase().includes('fałsz') ? 'verdict-false' :
                            verdict.toLowerCase().includes('prawdziwe') || verdict.toLowerCase() === 'prawda' ? 'verdict-true' : 'verdict-partial';
        const verdictIcon = verdict.toLowerCase().includes('fałsz') ? '✗' :
                           verdict.toLowerCase().includes('prawdziwe') || verdict.toLowerCase() === 'prawda' ? '✓' : '~';
        return `\n\n<div class="factcheck-box ${verdictClass}"><span class="factcheck-label">WERYFIKACJA</span><div class="factcheck-verdict"><span class="verdict-icon">${verdictIcon}</span><span class="verdict-text">${verdict}</span></div><p class="factcheck-explanation">${explanation}</p><div class="factcheck-source">Źródło: ${source}</div></div>\n\n`;
      })
    // Convert <cytat autor="..." miejsce="..."> tags to styled quote box
    .replace(/<cytat\s+autor\s*=\s*["']([^"']+)["']\s+miejsce\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/cytat>/gi,
      (_, autor, miejsce, text) => {
        const hasQuotes = /^[\u201E„"'\u201C]/.test(text.trim()) && /[\u201D"'\u201C"]$/.test(text.trim());
        const quotedText = hasQuotes ? text : `„${text}"`;
        return `\n\n<blockquote class="quote-box"><span class="quote-location">${miejsce}</span><p class="quote-text">${quotedText}</p><cite class="quote-author">${autor}</cite></blockquote>\n\n`;
      })
    // Convert <cytat miejsce="..." autor="..."> (alternate order)
    .replace(/<cytat\s+miejsce\s*=\s*["']([^"']+)["']\s+autor\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/cytat>/gi,
      (_, miejsce, autor, text) => {
        const hasQuotes = /^[\u201E„"'\u201C]/.test(text.trim()) && /[\u201D"'\u201C"]$/.test(text.trim());
        const quotedText = hasQuotes ? text : `„${text}"`;
        return `\n\n<blockquote class="quote-box"><span class="quote-location">${miejsce}</span><p class="quote-text">${quotedText}</p><cite class="quote-author">${autor}</cite></blockquote>\n\n`;
      })
    // Convert <cytat autor="..."> (without location)
    .replace(/<cytat\s+autor\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/cytat>/gi,
      (_, autor, text) => {
        const hasQuotes = /^[\u201E„"'\u201C]/.test(text.trim()) && /[\u201D"'\u201C"]$/.test(text.trim());
        const quotedText = hasQuotes ? text : `„${text}"`;
        return `\n\n<blockquote class="quote-box"><p class="quote-text">${quotedText}</p><cite class="quote-author">${autor}</cite></blockquote>\n\n`;
      })
    // Convert <przypis title="..." opis="...">term</przypis> to tooltip
    .replace(/<przypis\s+title\s*=\s*["']([^"']+)["']\s+opis\s*=\s*["']([^"']+)["']\s*\/?>([\s\S]*?)<\/przypis>/gi,
      '<span class="footnote" tabindex="0"><span class="footnote-term">$3</span><span class="footnote-tooltip"><span class="footnote-title">$1</span><span class="footnote-desc">$2</span></span></span>')
    // Handle alternate attribute order: opis first, then title
    .replace(/<przypis\s+opis\s*=\s*["']([^"']+)["']\s+title\s*=\s*["']([^"']+)["']\s*\/?>([\s\S]*?)<\/przypis>/gi,
      '<span class="footnote" tabindex="0"><span class="footnote-term">$3</span><span class="footnote-tooltip"><span class="footnote-title">$2</span><span class="footnote-desc">$1</span></span></span>')
    // Handle self-closing przypis
    .replace(/<przypis\s+title\s*=\s*["']([^"']+)["']\s+opis\s*=\s*["']([^"']+)["']\s*\/>/gi,
      '<span class="footnote" tabindex="0"><span class="footnote-term">$1</span><span class="footnote-tooltip"><span class="footnote-title">$1</span><span class="footnote-desc">$2</span></span></span>')
    // Fallback: any remaining przypis tags - strip keeping content
    .replace(/<przypis[^>]*>([\s\S]*?)<\/przypis>/gi, '$1')
    // Remove <ankieta> tags - polls are temporarily disabled
    .replace(/<ankieta\s+pytanie\s*=\s*["'][^"']+["']>[\s\S]*?<\/ankieta>/gi, '')
    // Convert <timeline tytuł="...">JSON</timeline> to timeline
    .replace(/<timeline\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/timeline>/gi,
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
    // Convert <porównanie tytuł="...">JSON</porównanie> to comparison cards
    .replace(/<porównanie\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/porównanie>/gi,
      (_, title, jsonData) => {
        try {
          const items = JSON.parse(jsonData.trim());
          if (!Array.isArray(items)) return '';
          const cardsHtml = items.map((item: Record<string, string>) => {
            // Find keys dynamically - support "przed", "przed (na Allegro)", etc.
            const keys = Object.keys(item);
            const przedKey = keys.find(k => k.toLowerCase().startsWith('przed'));
            const poKey = keys.find(k => k.toLowerCase().startsWith('po'));
            const przedValue = przedKey ? item[przedKey] : '';
            const poValue = poKey ? item[poKey] : '';
            return `<div class="comparison-card">` +
            `<div class="comparison-aspect">${item.aspekt || ''}</div>` +
            `<div class="comparison-columns">` +
            `<div class="comparison-before"><span class="comparison-change-label">Przed</span><span class="comparison-change-text">${przedValue}</span></div>` +
            `<div class="comparison-after"><span class="comparison-change-label">Po</span><span class="comparison-change-text">${poValue}</span></div>` +
            `</div></div>`;
          }).join('');
          return `\n\n<div class="comparison-box"><span class="comparison-label">PORÓWNANIE</span><div class="comparison-title">${title}</div><div class="comparison-cards">${cardsHtml}</div></div>\n\n`;
        } catch {
          return '';
        }
      })
    // Convert <layout-porownanie> alias
    .replace(/<layout-por[oó]wnanie\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/layout-por[oó]wnanie>/gi,
      (_, title, jsonData) => {
        try {
          const items = JSON.parse(jsonData.trim());
          if (!Array.isArray(items)) return '';
          const cardsHtml = items.map((item: Record<string, string>) => {
            // Find keys dynamically - support "przed", "przed (na Allegro)", etc.
            const keys = Object.keys(item);
            const przedKey = keys.find(k => k.toLowerCase().startsWith('przed'));
            const poKey = keys.find(k => k.toLowerCase().startsWith('po'));
            const przedValue = przedKey ? item[przedKey] : '';
            const poValue = poKey ? item[poKey] : '';
            return `<div class="comparison-card">` +
            `<div class="comparison-aspect">${item.aspekt || ''}</div>` +
            `<div class="comparison-columns">` +
            `<div class="comparison-before"><span class="comparison-change-label">Przed</span><span class="comparison-change-text">${przedValue}</span></div>` +
            `<div class="comparison-after"><span class="comparison-change-label">Po</span><span class="comparison-change-text">${poValue}</span></div>` +
            `</div></div>`;
          }).join('');
          return `\n\n<div class="comparison-box"><span class="comparison-label">PORÓWNANIE</span><div class="comparison-title">${title}</div><div class="comparison-cards">${cardsHtml}</div></div>\n\n`;
        } catch {
          return '';
        }
      })
    // Convert <wykres-wyniki> to sports results
    .replace(/<wykres-wyniki\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/wykres-wyniki>/gi,
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
              `<span class="results-label">WYNIK</span>` +
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
          return `\n\n<div class="results-box"><span class="results-label">WYNIKI</span><div class="results-title">${title}</div><div class="results-matches">${matchesHtml}</div></div>\n\n`;
        } catch {
          return '';
        }
      })
    // Convert <tabela-wynikow> to rankings table
    .replace(/<tabela-wynikow\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/tabela-wynikow>/gi,
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
          return `\n\n<div class="ranking-box"><span class="ranking-label">KLASYFIKACJA</span><div class="ranking-title">${title}</div><table class="ranking-table"><tbody>${rowsHtml}</tbody></table></div>\n\n`;
        } catch {
          return '';
        }
      })
    // Convert <ranking tytuł="..." typ="...">JSON</ranking>
    .replace(/<ranking\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["']\s+typ\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/ranking>/gi,
      (_, title, typ, jsonData) => {
        try {
          const entries = JSON.parse(jsonData.trim());
          if (!Array.isArray(entries)) return '';
          const isTrofea = typ.toLowerCase() === 'trofea';
          const label = isTrofea ? 'OSIĄGNIĘCIA' : 'RANKING';
          const rowsHtml = entries.map((entry: {pozycja?: number, nazwa?: string, info?: string}, index: number) => {
            const position = isTrofea ? `<span class="ranking-trophy">🏆</span>` : `<span class="ranking-pos">${entry.pozycja || index + 1}.</span>`;
            return `<div class="ranking-item">` +
              position +
              `<span class="ranking-name">${entry.nazwa || ''}</span>` +
              (entry.info ? `<span class="ranking-info">${entry.info}</span>` : '') +
              `</div>`;
          }).join('');
          return `\n\n<div class="ranking-list-box ${isTrofea ? 'ranking-trofea' : 'ranking-pozycje'}"><span class="ranking-label">${label}</span><div class="ranking-title">${title}</div><div class="ranking-items">${rowsHtml}</div></div>\n\n`;
        } catch {
          return '';
        }
      })
    // Handle alternate attribute order for ranking
    .replace(/<ranking\s+typ\s*=\s*["']([^"']+)["']\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/ranking>/gi,
      (_, typ, title, jsonData) => {
        try {
          const entries = JSON.parse(jsonData.trim());
          if (!Array.isArray(entries)) return '';
          const isTrofea = typ.toLowerCase() === 'trofea';
          const label = isTrofea ? 'OSIĄGNIĘCIA' : 'RANKING';
          const rowsHtml = entries.map((entry: {pozycja?: number, nazwa?: string, info?: string}, index: number) => {
            const position = isTrofea ? `<span class="ranking-trophy">🏆</span>` : `<span class="ranking-pos">${entry.pozycja || index + 1}.</span>`;
            return `<div class="ranking-item">` +
              position +
              `<span class="ranking-name">${entry.nazwa || ''}</span>` +
              (entry.info ? `<span class="ranking-info">${entry.info}</span>` : '') +
              `</div>`;
          }).join('');
          return `\n\n<div class="ranking-list-box ${isTrofea ? 'ranking-trofea' : 'ranking-pozycje'}"><span class="ranking-label">${label}</span><div class="ranking-title">${title}</div><div class="ranking-items">${rowsHtml}</div></div>\n\n`;
        } catch {
          return '';
        }
      })
    // Convert <kalendarz> to calendar events
    .replace(/<kalendarz\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/kalendarz>/gi,
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
          return `\n\n<div class="calendar-box"><span class="calendar-label">KALENDARZ</span><div class="calendar-title">${title}</div><table class="calendar-table"><tbody>${rowsHtml}</tbody></table></div>\n\n`;
        } catch {
          return '';
        }
      })
    // Convert <wykres-słupkowy> to simple bar representation (text-based for now)
    .replace(/<wykres-s[łt][uó]pkowy\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["']\s+jednostk?a?\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/wykres-s[łt][uó]pkowy>/gi,
      (_, title, unit, dataStr) => {
        try {
          const items: {label: string, value: number}[] = [];
          dataStr.split(',').forEach((pair: string) => {
            const match = pair.trim().match(/^([^:]+):\s*([\d.,]+)/);
            if (match) {
              items.push({ label: match[1].trim(), value: parseFloat(match[2].replace(',', '.')) });
            }
          });
          if (items.length === 0) return '';
          const maxValue = Math.max(...items.map(i => i.value));
          const barsHtml = items.map(item => {
            const pct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
            const displayUnit = unit.toLowerCase() === 'liczba' ? '' : ` ${unit}`;
            return `<div class="chart-bar-row"><span class="chart-bar-label">${item.label}</span><div class="chart-bar-track"><div class="chart-bar-fill" style="width: ${pct}%"></div></div><span class="chart-bar-value">${item.value}${displayUnit}</span></div>`;
          }).join('');
          return `\n\n<div class="chart-box"><span class="chart-label">WYKRES</span><div class="chart-title">${title}</div><div class="chart-bars">${barsHtml}</div></div>\n\n`;
        } catch {
          return '';
        }
      })
    // Handle alternate attribute order for wykres-słupkowy
    .replace(/<wykres-s[łt][uó]pkowy\s+jednostk?a?\s*=\s*["']([^"']+)["']\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/wykres-s[łt][uó]pkowy>/gi,
      (_, unit, title, dataStr) => {
        try {
          const items: {label: string, value: number}[] = [];
          dataStr.split(',').forEach((pair: string) => {
            const match = pair.trim().match(/^([^:]+):\s*([\d.,]+)/);
            if (match) {
              items.push({ label: match[1].trim(), value: parseFloat(match[2].replace(',', '.')) });
            }
          });
          if (items.length === 0) return '';
          const maxValue = Math.max(...items.map(i => i.value));
          const barsHtml = items.map(item => {
            const pct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
            const displayUnit = unit.toLowerCase() === 'liczba' ? '' : ` ${unit}`;
            return `<div class="chart-bar-row"><span class="chart-bar-label">${item.label}</span><div class="chart-bar-track"><div class="chart-bar-fill" style="width: ${pct}%"></div></div><span class="chart-bar-value">${item.value}${displayUnit}</span></div>`;
          }).join('');
          return `\n\n<div class="chart-box"><span class="chart-label">WYKRES</span><div class="chart-title">${title}</div><div class="chart-bars">${barsHtml}</div></div>\n\n`;
        } catch {
          return '';
        }
      })
    // Remove <wykres-liniowy> tags - they are handled separately as React components in EventSummary
    .replace(/<wykres-liniowy\s+tytu[łlć]?u?\s*=\s*["'][^"']+["']\s+jednostk?a?\s*=\s*["'][^"']+["']>[\s\S]*?<\/wykres-liniowy>/gi, '')
    .replace(/<wykres-liniowy\s+jednostk?a?\s*=\s*["'][^"']+["']\s+tytu[łlć]?u?\s*=\s*["'][^"']+["']>[\s\S]*?<\/wykres-liniowy>/gi, '')
    // Convert <wykres-kołowy> to stacked bar representation
    .replace(/<wykres-kołowy\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["'](?:\s+jednostk?a?\s*=\s*["'][^"']*["'])?>([\s\S]*?)<\/wykres-kołowy>/gi,
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
        return `\n\n<div class="stacked-box"><span class="stacked-label">STRUKTURA</span><div class="stacked-title">${title}</div><div class="stacked-bar">${segmentsHtml}</div><div class="stacked-legend">${legendHtml}</div></div>\n\n`;
      })
    // Remove all remaining HTML tags except allowed ones
    .replace(/<(?!a\s|\/a>|b>|\/b>|strong>|\/strong>|div\s|\/div>|span\s|\/span>|p\s|\/p>|blockquote\s|\/blockquote>|cite\s|\/cite>|table\s|\/table>|thead>|\/thead>|tbody>|\/tbody>|tr\s|\/tr>|th>|\/th>|td\s|\/td>|h3\s|\/h3>|br\s|br>|br\/>)[^>]+>/gi, '')
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
  return paragraphs.replace(/\s*\((?:ID:\s*\d+|(?:event\s+)?[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\)/gi, '');
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
export function sanitizeAndProcessInlineHtml(text: string): string {
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

  processedText = preventWidows(processedText);

  processedText = processedText
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/&lt;(\/?)przypis/gi, '<$1przypis')
    .replace(/&gt;/g, '>')
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

  return processedText.replace(/\s*\((?:ID:\s*\d+|event\s+[a-f0-9-]+)\)/gi, '');
}
