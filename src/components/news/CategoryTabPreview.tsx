import { useMemo } from 'react';
import { LocalizedLink } from '@/components/LocalizedLink';
import { extractQuote, extractFirstChart } from '@/utils/text';
import { eventPath } from '@/utils/slug';
import { SummaryLineChart, type LineChartData } from '@/components/charts/SummaryLineChart';
import { SummaryBarChart, type BarChartData } from '@/components/charts/SummaryBarChart';
import type { Event } from '@/types/events';

interface FeaturedEventPreviewProps {
  event: Event;
  wikipediaImages?: Record<string, string>;
}

export function FeaturedEventPreview({ event, wikipediaImages = {} }: FeaturedEventPreviewProps) {
  const quote = useMemo(() => extractQuote(event.summary), [event.summary]);

  const firstChart = useMemo(
    () => (quote ? null : extractFirstChart(event.summary)),
    [event.summary, quote],
  );

  if (!quote && !firstChart) return null;

  if (quote) {
    const imageUrl = wikipediaImages[quote.autor];
    const hasPhoto = imageUrl && imageUrl.startsWith('https://');
    const hasQuoteMarks =
      /^[\u201E„"'\u201C]/.test(quote.text) && /[\u201D"'\u201C"]$/.test(quote.text);
    const displayText = hasQuoteMarks ? quote.text : `\u201E${quote.text}\u201D`;

    return (
      <LocalizedLink
        to={eventPath(event)}
        className="hidden md:block relative p-6 hover:bg-surface transition-colors"
      >
        {/* Connector line extending left toward the featured event */}
        <div className="absolute h-px bg-divider" style={{ top: '66%', left: 0, width: '1.5rem' }} />
        <blockquote className={`quote-box${hasPhoto ? ' has-photo' : ''}`}>
          {hasPhoto && (
            <div className="quote-author-photo">
              <img src={imageUrl} alt={quote.autor} loading="lazy" />
            </div>
          )}
          <div className={hasPhoto ? 'quote-content' : undefined}>
            {quote.miejsce && (
              <span className="quote-location">{quote.miejsce}</span>
            )}
            <p className="quote-text !text-sm !leading-snug">{displayText}</p>
            <cite className="quote-author">{quote.autor}</cite>
          </div>
        </blockquote>
      </LocalizedLink>
    );
  }

  if (firstChart) {
    const chartData = {
      id: `category-tab-chart-0`,
      title: firstChart.title,
      unit: firstChart.unit,
      items: firstChart.items,
    };

    return (
      <LocalizedLink
        to={eventPath(event)}
        className="hidden md:block relative p-6 hover:bg-surface transition-colors"
      >
        {/* Connector line extending left toward the featured event */}
        <div className="absolute h-px bg-divider" style={{ top: '66%', left: 0, width: '1.5rem' }} />
        {firstChart.type === 'line' ? (
          <SummaryLineChart data={chartData as LineChartData} />
        ) : (
          <SummaryBarChart data={chartData as BarChartData} />
        )}
      </LocalizedLink>
    );
  }

  return null;
}
