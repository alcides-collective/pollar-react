import { sanitizeAndProcessHtml, removeExtractedElements } from '../../utils/text';

interface EventSummaryProps {
  summary: string;
}

export function EventSummary({ summary }: EventSummaryProps) {
  // Remove elements that are extracted to sidebar, then process HTML
  const cleanedSummary = removeExtractedElements(summary);
  const processedHtml = sanitizeAndProcessHtml(cleanedSummary);

  return (
    <section className="event-summary px-6 py-6 border-t border-zinc-200">
      <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-4">
        Podsumowanie
      </h2>
      <div
        className="prose prose-zinc max-w-none summary-content"
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />
    </section>
  );
}
