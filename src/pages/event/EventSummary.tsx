interface EventSummaryProps {
  summary: string;
}

export function EventSummary({ summary }: EventSummaryProps) {
  // Split summary into paragraphs
  const paragraphs = summary.split('\n\n').filter(p => p.trim());

  return (
    <section className="px-6 py-6 border-t border-zinc-200">
      <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-4">
        Podsumowanie
      </h2>
      <div className="prose prose-zinc max-w-none">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="text-zinc-700 leading-relaxed mb-4 last:mb-0">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
