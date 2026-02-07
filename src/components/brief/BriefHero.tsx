import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { DailyBrief } from '../../types/brief';
import { formatBriefDate } from '../../utils/briefUtils';

import { AudioPlayer } from '../../pages/event/AudioPlayer';
import { useLanguage } from '../../stores/languageStore';
import { getModelDisplayName, getModelColorClass, getModelDescription, estimateBriefCO2, formatCO2, getCO2Equivalents } from '../../utils/co2';

interface BriefHeroProps {
  brief: DailyBrief;
}

export function BriefHero({ brief }: BriefHeroProps) {
  const { t } = useTranslation('brief');
  const language = useLanguage();
  const [showCO2Tooltip, setShowCO2Tooltip] = useState(false);
  const [showModelTooltip, setShowModelTooltip] = useState(false);

  const getTimeBasedHeadline = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('timeHeadline.morning');
    if (hour < 18) return t('timeHeadline.afternoon');
    return t('timeHeadline.evening');
  };

  const timeHeadline = getTimeBasedHeadline();
  const formattedDate = formatBriefDate(brief.date, language);

  const modelId = brief.metadata?.model;
  const co2Grams = estimateBriefCO2(brief);
  const co2Value = formatCO2(co2Grams);
  const co2Equivalents = getCO2Equivalents(co2Grams);
  const modelDescription = getModelDescription(modelId);

  return (
    <header className="mb-14">
      {/* Row: pora dnia --- data */}
      <div className="flex items-center gap-4 mb-4">
        <span className="text-sm text-content-subtle font-medium">{timeHeadline}</span>
        <span className="flex-1 h-px bg-divider" />
        <span className="text-sm text-content-subtle font-medium">{formattedDate}</span>
      </div>

      {/* AI generation info */}
      {modelId && (
        <div className="flex items-center gap-3 mb-4 text-xs text-content-subtle">
          <span className="font-light">
            {t('header.generatedBy', 'Wygenerowany przez')}{' '}
            <span
              className={`relative font-medium cursor-help border-b border-dotted border-current ${getModelColorClass(modelId)}`}
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
            {t('header.emitting', 'emitując')}{' '}
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
        </div>
      )}

      {/* Headline */}
      <h1 className="text-4xl md:text-5xl font-medium text-content-heading mb-5 leading-tight tracking-tight">
        {brief.headline}
      </h1>

      {/* Lead */}
      <p className="text-lg md:text-xl text-content mb-6 leading-relaxed">
        {brief.lead}
      </p>

      {/* AudioPlayer */}
      {brief.audioUrl && (
        <AudioPlayer audioUrl={brief.audioUrl} />
      )}
    </header>
  );
}
