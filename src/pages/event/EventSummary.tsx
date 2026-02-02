import { useMemo } from 'react';
import { sanitizeAndProcessHtml, removeExtractedElements } from '../../utils/text';
import { SummaryLineChart, type LineChartData } from '../../components/charts/SummaryLineChart';

interface EventSummaryProps {
  summary: string;
}

interface ContentSegment {
  type: 'html' | 'linechart';
  content: string;
  chartData?: LineChartData;
}

/**
 * Parse summary to extract line charts and split into segments
 */
function parseContentWithCharts(summary: string): ContentSegment[] {
  // First remove sidebar-extracted elements
  const cleanedSummary = removeExtractedElements(summary);

  const segments: ContentSegment[] = [];
  let chartIndex = 0;

  // Pattern to match wykres-liniowy tags (both attribute orders)
  const chartPattern = /<wykres-liniowy\s+(?:tytu[łlć]?u?\s*=\s*["']([^"']+)["']\s+jednostk?a?\s*=\s*["']([^"']+)["']|jednostk?a?\s*=\s*["']([^"']+)["']\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["'])>([\s\S]*?)<\/wykres-liniowy>/gi;

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

    // Parse chart data
    const title = match[1] || match[4];
    const unit = match[2] || match[3];
    const dataStr = match[5];

    const items: { label: string; value: number }[] = [];
    dataStr.split(',').forEach((pair: string) => {
      const pairMatch = pair.trim().match(/^([^:]+):\s*([\d.,]+)/);
      if (pairMatch) {
        items.push({
          label: pairMatch[1].trim(),
          value: parseFloat(pairMatch[2].replace(',', '.'))
        });
      }
    });

    if (items.length > 0) {
      segments.push({
        type: 'linechart',
        content: '',
        chartData: {
          id: `line-chart-${chartIndex++}`,
          title,
          unit,
          items
        }
      });
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

export function EventSummary({ summary }: EventSummaryProps) {
  const segments = useMemo(() => parseContentWithCharts(summary), [summary]);

  return (
    <section className="event-summary px-6 py-6 border-t border-zinc-200">
      <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-4">
        Podsumowanie
      </h2>
      <div className="prose prose-zinc max-w-none summary-content">
        {segments.map((segment, index) => {
          if (segment.type === 'linechart' && segment.chartData) {
            return <SummaryLineChart key={`chart-${index}`} data={segment.chartData} />;
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
