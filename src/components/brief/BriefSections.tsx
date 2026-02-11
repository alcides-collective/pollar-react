import { forwardRef } from 'react';
import type { BriefSection } from '../../types/brief';
import { sanitizeAndProcessHtml, sanitizeAndProcessInlineHtml } from '../../utils/text';
import { useRouteLanguage } from '../../hooks/useRouteLanguage';

interface BriefSectionsProps {
  sections: BriefSection[];
  setSectionRef?: (index: number) => (el: HTMLElement | null) => void;
}

export function BriefSections({ sections, setSectionRef }: BriefSectionsProps) {
  const lang = useRouteLanguage();
  return (
    <section className="mb-10">
      <h2 className="text-sm text-content-subtle mb-5 pb-2 border-b border-divider font-medium">
        Sekcje
      </h2>
      <div className="space-y-6">
        {sections.map((section, index) => (
          <SectionCard
            key={index}
            section={section}
            lang={lang}
            ref={setSectionRef?.(index)}
          />
        ))}
      </div>
    </section>
  );
}

const SectionCard = forwardRef<HTMLDivElement, { section: BriefSection; lang: 'pl' | 'en' | 'de' }>(
  function SectionCard({ section, lang }, ref) {
    const keyPoints = section.keyPoints ?? [];

    return (
      <div ref={ref} className="mt-8 first:mt-0">
        <h3 className="text-xl font-semibold text-content-heading mb-4 leading-tight">
          {section.headline}
        </h3>

        <div
          className="prose prose-zinc max-w-none text-content"
          dangerouslySetInnerHTML={{ __html: sanitizeAndProcessHtml(section.content, lang) }}
        />

        {keyPoints.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-base text-content">
                <span className="text-content-faint">•</span>
                <span dangerouslySetInnerHTML={{ __html: sanitizeAndProcessInlineHtml(point, lang) }} />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);
