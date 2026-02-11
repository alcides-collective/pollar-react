import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Event } from '../../types/events';
import { AudioPlayer } from './AudioPlayer';
import { BookmarkButton } from '../../components/BookmarkButton';
import { ShareButton } from '../../components/ShareButton';
import { getModelDisplayName, getModelPillClasses, getModelDescription, estimateCO2, formatCO2, getCO2Equivalents } from '../../utils/co2';
import { useRouteLanguage } from '../../hooks/useRouteLanguage';

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
  const [showCO2Tooltip, setShowCO2Tooltip] = useState(false);
  const [showModelTooltip, setShowModelTooltip] = useState(false);

  const modelId = event.metadata?.summarizationModel || event.summarizationModel;

  // Timestamps
  const dateLocale = lang === 'pl' ? 'pl-PL' : lang === 'de' ? 'de-DE' : 'en-US';
  const createdAt = new Date(event.createdAt);
  const publishedDate = new Intl.DateTimeFormat(dateLocale, {
    day: 'numeric', month: 'long', year: 'numeric'
  }).format(createdAt) + (lang === 'pl' ? ' roku' : '');

  const lastSummarized = event.lastSummarizationComplete
    ? new Date(event.lastSummarizationComplete)
    : null;
  // Initial summarization takes 2-5 min after creation; only show "updated" for re-summarizations
  const showUpdated = lastSummarized && (lastSummarized.getTime() - createdAt.getTime() > 10 * 60000);

  let updatedAgo = '';
  if (showUpdated && lastSummarized) {
    const diffMs = Date.now() - lastSummarized.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const rtf = new Intl.RelativeTimeFormat(dateLocale, { numeric: 'auto' });
    if (diffMins < 1) updatedAgo = rtf.format(0, 'second');
    else if (diffMins < 60) updatedAgo = rtf.format(-diffMins, 'minute');
    else if (diffHours < 24) updatedAgo = rtf.format(-diffHours, 'hour');
    else updatedAgo = rtf.format(-diffDays, 'day');
  }
  const co2Grams = estimateCO2(event);
  const co2Value = formatCO2(co2Grams);
  const co2Equivalents = getCO2Equivalents(co2Grams);
  const modelDescription = getModelDescription(modelId);

  return (
    <header className="px-6 pt-8 pb-6">
      {/* AI generation info */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4 text-xs text-content-subtle">
        {modelId && (
          <span className="font-light order-1">
            {t('header.generatedBy')}{' '}
            <span
              className={`relative inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ring-1 ring-inset cursor-help ${getModelPillClasses(modelId)}`}
              onMouseEnter={() => setShowModelTooltip(true)}
              onMouseLeave={() => setShowModelTooltip(false)}
            >
              {getModelDisplayName(modelId)}
              {showModelTooltip && modelDescription.text && (
                <span className="absolute left-0 bottom-full mb-2 px-3 py-2.5 bg-zinc-900/70 backdrop-blur-xl backdrop-saturate-150 text-zinc-100 text-xs rounded-xl border border-white/10 ring-1 ring-white/5 shadow-xl shadow-black/30 z-[60] w-72 font-normal leading-relaxed">
                  {modelDescription.text}
                </span>
              )}
            </span>
          </span>
        )}
        {displayViewCount > 0 && (
          <span className="flex items-center gap-1 ml-auto order-2 md:order-3">
            <i className="ri-eye-line" />
            {displayViewCount.toLocaleString()}
          </span>
        )}
        {modelId && (
          <span className="font-light order-3 w-full md:order-2 md:w-auto">
            {t('header.emitting')}{' '}
            <span
              className="relative cursor-help border-b border-dotted border-content-faint"
              onMouseEnter={() => setShowCO2Tooltip(true)}
              onMouseLeave={() => setShowCO2Tooltip(false)}
            >
              {co2Value}mg CO<sub>2</sub>
              {showCO2Tooltip && (
                <span className="absolute left-0 bottom-full mb-2 px-3 py-2.5 bg-zinc-900/70 backdrop-blur-xl backdrop-saturate-150 text-zinc-100 text-xs rounded-xl border border-white/10 ring-1 ring-white/5 shadow-xl shadow-black/30 whitespace-nowrap z-[60]">
                  {co2Equivalents.map((equiv, i) => (
                    <span key={i} className="block">{equiv}</span>
                  ))}
                </span>
              )}
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
