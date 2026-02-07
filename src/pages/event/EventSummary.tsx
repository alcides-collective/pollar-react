import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { sanitizeAndProcessHtml, removeExtractedElements } from '../../utils/text';
import { SummaryLineChart, type LineChartData } from '../../components/charts/SummaryLineChart';
import { SummaryBarChart, type BarChartData } from '../../components/charts/SummaryBarChart';
import { parseSimpleData } from '../../utils/chartUtils';

interface EventSummaryProps {
  summary: string;
  wikipediaImages?: Record<string, string>;
}

interface ContentSegment {
  type: 'html' | 'linechart' | 'barchart';
  content: string;
  chartData?: LineChartData | BarChartData;
}

/**
 * Parse summary to extract charts and split into segments
 */
function parseContentWithCharts(summary: string): ContentSegment[] {
  // First remove sidebar-extracted elements
  const cleanedSummary = removeExtractedElements(summary);

  const segments: ContentSegment[] = [];
  let lineChartIndex = 0;
  let barChartIndex = 0;

  // Combined pattern for all chart types
  // wykres-liniowy and wykres-słupkowy (handles typos: stópkowy, tytu, jednost, etc.)
  const chartPattern = /<wykres-(liniowy|s[łt][uó]pkowy)\s+(?:tytu[łlć]?u?\s*=\s*["']([^"']+)["']\s+jednostk?a?\s*=\s*["']([^"']+)["']|jednostk?a?\s*=\s*["']([^"']+)["']\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["'])>([\s\S]*?)<\/wykres-(?:liniowy|s[łt][uó]pkowy)>/gi;

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
          content: sanitizeAndProcessHtml(htmlContent)
        });
      }
    }

    // Determine chart type
    const chartType = match[1].toLowerCase();
    const isBarChart = chartType.startsWith('s'); // słupkowy, stópkowy, etc.

    // Parse chart data
    const title = match[2] || match[5];
    const unit = match[3] || match[4];
    const dataStr = match[6];

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
        content: sanitizeAndProcessHtml(htmlContent)
      });
    }
  }

  // If no charts found, just process as HTML
  if (segments.length === 0) {
    segments.push({
      type: 'html',
      content: sanitizeAndProcessHtml(cleanedSummary)
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

      return `<blockquote class="quote-box has-photo" data-author="${author}"><div class="quote-author-photo"><img src="${imageUrl}" alt="${author}" loading="lazy" /></div><div class="quote-content">${innerContent}</div></blockquote>`;
    }
  );
}

export function EventSummary({ summary, wikipediaImages = {} }: EventSummaryProps) {
  const segments = useMemo(() => parseContentWithCharts(summary), [summary]);

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
    <section className="event-summary px-6 py-6 border-t border-divider">
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
