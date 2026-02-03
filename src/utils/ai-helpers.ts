// AI Companion utility functions

import type { DebugStep, TypingLabel } from '../types/ai';

/**
 * Tokenize content into words, preserving markdown links and line breaks as single units
 */
export function tokenizeContent(content: string): string[] {
  const tokens: string[] = [];
  // Match: line breaks (1+ newlines, real or escaped), markdown links (+ trailing punctuation), or regular words
  const regex = /\n+|(?:\\n)+|\[[^\]]+\]\([^)]+\)[.,;:!?—–-]*|\S+/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    tokens.push(match[0]);
  }
  return tokens;
}

/**
 * Pre-format markdown (bold, italic) BEFORE tokenization
 * This handles **multi word** formatting that would be split by tokenizer
 */
export function preFormatMarkdown(text: string): string {
  let result = text;

  // Bold: **text** -> <strong>text</strong>
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic: *text* -> <em>text</em> (but not inside URLs or already processed)
  result = result.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>');

  return result;
}

/**
 * Sanitize links in the response
 * - Remove empty links
 * - Convert name-only links to plain text
 */
export function sanitizeLinks(text: string): string {
  let result = text;

  // 1. Remove empty links: [](/event/...) or [ ](/event/...)
  result = result.replace(/\[\s*\]\s*\([^)]+\)/g, '');

  // 2. Convert name-only links to plain text
  // Matches 1-3 words that look like names (start with uppercase, Polish chars)
  result = result.replace(
    /\[([\p{Lu}][\p{Ll}]+(?:\s+[\p{Lu}][\p{Ll}]+){0,2})\]\s*\(\/event\/[^)]+\)/gu,
    '$1'
  );

  // 3. Clean up double spaces left after removals (but preserve newlines)
  result = result.replace(/[^\S\n]{2,}/g, ' ');

  // 4. Clean up spaces before punctuation
  result = result.replace(/\s+([.,;:!?])/g, '$1');

  return result;
}

/**
 * Format markdown text to HTML
 * Handles line breaks and markdown links
 */
export function formatMarkdown(text: string): string {
  // Line breaks - convert to <br> tags
  if (/^(\n+|(?:\\n)+)$/.test(text)) {
    const count =
      (text.match(/\n/g) || []).length || (text.match(/\\n/g) || []).length;
    return count >= 2 ? '<br><br>' : '<br>';
  }

  // Convert escaped newlines to real ones
  let result = text.replace(/\\n/g, '\n');

  // Markdown links - robust matching with callback (preserves trailing punctuation)
  result = result.replace(
    /\[([^\]]+)\]\s*\(\s*([^)\s]+)\s*\)([.,;:!?—–-]*)/g,
    (_match, linkText, url, punctuation) => {
      const trimmedUrl = url.trim();
      const punct = punctuation || '';
      if (trimmedUrl.startsWith('/event/')) {
        return `<a href="${trimmedUrl}" class="source-link">${linkText}</a>${punct}`;
      } else if (trimmedUrl.startsWith('http')) {
        return `<a href="${trimmedUrl}" target="_blank" rel="noopener" class="source-link">${linkText}</a>${punct}`;
      }
      return `<a href="${trimmedUrl}" class="source-link">${linkText}</a>${punct}`;
    }
  );

  return result;
}

/**
 * Format source date to relative time
 */
export function formatSourceDate(
  date: string | { _seconds: number }
): string {
  try {
    let d: Date;
    if (typeof date === 'object' && '_seconds' in date) {
      d = new Date(date._seconds * 1000);
    } else {
      d = new Date(date);
    }
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'przed chwila';
    if (diffHours < 24) return `${diffHours}h temu`;
    if (diffDays < 7) return `${diffDays}d temu`;
    return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

/**
 * Get dynamic typing label based on debug steps
 */
export function getTypingLabel(debugSteps: DebugStep[]): TypingLabel {
  if (debugSteps.length === 0) return 'Mysle';
  if (debugSteps.some((s) => s.step === 'complete')) return 'Pisze odpowiedz';
  if (debugSteps.some((s) => s.step === 'generating'))
    return 'Generuje odpowiedz';
  if (debugSteps.some((s) => s.step === 'searchComplete'))
    return 'Analizuje wydarzenia';
  if (debugSteps.some((s) => s.step === 'rerank')) return 'Rerankuje wyniki';
  if (debugSteps.some((s) => s.step === 'fusion')) return 'Lacze wyniki';
  if (debugSteps.some((s) => s.step === 'parallelSearch'))
    return 'Szukam wydarzen';
  if (debugSteps.some((s) => s.step === 'keywordsAndExpansion'))
    return 'Analizuje pytanie';
  if (debugSteps.some((s) => s.step === 'keywords')) return 'Szukam wydarzen';
  return 'Mysle';
}

/**
 * Ease-out quadratic function for word animation timing
 */
export function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

/**
 * Generate unique ID for messages
 */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Format remaining queries text in Polish
 */
export function formatRemainingQueries(remaining: number): string {
  if (remaining === 1) return `pozostalo 1 zapytanie`;
  if (remaining > 1 && remaining < 5) return `pozostalo ${remaining} zapytania`;
  return `pozostalo ${remaining} zapytan`;
}

/**
 * Default suggestion placeholders
 */
export const DEFAULT_SUGGESTIONS = [
  'Co sie stalo w Wenezueli?',
  'Jakie sa najnowsze wiadomosci?',
  'Czy byly jakies protesty dzisiaj?',
  'Co nowego w polityce?',
  'Co sie dzieje w Sejmie?',
  'Jakie sa najnowsze wiadomosci o AI?',
];
