import { useState } from 'react';
import type { Event } from '../../types/events';
import { AudioPlayer } from './AudioPlayer';
import { BookmarkButton } from '../../components/BookmarkButton';
import { getModelDisplayName, getModelColorClass, getModelDescription, estimateCO2, formatCO2, getCO2Equivalents } from '../../utils/co2';

interface EventHeaderProps {
  event: Event;
}

export function EventHeader({ event }: EventHeaderProps) {
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
      <div className="flex items-center gap-3 mb-4 text-xs text-zinc-500">
        {modelId && (
          <span className="font-light">
            Wygenerowany przez{' '}
            <span
              className={`relative font-medium cursor-help border-b border-dotted border-current ${getModelColorClass(modelId)}`}
              onMouseEnter={() => setShowModelTooltip(true)}
              onMouseLeave={() => setShowModelTooltip(false)}
            >
              {getModelDisplayName(modelId)}
              {showModelTooltip && modelDescription.text && (
                <span className="absolute left-0 bottom-full mb-2 px-3 py-2 bg-zinc-900 text-white text-xs rounded shadow-lg z-[60] w-72 font-normal leading-relaxed">
                  {modelDescription.text}
                </span>
              )}
            </span>{' '}
            emitując{' '}
            <span
              className="relative cursor-help border-b border-dotted border-zinc-400"
              onMouseEnter={() => setShowCO2Tooltip(true)}
              onMouseLeave={() => setShowCO2Tooltip(false)}
            >
              {co2Value}mg CO<sub>2</sub>
              {showCO2Tooltip && (
                <span className="absolute left-0 bottom-full mb-2 px-3 py-2 bg-zinc-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-[60]">
                  {co2Equivalents.map((equiv, i) => (
                    <span key={i} className="block">{equiv}</span>
                  ))}
                </span>
              )}
            </span>
          </span>
        )}
        {event.viewCount > 0 && (
          <>
            {modelId && <span className="text-zinc-300">•</span>}
            <span className="flex items-center gap-1">
              <i className="ri-eye-line" />
              {event.viewCount}
            </span>
          </>
        )}
      </div>

      {/* Title with bookmark */}
      <div className="flex items-start gap-4 mb-4">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-medium text-zinc-900 leading-tight flex-1">
          {event.title}
        </h1>
        <BookmarkButton eventId={event.id} size="md" className="shrink-0 mt-1" />
      </div>

      {/* Lead */}
      <p className="text-lg text-zinc-600 leading-relaxed">
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
