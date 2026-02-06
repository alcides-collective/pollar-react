import { useMemo, useEffect, useRef } from 'react';
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

export function EventSummary({ summary, wikipediaImages = {} }: EventSummaryProps) {
  const segments = useMemo(() => parseContentWithCharts(summary), [summary]);
  const contentRef = useRef<HTMLDivElement>(null);

  // Inject Wikipedia author photos into quote boxes
  useEffect(() => {
    if (!contentRef.current || Object.keys(wikipediaImages).length === 0) return;

    const quoteBoxes = contentRef.current.querySelectorAll('.quote-box[data-author]');
    quoteBoxes.forEach((box) => {
      const author = box.getAttribute('data-author');
      if (!author) return;

      // Skip if already processed
      if (box.querySelector('.quote-author-photo')) return;

      const imageUrl = wikipediaImages[author];
      if (!imageUrl) return;

      // Add flex layout class
      box.classList.add('has-photo');

      // Create image container
      const photoDiv = document.createElement('div');
      photoDiv.className = 'quote-author-photo';
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = author;
      img.loading = 'lazy';
      photoDiv.appendChild(img);

      // Wrap existing content in a div
      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'quote-content';
      while (box.firstChild) {
        contentWrapper.appendChild(box.firstChild);
      }

      box.appendChild(photoDiv);
      box.appendChild(contentWrapper);
    });
  }, [segments, wikipediaImages]);

  return (
    <section className="event-summary px-6 py-6 border-t border-zinc-200">
      <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-4">
        Podsumowanie
      </h2>
      <div ref={contentRef} className="prose prose-zinc max-w-none summary-content">
        {segments.map((segment, index) => {
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
