import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Event } from '../../types/events';
import { AudioPlayer } from './AudioPlayer';
import { BookmarkButton } from '../../components/BookmarkButton';
import { ShareButton } from '../../components/ShareButton';
import { getModelDisplayName, getModelPillClasses, getModelDescription, estimateCO2, formatCO2, getCO2Equivalents } from '../../utils/co2';

interface EventHeaderProps {
  event: Event;
  /** Override view count (from tracking hook) */
  viewCount?: number;
}

export function EventHeader({ event, viewCount }: EventHeaderProps) {
  const { t } = useTranslation('event');
  // Use tracked viewCount if provided, fallback to event.viewCount
  const displayViewCount = viewCount ?? event.viewCount;
  const [showCO2Tooltip, setShowCO2Tooltip] = useState(false);
  const [showModelTooltip, setShowModelTooltip] = useState(false);

  const modelId = event.metadata?.summarizationModel || event.summarizationModel;
  const co2Grams = estimateCO2(event);
  const co2Value = formatCO2(co2Grams);
  const co2Equivalents = getCO2Equivalents(co2Grams);
  const modelDescription = getModelDescription(modelId);

  return (
    <header className="px-6 pt-8 pb-6">
      {/* AI generation info */}
      <div className="flex items-center gap-3 mb-4 text-xs text-content-subtle">
        {modelId && (
          <span className="font-light">
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
            </span>{' '}
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
        {displayViewCount > 0 && (
          <>
            {modelId && <span className="text-content-faint">•</span>}
            <span className="flex items-center gap-1">
              <i className="ri-eye-line" />
              {displayViewCount.toLocaleString()}
            </span>
          </>
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
