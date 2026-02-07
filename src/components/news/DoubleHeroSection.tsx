import { useTranslation } from 'react-i18next';
import type { Event } from '../../types/events';
import { getImageSource } from '@/lib/imageSource';
import { EventImage } from '../common/EventImage';
import { SectionWrapper } from '../common/SectionWrapper';
import { LocalizedLink } from '../LocalizedLink';
import { AnimatedUnderline } from '../common/AnimatedUnderline';

interface DoubleHeroSectionProps {
  events: Event[];
  reversed?: boolean;
}

export function DoubleHeroSection({ events, reversed = false }: DoubleHeroSectionProps) {
  const { t } = useTranslation('common');
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
      <LocalizedLink to={`/event/${leftEvent.id}`} className="group/underline p-6 hover:bg-surface transition-colors border-b md:border-b-0 md:border-r border-divider">
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
              <span className="absolute bottom-2 left-2 text-[10px] text-content/80 bg-background/60 backdrop-blur-sm px-2 py-0.5 rounded max-w-[calc(100%-1rem)] truncate">
                Źródło: {getImageSource(leftEvent)}
              </span>
            )}
          </div>
          <span className="text-content-faint text-xs">{t(`categories.${leftEvent.category}`, { defaultValue: leftEvent.category })}</span>
          <h3 className={`text-content-heading font-semibold leading-tight ${leftIsLarger ? 'text-2xl' : 'text-xl'}`}>
            <AnimatedUnderline>{leftEvent.title}</AnimatedUnderline>
          </h3>
          <p className={`text-content leading-snug ${leftIsLarger ? 'mt-3' : 'mt-2 text-sm'}`}>
            {leftEvent.lead}
          </p>
        </article>
      </LocalizedLink>

      <LocalizedLink to={`/event/${rightEvent.id}`} className="group/underline p-6 hover:bg-surface transition-colors">
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
              <span className="absolute bottom-2 left-2 text-[10px] text-content/80 bg-background/60 backdrop-blur-sm px-2 py-0.5 rounded max-w-[calc(100%-1rem)] truncate">
                Źródło: {getImageSource(rightEvent)}
              </span>
            )}
          </div>
          <span className="text-content-faint text-xs">{t(`categories.${rightEvent.category}`, { defaultValue: rightEvent.category })}</span>
          <h3 className={`text-content-heading font-semibold leading-tight ${rightIsLarger ? 'text-2xl' : 'text-xl'}`}>
            <AnimatedUnderline>{rightEvent.title}</AnimatedUnderline>
          </h3>
          <p className={`text-content leading-snug ${rightIsLarger ? 'mt-3' : 'mt-2 text-sm'}`}>
            {rightEvent.lead}
          </p>
        </article>
      </LocalizedLink>
      </div>
    </SectionWrapper>
  );
}
