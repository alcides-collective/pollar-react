import { forwardRef } from 'react';
import type { BriefSection } from '../../types/brief';
import { preventWidows, sanitizeAndProcessHtml, sanitizeAndProcessInlineHtml } from '../../utils/text';

interface BriefSectionsProps {
  sections: BriefSection[];
  setSectionRef?: (index: number) => (el: HTMLElement | null) => void;
}

export function BriefSections({ sections, setSectionRef }: BriefSectionsProps) {
  return (
    <section className="mb-10">
      <h2 className="text-sm text-zinc-500 mb-5 pb-2 border-b border-zinc-200 font-medium">
        Sekcje
      </h2>
      <div className="space-y-6">
        {sections.map((section, index) => (
          <SectionCard
            key={index}
            section={section}
            ref={setSectionRef?.(index)}
          />
        ))}
      </div>
    </section>
  );
}

const SectionCard = forwardRef<HTMLDivElement, { section: BriefSection }>(
  function SectionCard({ section }, ref) {
    const keyPoints = section.keyPoints ?? [];

    return (
      <div
        ref={ref}
        className="p-5 rounded-lg border border-zinc-200 bg-white/80 hover:shadow-sm transition-shadow"
      >
        <h3 className="text-xl md:text-2xl font-medium text-zinc-900 mb-4 leading-tight">
          {preventWidows(section.headline)}
        </h3>

        <div
          className="prose prose-zinc max-w-none text-zinc-600 mb-3"
          dangerouslySetInnerHTML={{ __html: sanitizeAndProcessHtml(section.content) }}
        />

        {keyPoints.length > 0 && (
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2 font-medium">
              Kluczowe punkty
            </p>
            <ul className="space-y-1.5">
              {keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-base text-zinc-600">
                  <span className="text-zinc-300">•</span>
                  <span dangerouslySetInnerHTML={{ __html: sanitizeAndProcessInlineHtml(point) }} />
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    );
  }
);
