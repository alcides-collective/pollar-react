// ── URL slug generation for SEO ──
export function createSlug(text) {
  if (!text) return '';
  const chars = {
    'ą':'a','ć':'c','ę':'e','ł':'l','ń':'n','ó':'o','ś':'s','ź':'z','ż':'z',
    'Ą':'A','Ć':'C','Ę':'E','Ł':'L','Ń':'N','Ó':'O','Ś':'S','Ź':'Z','Ż':'Z',
    'ä':'ae','ö':'oe','ü':'ue','ß':'ss','Ä':'Ae','Ö':'Oe','Ü':'Ue',
  };
  return text
    .replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻäöüßÄÖÜ]/g, ch => chars[ch] || ch)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function stripHtml(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&bdquo;/g, '\u201E').replace(/&rdquo;/g, '\u201D').replace(/&ldquo;/g, '\u201C')
    .replace(/&lsquo;/g, '\u2018').replace(/&rsquo;/g, '\u2019')
    .replace(/&ndash;/g, '\u2013').replace(/&mdash;/g, '\u2014')
    .replace(/&hellip;/g, '\u2026').replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ').trim();
}

/**
 * Intelligently converts custom HTML tags from AI-generated summaries to clean plain text.
 * Based on tag processing logic from src/utils/text.ts but outputs plain text for crawlers.
 */
