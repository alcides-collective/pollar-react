import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { sanitizeAndProcessHtml, removeExtractedElements } from '../../utils/text';
import { useRouteLanguage } from '../../hooks/useRouteLanguage';
import { SummaryLineChart, type LineChartData } from '../../components/charts/SummaryLineChart';
import { SummaryBarChart, type BarChartData } from '../../components/charts/SummaryBarChart';
import { parseSimpleData } from '../../utils/chartUtils';

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

interface EventSummaryProps {
  summary: string;
  wikipediaImages?: Record<string, string>;
  hideBorder?: boolean;
}

interface ContentSegment {
  type: 'html' | 'linechart' | 'barchart';
  content: string;
  chartData?: LineChartData | BarChartData;
}

/**
 * Parse summary to extract charts and split into segments
 */
function parseContentWithCharts(summary: string, lang: 'pl' | 'en' | 'de' = 'pl'): ContentSegment[] {
  // First remove sidebar-extracted elements
  const cleanedSummary = removeExtractedElements(summary);

  const segments: ContentSegment[] = [];
  let lineChartIndex = 0;
  let barChartIndex = 0;

  // Combined pattern for all chart types
  // wykres-liniowy and wykres-słupkowy (handles typos: stópkowy, tytu, jednost, etc.)
  // Use separate double/single quote alternatives to allow apostrophes inside double-quoted values
  const chartPattern = /<wykres-(liniowy|s[łt][uó]pkowy)\s+(?:tytu[łlć]?u?\s*=\s*(?:"([^"]+)"|'([^']+)')\s+jednostk[ai]?\s*=\s*(?:"([^"]+)"|'([^']+)')|jednostk[ai]?\s*=\s*(?:"([^"]+)"|'([^']+)')\s+tytu[łlć]?u?\s*=\s*(?:"([^"]+)"|'([^']+)'))>([\s\S]*?)<\/wykres-(?:liniowy|s[łt][uó]pkowy)>/gi;

  let lastIndex = 0;
  let match;

  // Reset regex state
  chartPattern.lastIndex = 0;

  while ((match = chartPattern.exec(cleanedSummary)) !== null) {
    // Add HTML content before the chart
    if (match.index > lastIndex) {
      const htmlContent = cleanedSummary.substring(lastIndex, match.index);
      if (htmlContent.trim()) {
        segments.push({
          type: 'html',
          content: sanitizeAndProcessHtml(htmlContent, lang)
        });
      }
    }

    // Determine chart type
    const chartType = match[1].toLowerCase();
    const isBarChart = chartType.startsWith('s'); // słupkowy, stópkowy, etc.

    // Parse chart data (groups: 2/3=title double/single quote title-first, 4/5=unit double/single quote title-first,
    // 6/7=unit double/single quote unit-first, 8/9=title double/single quote unit-first, 10=data)
    const title = match[2] || match[3] || match[8] || match[9];
    const unit = match[4] || match[5] || match[6] || match[7];
    const dataStr = match[10];

    // Use parseSimpleData from chartUtils for consistent parsing
    const { labels, values } = parseSimpleData(dataStr);
    const items = labels.map((label, i) => ({ label, value: values[i] }));

    if (items.length > 0) {
      if (isBarChart) {
        segments.push({
          type: 'barchart',
          content: '',
          chartData: {
            id: `bar-chart-${barChartIndex++}`,
            title,
            unit,
            items
          }
        });
      } else {
        segments.push({
          type: 'linechart',
          content: '',
          chartData: {
            id: `line-chart-${lineChartIndex++}`,
            title,
            unit,
            items
          }
        });
      }
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining HTML content after the last chart
  if (lastIndex < cleanedSummary.length) {
    const htmlContent = cleanedSummary.substring(lastIndex);
    if (htmlContent.trim()) {
      segments.push({
        type: 'html',
        content: sanitizeAndProcessHtml(htmlContent, lang)
      });
    }
  }

  // If no charts found, just process as HTML
  if (segments.length === 0) {
    segments.push({
      type: 'html',
      content: sanitizeAndProcessHtml(cleanedSummary, lang)
    });
  }

  return segments;
}

/**
 * Inject Wikipedia author photos into quote-box HTML strings.
 * Replaces <blockquote class="quote-box" data-author="X">...content...</blockquote>
 * with a version that has the photo on the left and content wrapped.
 */
function injectQuotePhotos(html: string, wikipediaImages: Record<string, string>): string {
  if (Object.keys(wikipediaImages).length === 0) return html;

  return html.replace(
    /<blockquote class="quote-box" data-author="([^"]+)">([\s\S]*?)<\/blockquote>/gi,
    (fullMatch, author, innerContent) => {
      const imageUrl = wikipediaImages[author];
      if (!imageUrl) return fullMatch;

      // Validate imageUrl is a safe URL (https only)
      const lower = imageUrl.trim().toLowerCase();
      if (!lower.startsWith('https://')) return fullMatch;
      return `<blockquote class="quote-box has-photo" data-author="${escapeHtml(author)}"><div class="quote-author-photo"><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(author)}" loading="lazy" /></div><div class="quote-content">${innerContent}</div></blockquote>`;
    }
  );
}

export function EventSummary({ summary, wikipediaImages = {}, hideBorder }: EventSummaryProps) {
  const lang = useRouteLanguage();
  const segments = useMemo(() => parseContentWithCharts(summary, lang), [summary, lang]);

  // Re-process HTML segments with Wikipedia images injected
  const processedSegments = useMemo(() => {
    if (Object.keys(wikipediaImages).length === 0) return segments;
    return segments.map(segment => {
      if (segment.type !== 'html') return segment;
      return { ...segment, content: injectQuotePhotos(segment.content, wikipediaImages) };
    });
  }, [segments, wikipediaImages]);

  const { t } = useTranslation('event');

  return (
    <section className={`event-summary px-6 py-6${hideBorder ? '' : ' border-t border-divider'}`}>
      <h2 className="text-xs font-medium uppercase tracking-wider text-content-subtle mb-4">
        {t('summary')}
      </h2>
      <div className="prose prose-zinc max-w-none summary-content">
        {processedSegments.map((segment, index) => {
          if (segment.type === 'linechart' && segment.chartData) {
            return <SummaryLineChart key={`line-${index}`} data={segment.chartData as LineChartData} />;
          }
          if (segment.type === 'barchart' && segment.chartData) {
            return <SummaryBarChart key={`bar-${index}`} data={segment.chartData as BarChartData} />;
          }
          return (
            <div
              key={`html-${index}`}
              dangerouslySetInnerHTML={{ __html: segment.content }}
            />
          );
        })}
      </div>
    </section>
  );
}
