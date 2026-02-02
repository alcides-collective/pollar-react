import { Link } from 'react-router-dom';
import { useEvent } from '../../hooks/useEvent';
import type { WordOfTheDay, BriefSection } from '../../types/brief';
import { decodeHtmlEntities } from '../../utils/text';

function stripIds(text: string): string {
  return text.replace(/\s*\(ID:\s*\d+\)/gi, '').trim();
}

interface BriefSidebarProps {
  wordOfTheDay: WordOfTheDay | null;
  activeSection: BriefSection | null;
}

function SectionEventCard({ eventId }: { eventId: string }) {
  const { event, loading } = useEvent(eventId);

  if (loading) {
    return (
      <div className="p-3 bg-zinc-50 rounded-lg animate-pulse">
        <div className="h-4 w-3/4 bg-zinc-200 rounded mb-2" />
        <div className="h-3 w-full bg-zinc-200 rounded mb-2" />
        <div className="h-3 w-16 bg-zinc-200 rounded" />
      </div>
    );
  }

  if (!event) return null;

  const date = new Date(event.createdAt);

  const formattedDate = date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const headline = stripIds(event.metadata?.ultraShortHeadline || event.title);
  const firstKeyPoint = event.metadata?.keyPoints?.[0];
  const description = firstKeyPoint?.description
    ? stripIds(firstKeyPoint.description.replace(/<[^>]*>/g, ''))
    : null;

  return (
    <Link
      to={`/event/${event.id}`}
      className="block p-3 bg-zinc-50 hover:bg-zinc-100 rounded-lg transition-colors group"
    >
      <p className="text-sm font-medium text-zinc-900 group-hover:text-zinc-700 mb-1 line-clamp-2">
        {headline}
      </p>
      {description && (
        <p className="text-xs text-zinc-600 line-clamp-2 mb-2">
          {description}
        </p>
      )}
      <p className="text-xs text-zinc-400">{formattedDate}</p>
    </Link>
  );
}

function SidebarWordOfTheDay({ word }: { word: WordOfTheDay }) {
  return (
    <div className="p-4 rounded-xl border border-zinc-200 bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
      <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3 flex items-center gap-2">
        <i className="ri-book-2-line" />
        Słowo dnia
      </h3>

      <div className="mb-3">
        <span className="text-xl font-medium text-zinc-900">{word.word}</span>
        <span className="block text-xs italic text-zinc-500 mt-0.5">
          {decodeHtmlEntities(word.etymology)}
        </span>
      </div>

      <p className="text-sm text-zinc-700 leading-relaxed">
        {decodeHtmlEntities(word.encyclopedicDefinition)}
      </p>
    </div>
  );
}

function SidebarSectionEvents({ section }: { section: BriefSection }) {
  const eventIds = section.keyEvents ?? [];

  if (eventIds.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-200 bg-zinc-50">
        <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
          <i className="ri-newspaper-line text-zinc-500" />
          Wydarzenia
        </h3>
        <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
          {section.headline}
        </p>
      </div>
      <div className="p-3 space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
        {eventIds.map((eventId) => (
          <SectionEventCard key={eventId} eventId={eventId} />
        ))}
      </div>
    </div>
  );
}

export function BriefSidebar({ wordOfTheDay, activeSection }: BriefSidebarProps) {
  return (
    <aside className="lg:sticky lg:top-6 space-y-4">
      {wordOfTheDay && <SidebarWordOfTheDay word={wordOfTheDay} />}
      {activeSection && <SidebarSectionEvents section={activeSection} />}
    </aside>
  );
}