export function stripCustomTags(text) {
  if (!text) return '';

  let s = text
    // Decode double-encoded entities
    .replace(/&amp;lt;/g, '<').replace(/&amp;gt;/g, '>')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
    .replace(/&bdquo;/g, '\u201E').replace(/&rdquo;/g, '\u201D')
    .replace(/&ldquo;/g, '\u201C').replace(/&lsquo;/g, '\u2018').replace(/&rsquo;/g, '\u2019')
    .replace(/&ndash;/g, '\u2013').replace(/&mdash;/g, '\u2014')
    .replace(/&hellip;/g, '\u2026').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&laquo;/g, '\u00AB').replace(/&raquo;/g, '\u00BB');

  // Normalize English tag names to Polish equivalents
  s = s
    .replace(/<(\/?)note(\s|>)/gi, '<$1przypis$2')
    .replace(/<(\/?)context>/gi, '<$1kontekst>')
    .replace(/<(\/?)quote(\s|>)/gi, '<$1cytat$2')
    .replace(/<(\/?)key-number(\s|>)/gi, '<$1kluczowa-liczba$2')
    .replace(/<(\/?)comparison(\s|>)/gi, '<$1porównanie$2')
    .replace(/<(\/?)poll(\s|>)/gi, '<$1ankieta$2')
    .replace(/<(\/?)manipulation(\s|>)/gi, '<$1manipulacja$2')
    .replace(/<(\/?)verification(\s|>)/gi, '<$1weryfikacja$2')
    .replace(/<(\/?)fact-check(\s|>)/gi, '<$1weryfikacja$2');

  // Normalize English attribute names
  s = s
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
    .replace(/(<weryfikacja\s[^>]*)source=/gi, '$1źródło=');

  // Convert <br> to newlines
  s = s.replace(/<br\s*\/?>/gi, '\n');

  // --- Convert structured tags to plain text ---

  // <cytat autor="X" miejsce="Y">text</cytat> → „text" — X, Y
  s = s.replace(/<cytat\s+autor\s*=\s*["']([^"']+)["']\s+miejsce\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/cytat>/gi,
    (_, autor, miejsce, text) => `\u201E${text.trim()}\u201D \u2014 ${autor}, ${miejsce}`);
  s = s.replace(/<cytat\s+miejsce\s*=\s*["']([^"']+)["']\s+autor\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/cytat>/gi,
    (_, miejsce, autor, text) => `\u201E${text.trim()}\u201D \u2014 ${autor}, ${miejsce}`);
  s = s.replace(/<cytat\s+autor\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/cytat>/gi,
    (_, autor, text) => `\u201E${text.trim()}\u201D \u2014 ${autor}`);

  // <kluczowa-liczba wartość="X">desc</kluczowa-liczba> → X — desc
  s = s.replace(/<kluczowa-liczba\s+wartość\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/kluczowa-liczba>/gi,
    (_, value, desc) => `${value} \u2014 ${desc.trim()}`);

  // <manipulacja autor="X" cytat="Y">explanation</manipulacja> → „Y" (X) — explanation
  s = s.replace(/<manipulacja\s+autor\s*=\s*["']([^"']+)["']\s+cytat\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/manipulacja>/gi,
    (_, autor, cytat, expl) => `\u201E${cytat}\u201D (${autor}) \u2014 ${expl.trim()}`);
  s = s.replace(/<manipulacja\s+cytat\s*=\s*["']([^"']+)["']\s+autor\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/manipulacja>/gi,
    (_, cytat, autor, expl) => `\u201E${cytat}\u201D (${autor}) \u2014 ${expl.trim()}`);
  // Fallback: manipulacja without attributes
  s = s.replace(/<manipulacja[^>]*>([\s\S]*?)<\/manipulacja>/gi, '$1');

  // <weryfikacja werdykt="V" źródło="S">explanation</weryfikacja> → V: explanation (Source: S)
  s = s.replace(/<weryfikacja\s+werdykt\s*=\s*["']([^"']+)["']\s+źródło\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/weryfikacja>/gi,
    (_, verdict, source, expl) => `${verdict}: ${expl.trim()} (${source})`);
  s = s.replace(/<weryfikacja\s+źródło\s*=\s*["']([^"']+)["']\s+werdykt\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/weryfikacja>/gi,
    (_, source, verdict, expl) => `${verdict}: ${expl.trim()} (${source})`);

  // <porównanie tytuł="T">JSON</porównanie> → T: aspect (before→after), ...
  s = s.replace(/<porównanie\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/porównanie>/gi, (_, title, jsonData) => {
    try {
      const items = JSON.parse(jsonData.trim());
      if (!Array.isArray(items)) return title;
      const parts = items.map(item => {
        const keys = Object.keys(item);
        const przedKey = keys.find(k => k.toLowerCase().startsWith('przed'));
        const poKey = keys.find(k => k.toLowerCase().startsWith('po'));
        return `${item.aspekt || ''}: ${przedKey ? item[przedKey] : ''} \u2192 ${poKey ? item[poKey] : ''}`;
      });
      return `${title}: ${parts.join('; ')}`;
    } catch { return title; }
  });

  // <timeline tytuł="T">JSON</timeline> → T: date — title, ...
  s = s.replace(/<timeline\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/timeline>/gi, (_, title, jsonData) => {
    try {
      const events = JSON.parse(jsonData.trim());
      if (!Array.isArray(events)) return title;
      const parts = events.map(e => `${e.data || ''} \u2014 ${e.tytul || ''}`);
      return `${title}: ${parts.join('; ')}`;
    } catch { return title; }
  });

  // <wykres-słupkowy/liniowy/kołowy tytuł="T" jednostka="U">data</wykres-*> → T: label1: val1, ...
  s = s.replace(/<wykres-(?:s[łt][uó]pkowy|liniowy|kołowy)\s+[^>]*?tytu[łlć]?u?\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/wykres-(?:s[łt][uó]pkowy|liniowy|kołowy)>/gi,
    (_, title, dataStr) => {
      const items = dataStr.split(',').map(p => p.trim()).filter(Boolean);
      return items.length > 0 ? `${title}: ${items.join(', ')}` : title;
    });
  // Alternate attribute order (jednostka first)
  s = s.replace(/<wykres-(?:s[łt][uó]pkowy|liniowy|kołowy)\s+jednostk?a?\s*=\s*["'][^"']+["']\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/wykres-(?:s[łt][uó]pkowy|liniowy|kołowy)>/gi,
    (_, title, dataStr) => {
      const items = dataStr.split(',').map(p => p.trim()).filter(Boolean);
      return items.length > 0 ? `${title}: ${items.join(', ')}` : title;
    });

  // <wykres-wyniki tytuł="T">JSON</wykres-wyniki> → T: team1 X:Y team2, ...
  s = s.replace(/<wykres-wyniki\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/wykres-wyniki>/gi, (_, title, jsonData) => {
    try {
      const matches = JSON.parse(jsonData.trim());
      if (!Array.isArray(matches)) return title;
      const parts = matches.map(m => `${m.strona1 || ''} ${m.wynik1 ?? 0}:${m.wynik2 ?? 0} ${m.strona2 || ''}`);
      return `${title}: ${parts.join('; ')}`;
    } catch { return title; }
  });

  // <tabela-wynikow tytuł="T">JSON</tabela-wynikow> → T: 1. name — score, ...
  s = s.replace(/<tabela-wynikow\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/tabela-wynikow>/gi, (_, title, jsonData) => {
    try {
      const entries = JSON.parse(jsonData.trim());
      if (!Array.isArray(entries)) return title;
      const parts = entries.map(e => `${e.pozycja || ''}. ${e.nazwa || ''}${e.wynik ? ' \u2014 ' + e.wynik : ''}`);
      return `${title}: ${parts.join('; ')}`;
    } catch { return title; }
  });

  // <ranking tytuł="T" typ="X">JSON</ranking> → T: 1. name, ...
  s = s.replace(/<ranking\s+[^>]*?tytu[łlć]?u?\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/ranking>/gi, (_, title, jsonData) => {
    try {
      const entries = JSON.parse(jsonData.trim());
      if (!Array.isArray(entries)) return title;
      const parts = entries.map((e, i) => `${e.pozycja || i + 1}. ${e.nazwa || ''}${e.info ? ' (' + e.info + ')' : ''}`);
      return `${title}: ${parts.join('; ')}`;
    } catch { return title; }
  });

  // <kalendarz tytuł="T">JSON</kalendarz> → T: date — event, ...
  s = s.replace(/<kalendarz\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/kalendarz>/gi, (_, title, jsonData) => {
    try {
      const events = JSON.parse(jsonData.trim());
      if (!Array.isArray(events)) return title;
      const parts = events.map(e => `${e.data || ''} \u2014 ${e.wydarzenie || ''}`);
      return `${title}: ${parts.join('; ')}`;
    } catch { return title; }
  });

  // <ankieta> → strip entirely (polls disabled)
  s = s.replace(/<ankieta\s+[^>]*>[\s\S]*?<\/ankieta>/gi, '');

  // <sekcja tytuł="T">content</sekcja> → T. content
  s = s.replace(/<sekcja\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/sekcja>/gi, (_, title, content) => `${title}. ${content.trim()}`);

  // <bias left="X" right="Y"> → X | Y
  s = s.replace(/<bias\s+left\s*=\s*["']([^"']+)["']\s+right\s*=\s*["']([^"']+)["']\s*(?:\/>|><\/bias>)/gi, '$1 | $2');
  s = s.replace(/<bias\s+right\s*=\s*["']([^"']+)["']\s+left\s*=\s*["']([^"']+)["']\s*(?:\/>|><\/bias>)/gi, '$2 | $1');

  // <layout-porównanie> same as porównanie
  s = s.replace(/<layout-por[oó]wnanie\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/layout-por[oó]wnanie>/gi, (_, title, jsonData) => {
    try {
      const items = JSON.parse(jsonData.trim());
      if (!Array.isArray(items)) return title;
      const parts = items.map(item => {
        const keys = Object.keys(item);
        const przedKey = keys.find(k => k.toLowerCase().startsWith('przed'));
        const poKey = keys.find(k => k.toLowerCase().startsWith('po'));
        return `${item.aspekt || ''}: ${przedKey ? item[przedKey] : ''} \u2192 ${poKey ? item[poKey] : ''}`;
      });
      return `${title}: ${parts.join('; ')}`;
    } catch { return title; }
  });

  // <kontekst> → keep inner text
  s = s.replace(/<kontekst>([\s\S]*?)<\/kontekst>/gi, '$1');

  // <przypis ...>term</przypis> → keep term
  s = s.replace(/<przypis[^>]*>([\s\S]*?)<\/przypis>/gi, '$1');

  // Strip markdown bold
  s = s.replace(/\*\*([^*]+)\*\*/g, '$1');

  // Remove event UUID references
  s = s.replace(/\s*\((?:ID:\s*\d+|(?:event\s+)?[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\)/gi, '');

  // Strip all remaining HTML tags
  s = s.replace(/<[^>]+>/g, '');

  // Collapse whitespace and clean up
  return s.replace(/\n{3,}/g, '\n\n').replace(/[ \t]+/g, ' ').trim();
}

export function truncate(text, maxLength) {
  if (!text || text.length <= maxLength) return text || '';
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.7) {
    return truncated.slice(0, lastSpace) + '\u2026';
  }
  return truncated.slice(0, maxLength - 1) + '\u2026';
}

export function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
