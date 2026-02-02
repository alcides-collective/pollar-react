import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import type { BriefSection } from '../../types/brief';
import { useEvent } from '../../hooks/useEvent';
import { preventWidows, sanitizeAndProcessHtml, sanitizeAndProcessInlineHtml } from '../../utils/text';

function stripIds(text: string): string {
  return text.replace(/\s*\(ID:\s*\d+\)/gi, '').trim();
}

function InlineEventCard({ eventId }: { eventId: string }) {
  const { event, loading } = useEvent(eventId);

  if (loading) {
    return (
      <div className="p-3 bg-zinc-50 rounded-lg animate-pulse">
        <div className="h-4 w-3/4 bg-zinc-200 rounded" />
      </div>
    );
  }

  if (!event) return null;

  const headline = stripIds(event.metadata?.ultraShortHeadline || event.title);

  return (
    <Link
      to={`/event/${event.id}`}
      className="block p-3 bg-zinc-50 hover:bg-zinc-100 rounded-lg transition-colors"
    >
      <p className="text-sm text-zinc-700 line-clamp-2">
        {headline}
      </p>
    </Link>
  );
}

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

        {section.insights && section.insights.length > 0 && (
          <div className="mt-3 pt-3 border-t border-zinc-100">
            <ul className="space-y-1.5">
              {section.insights.map((insight, i) => (
                <li
                  key={i}
                  className="text-base text-zinc-500"
                  dangerouslySetInnerHTML={{ __html: sanitizeAndProcessInlineHtml(insight) }}
                />
              ))}
            </ul>
          </div>
        )}

        {/* Mobile: inline events */}
        {section.keyEvents && section.keyEvents.length > 0 && (
          <div className="lg:hidden mt-4 pt-4 border-t border-zinc-100">
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2 font-medium flex items-center gap-1.5">
              <i className="ri-newspaper-line" />
              Powiązane wydarzenia
            </p>
            <div className="space-y-2">
              {section.keyEvents.map((eventId) => (
                <InlineEventCard key={eventId} eventId={eventId} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);
