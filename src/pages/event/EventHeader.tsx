import { useTranslation } from 'react-i18next';
import type { Event } from '../../types/events';
import { AudioPlayer } from './AudioPlayer';
import { BookmarkButton } from '../../components/BookmarkButton';
import { ShareButton } from '../../components/ShareButton';
import { getModelDisplayName, getModelPillClasses, getModelDescription, estimateCO2, formatCO2, getCO2Equivalents } from '../../utils/co2';
import { useRouteLanguage } from '../../hooks/useRouteLanguage';
import { LocalizedLink } from '../../components/LocalizedLink';

interface EventHeaderProps {
  event: Event;
  /** Override view count (from tracking hook) */
  viewCount?: number;
}

export function EventHeader({ event, viewCount }: EventHeaderProps) {
  const { t } = useTranslation('event');
  const lang = useRouteLanguage();
  // Use tracked viewCount if provided, fallback to event.viewCount
  const displayViewCount = viewCount ?? event.viewCount;

  const modelId = event.metadata?.summarizationModel || event.summarizationModel;

  // Timestamps
  const dateLocale = lang === 'pl' ? 'pl-PL' : lang === 'de' ? 'de-DE' : 'en-US';
  const createdAt = new Date(event.createdAt);
  const rtf = new Intl.RelativeTimeFormat(dateLocale, { numeric: 'auto' });

  const formatRelative = (date: Date) => {
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return rtf.format(0, 'second');
    if (diffMins < 60) return rtf.format(-diffMins, 'minute');
    if (diffHours < 24) return rtf.format(-diffHours, 'hour');
    return rtf.format(-diffDays, 'day');
  };

  // lastSummarizationComplete is not synced to events_en/events_de; fall back to lastContentUpdate
  const lastUpdatedRaw = event.lastSummarizationComplete || event.lastContentUpdate;
  const lastUpdated = lastUpdatedRaw ? new Date(lastUpdatedRaw) : null;
  // Initial summarization takes 2-5 min after creation; only show "updated" for re-summarizations.
  // Archived events have archivedAt mapped to lastSummarizationComplete which is misleading.
  const showUpdated = lastUpdated
    && event.freshnessLevel !== 'OLD'
    && (lastUpdated.getTime() - createdAt.getTime() > 10 * 60000);

  const updatedAgo = showUpdated && lastUpdated ? formatRelative(lastUpdated) : '';

  // Full date when there's also "updated" (two relative times next to each other is confusing),
  // relative time for recent events without update.
  // Add exact time (hour:minute) for events from today/yesterday.
  const ageMs = Date.now() - createdAt.getTime();
  const isRecent = ageMs < 48 * 60 * 60 * 1000;
  const fullDate = new Intl.DateTimeFormat(dateLocale, {
    day: 'numeric', month: 'long', year: 'numeric'
  }).format(createdAt) + (lang === 'pl' ? ' roku' : '');
  const timeStr = isRecent
    ? ` ${lang === 'de' ? 'um' : lang === 'en' ? 'at' : 'o'} ${new Intl.DateTimeFormat(dateLocale, { hour: '2-digit', minute: '2-digit' }).format(createdAt)}`
    : '';
  const isArchived = event.freshnessLevel === 'OLD';
  const publishedDate = isArchived || showUpdated || ageMs >= 7 * 24 * 60 * 60 * 1000
    ? fullDate + timeStr
    : formatRelative(createdAt);
  const co2Grams = estimateCO2(event);
  const co2Value = formatCO2(co2Grams);
  const co2Equivalents = getCO2Equivalents(co2Grams, lang);
  const modelDescription = getModelDescription(modelId, lang);

  return (
    <header className="px-6 pt-8 pb-6">
      {/* AI generation info / Archive badge */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-4 text-xs text-content-subtle">
        {isArchived ? (
          <LocalizedLink
            to="/archiwum"
            className="order-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-200/60 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700/60 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <i className="ri-archive-line text-xs" />
            {t('header.archive')}
          </LocalizedLink>
        ) : (
          <>
            {modelId && (
              <span className="order-1">
                {t('header.generatedBy')}{' '}
                <span
                  className={`group/model relative inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ring-1 ring-inset cursor-help ${getModelPillClasses(modelId)}`}
                >
                  {getModelDisplayName(modelId)}
                  {modelDescription.text && (
                    <span className="absolute left-0 bottom-full mb-2 px-3 py-2.5 bg-zinc-900/70 backdrop-blur-xl backdrop-saturate-150 text-zinc-100 text-xs rounded-xl border border-white/10 ring-1 ring-white/5 shadow-xl shadow-black/30 z-[60] w-72 font-normal leading-relaxed opacity-0 invisible group-hover/model:opacity-100 group-hover/model:visible transition-all duration-200">
                      {modelDescription.text}
                    </span>
                  )}
                </span>
              </span>
            )}
          </>
        )}
        {displayViewCount > 0 && (
          <span className="flex items-center gap-1 ml-auto order-2 md:order-3">
            <i className="ri-eye-line" />
            {displayViewCount.toLocaleString()}
          </span>
        )}
        {!isArchived && modelId && (
          <span className="order-3 w-full md:order-2 md:w-auto">
            {t('header.emitting')}{' '}
            <span className="group/co2 relative cursor-help border-b border-dotted border-content-faint">
              {co2Value}mg CO<sub>2</sub>
              <span className="absolute left-0 bottom-full mb-2 px-3 py-2.5 bg-zinc-900/70 backdrop-blur-xl backdrop-saturate-150 text-zinc-100 text-xs rounded-xl border border-white/10 ring-1 ring-white/5 shadow-xl shadow-black/30 whitespace-nowrap z-[60] opacity-0 invisible group-hover/co2:opacity-100 group-hover/co2:visible transition-all duration-200">
                {co2Equivalents.map((equiv, i) => (
                  <span key={i} className="block">{equiv}</span>
                ))}
              </span>
            </span>
          </span>
        )}
      </div>

      {/* Title with actions */}
      <div className="flex items-start gap-4 mb-4">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-content-heading leading-tight flex-1">
          {event.title}
        </h1>
        <div className="flex gap-2 shrink-0 mt-1">
          <ShareButton
            title={event.title}
            text={event.lead}
            size="md"
          />
          <BookmarkButton eventId={event.id} size="md" />
        </div>
      </div>

      {/* Timestamps */}
      <p className="text-xs text-content-subtle mt-1 mb-4">
        {t('header.published')} {publishedDate}
        {showUpdated && <>,<br className="md:hidden" /> {t('header.updated')} {updatedAgo}</>}
      </p>

      {/* Lead */}
      <p className="text-lg text-content leading-relaxed">
        {event.lead}
      </p>

      {/* Audio player - mobile only */}
      {event.audioUrl && (
        <div className="mt-4 lg:hidden">
          <AudioPlayer audioUrl={event.audioUrl} small />
        </div>
      )}
    </header>
  );
}
