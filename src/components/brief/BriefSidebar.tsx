import { LocalizedLink } from '@/components/LocalizedLink';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useEvent } from '../../hooks/useEvent';
import type { WordOfTheDay, BriefSection } from '../../types/brief';
import { decodeHtmlEntities } from '../../utils/sanitize';
import { extractEventIds } from '../../utils/text';
import { useLanguage } from '../../stores/languageStore';
import { eventPath } from '../../utils/slug';

function stripIds(text: string): string {
  return text
    .replace(/\s*\(ID:\s*\d+\)/gi, '')
    .replace(/\s*\((?:event\s+)?[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\)/gi, '')
    .trim();
}

interface BriefSidebarProps {
  wordOfTheDay: WordOfTheDay | null;
  activeSection: BriefSection | null;
  sections?: BriefSection[];
}

function SectionEventCard({ eventId }: { eventId: string }) {
  const language = useLanguage();
  const { event, loading } = useEvent(eventId);

  const localeMap: Record<string, string> = { pl: 'pl-PL', en: 'en-US', de: 'de-DE' };

  if (loading) {
    return (
      <div className="p-3 bg-surface rounded-lg animate-pulse">
        <div className="h-4 w-3/4 bg-divider rounded mb-2" />
        <div className="h-3 w-full bg-divider rounded mb-2" />
        <div className="h-3 w-16 bg-divider rounded" />
      </div>
    );
  }

  if (!event) return null;

  const date = new Date(event.createdAt);

  const formattedDate = date.toLocaleDateString(localeMap[language] || 'pl-PL', {
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
    <LocalizedLink
      to={eventPath(event)}
      className="block p-3 bg-surface hover:bg-muted rounded-lg transition-colors group"
    >
      <p className="text-sm font-medium text-content-heading group-hover:text-content mb-1 line-clamp-2">
        {headline}
      </p>
      {description && (
        <p className="text-xs text-content line-clamp-2 mb-2">
          {description}
        </p>
      )}
      <p className="text-xs text-content-faint">{formattedDate}</p>
    </LocalizedLink>
  );
}

function SidebarWordOfTheDay({ word }: { word: WordOfTheDay }) {
  const { t } = useTranslation('brief');
  return (
    <div className="p-4 rounded-xl border border-divider bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30">
      <h3 className="text-xs uppercase tracking-wider text-content-subtle font-semibold mb-3 flex items-center gap-2">
        <i className="ri-book-2-line" />
        {t('wordOfTheDay')}
      </h3>

      <div className="mb-3">
        <span className="text-xl font-medium text-content-heading">{word.word}</span>
        <span className="block text-xs italic text-content-subtle mt-0.5">
          {decodeHtmlEntities(word.etymology)}
        </span>
      </div>

      <p className="text-sm text-content leading-relaxed">
        {decodeHtmlEntities(word.encyclopedicDefinition)}
      </p>
    </div>
  );
}

function SidebarSectionEvents({ section }: { section: BriefSection }) {
  const { t } = useTranslation('brief');
  // Use keyEvents if available, otherwise extract UUIDs from content
  // Filter out empty strings from keyEvents
  const keyEvents = (section.keyEvents ?? []).filter(id => id && id.trim());
  const extractedIds = extractEventIds(section.content);
  // Merge both sources, prefer keyEvents but add extracted ones too
  const eventIds = [...new Set([...keyEvents, ...extractedIds])];

  if (eventIds.length === 0) return null;

  return (
    <motion.div
      key={section.headline}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-surface-alt rounded-xl border border-divider overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-divider bg-surface">
        <h3 className="text-sm font-semibold text-content-heading flex items-center gap-2">
          <i className="ri-newspaper-line text-content-subtle" />
          {t('events')}
        </h3>
        <p className="text-xs text-content-subtle mt-0.5 line-clamp-1">
          {section.headline}
        </p>
      </div>
      <div className="p-3 space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
        {eventIds.map((eventId, index) => (
          <motion.div
            key={eventId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <SectionEventCard eventId={eventId} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function getSectionEventIds(section: BriefSection): string[] {
  const keyEvents = (section.keyEvents ?? []).filter(id => id && id.trim());
  const extractedIds = extractEventIds(section.content);
  return [...new Set([...keyEvents, ...extractedIds])];
}

export function BriefSidebar({ wordOfTheDay, activeSection, sections = [] }: BriefSidebarProps) {
  // If no active section, find first section with events
  const sectionToShow = activeSection ?? sections.find(s => getSectionEventIds(s).length > 0) ?? null;

  return (
    <aside className="lg:sticky lg:top-6 space-y-4">
      {wordOfTheDay && <SidebarWordOfTheDay word={wordOfTheDay} />}
      <AnimatePresence mode="wait">
        {sectionToShow && (
          <SidebarSectionEvents key={sectionToShow.headline} section={sectionToShow} />
        )}
      </AnimatePresence>
    </aside>
  );
}
