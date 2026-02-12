// AI Companion utility functions

import type { DebugStep, TypingLabelKey } from '../types/ai';

/** Escape HTML special characters to prevent XSS */
function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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
      const punct = escapeHtml(punctuation || '');
      const safeLinkText = escapeHtml(linkText);
      // Block dangerous protocols
      const lower = trimmedUrl.toLowerCase();
      if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
        return safeLinkText + punct;
      }
      const safeUrl = escapeHtml(trimmedUrl);
      if (trimmedUrl.startsWith('/event/')) {
        return `<a href="${safeUrl}" class="source-link">${safeLinkText}</a>${punct}`;
      } else if (trimmedUrl.startsWith('http')) {
        return `<a href="${safeUrl}" target="_blank" rel="noopener" class="source-link">${safeLinkText}</a>${punct}`;
      }
      return `<a href="${safeUrl}" class="source-link">${safeLinkText}</a>${punct}`;
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
 * Get dynamic typing label key based on debug steps
 * Returns i18n key for translation in component
 * Simplified to 3 main stages for better UX
 */
export function getTypingLabelKey(debugSteps: DebugStep[]): TypingLabelKey {
  if (debugSteps.length === 0) return 'analyzing';

  // Stage 3: Generating response
  if (debugSteps.some((s) => s.step === 'generating' || s.step === 'complete')) {
    return 'generating';
  }

  // Stage 2: Searching for information
  if (debugSteps.some((s) =>
    s.step === 'parallelSearch' ||
    s.step === 'fusion' ||
    s.step === 'rerank' ||
    s.step === 'searchComplete'
  )) {
    return 'searching';
  }

  // Stage 1: Analyzing question (default)
  return 'analyzing';
}

/**
 * Cubic bezier easing for word animation delay.
 * cubic-bezier(0.55, 0.0, 0.9, 0.35) — stays fast most of the way,
 * slows down only towards the end.
 *
 * Profile (delay with min=12, max=70):
 *   20% through → ~13ms   (very fast)
 *   50% through → ~19ms   (still fast)
 *   80% through → ~37ms   (slowing down)
 *   95% through → ~59ms   (slow)
 *  100% through → 70ms    (max)
 */
export function cubicBezierEase(t: number): number {
  const x1 = 0.55, y1 = 0.0, x2 = 0.9, y2 = 0.35;

  // Polynomial coefficients for x(u) = au³ + bu² + cu
  const ax = 1 - 3 * x2 + 3 * x1;
  const bx = 3 * x2 - 6 * x1;
  const cx = 3 * x1;

  // Newton-Raphson: find parameter u where x(u) = t
  let u = t;
  for (let i = 0; i < 8; i++) {
    const x = ((ax * u + bx) * u + cx) * u - t;
    if (Math.abs(x) < 1e-6) break;
    const dx = (3 * ax * u + 2 * bx) * u + cx;
    if (Math.abs(dx) < 1e-6) break;
    u -= x / dx;
  }

  // Evaluate y(u)
  const ay = 1 - 3 * y2 + 3 * y1;
  const by = 3 * y2 - 6 * y1;
  const cy = 3 * y1;
  return ((ay * u + by) * u + cy) * u;
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
  if (remaining === 1) return `pozostało 1 zapytanie`;
  if (remaining > 1 && remaining < 5) return `pozostało ${remaining} zapytania`;
  return `pozostało ${remaining} zapytań`;
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
