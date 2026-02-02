import { sanitizeAndProcessHtml } from '../../utils/text';

interface BriefExecutiveSummaryProps {
  summary: string;
}

export function BriefExecutiveSummary({ summary }: BriefExecutiveSummaryProps) {
  return (
    <div>
      <h2 className="text-sm text-zinc-500 mb-3 pb-2 border-b border-zinc-200 font-medium">
        Podsumowanie
      </h2>
      <div
        className="prose prose-zinc max-w-none text-zinc-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: sanitizeAndProcessHtml(summary) }}
      />
    </div>
  );
}
