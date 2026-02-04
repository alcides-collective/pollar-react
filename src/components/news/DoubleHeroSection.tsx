import type { Event } from '../../types/events';
import { getImageSource } from '@/lib/imageSource';
import { EventImage } from '../common/EventImage';
import { SectionWrapper } from '../common/SectionWrapper';
import { LocalizedLink } from '../LocalizedLink';

interface DoubleHeroSectionProps {
  events: Event[];
  reversed?: boolean;
}

export function DoubleHeroSection({ events, reversed = false }: DoubleHeroSectionProps) {
  if (events.length < 2) return null;

  const gridCols = reversed ? 'md:grid-cols-[2fr_1fr]' : 'md:grid-cols-[1fr_2fr]';
  const [leftEvent, rightEvent] = events;
  const leftIsLarger = reversed;
  const rightIsLarger = !reversed;

  return (
    <SectionWrapper
      sectionId={`double-hero-${leftEvent.id}-${rightEvent.id}${reversed ? '-reversed' : ''}`}
      priority="auto"
    >
      <div className={`grid grid-cols-1 ${gridCols}`}>
      <LocalizedLink to={`/event/${leftEvent.id}`} className="group p-6 hover:bg-zinc-50 transition-colors border-b md:border-b-0 md:border-r border-zinc-200">
        <article>
          <div className="mb-4 relative">
            <EventImage
              event={leftEvent}
              className="w-full aspect-video object-cover"
              groupHover
              width={800}
              height={450}
            />
            {getImageSource(leftEvent) && (
              <span className="absolute bottom-2 left-2 text-[10px] text-zinc-700/80 bg-white/60 backdrop-blur-sm px-2 py-0.5 rounded max-w-[calc(100%-1rem)] truncate">
                Źródło: {getImageSource(leftEvent)}
              </span>
            )}
          </div>
          <span className="text-zinc-400 text-xs">{leftEvent.category}</span>
          <h3 className={`text-zinc-900 font-semibold leading-tight group-hover:underline ${leftIsLarger ? 'text-2xl' : 'text-xl'}`}>
            {leftEvent.title}
          </h3>
          <p className={`text-zinc-600 leading-snug ${leftIsLarger ? 'mt-3' : 'mt-2 text-sm'}`}>
            {leftEvent.lead}
          </p>
        </article>
      </LocalizedLink>

      <LocalizedLink to={`/event/${rightEvent.id}`} className="group p-6 hover:bg-zinc-50 transition-colors">
        <article>
          <div className="mb-4 relative">
            <EventImage
              event={rightEvent}
              className="w-full aspect-video object-cover"
              groupHover
              width={800}
              height={450}
            />
            {getImageSource(rightEvent) && (
              <span className="absolute bottom-2 left-2 text-[10px] text-zinc-700/80 bg-white/60 backdrop-blur-sm px-2 py-0.5 rounded max-w-[calc(100%-1rem)] truncate">
                Źródło: {getImageSource(rightEvent)}
              </span>
            )}
          </div>
          <span className="text-zinc-400 text-xs">{rightEvent.category}</span>
          <h3 className={`text-zinc-900 font-semibold leading-tight group-hover:underline ${rightIsLarger ? 'text-2xl' : 'text-xl'}`}>
            {rightEvent.title}
          </h3>
          <p className={`text-zinc-600 leading-snug ${rightIsLarger ? 'mt-3' : 'mt-2 text-sm'}`}>
            {rightEvent.lead}
          </p>
        </article>
      </LocalizedLink>
      </div>
    </SectionWrapper>
  );
}
