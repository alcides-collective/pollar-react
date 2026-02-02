import type { DailyBrief } from '../../types/brief';
import { getTimeBasedHeadline, formatBriefDate } from '../../utils/briefUtils';
import { preventWidows } from '../../utils/text';
import { AudioPlayer } from '../../pages/event/AudioPlayer';

interface BriefHeroProps {
  brief: DailyBrief;
}

export function BriefHero({ brief }: BriefHeroProps) {
  const timeHeadline = getTimeBasedHeadline('pl');
  const formattedDate = formatBriefDate(brief.date, 'pl');

  return (
    <header className="mb-14">
      {/* Row: pora dnia --- data */}
      <div className="flex items-center gap-4 mb-4">
        <span className="text-sm text-zinc-500 font-medium">{timeHeadline}</span>
        <span className="flex-1 h-px bg-zinc-200" />
        <span className="text-sm text-zinc-500 font-medium">{formattedDate}</span>
      </div>

      {/* Headline */}
      <h1 className="text-4xl md:text-5xl font-medium text-zinc-900 mb-5 leading-tight tracking-tight">
        {preventWidows(brief.headline)}
      </h1>

      {/* Lead */}
      <p className="text-lg md:text-xl text-zinc-600 mb-6 leading-relaxed">
        {brief.lead}
      </p>

      {/* AudioPlayer */}
      {brief.audioUrl && (
        <AudioPlayer audioUrl={brief.audioUrl} />
      )}
    </header>
  );
}
