import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Event } from '../../types/events';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { getImageSource } from '@/lib/imageSource';
import { EventImage } from '../common/EventImage';
import { SectionWrapper } from '../common/SectionWrapper';
import { LocalizedLink } from '../LocalizedLink';
import { AnimatedHeadline, AnimatedUnderline } from '../common/AnimatedUnderline';

interface FeaturedSectionProps {
  events: Event[];
}

export function FeaturedSection({ events }: FeaturedSectionProps) {
  const { t } = useTranslation('common');
  if (events.length === 0) return null;

  const mainEvent = events[0];
  const secondaryEvents = events.slice(1, 3);
  const imageSource = getImageSource(mainEvent);

  return (
    <SectionWrapper
      sectionId={`featured-${events.map(e => e.id).join(',')}`}
      priority="high"
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
      <div className="md:border-r border-divider relative overflow-hidden p-6 md:p-0">
        <LocalizedLink to={`/event/${mainEvent.id}`} className="group block relative">
          <EventImage
            event={mainEvent}
            className="w-full aspect-[4/3] object-cover md:[mask-image:radial-gradient(ellipse_150%_100%_at_0%_0%,black_50%,transparent_100%)] md:[-webkit-mask-image:radial-gradient(ellipse_150%_100%_at_0%_0%,black_50%,transparent_100%)]"
            groupHover
            hoverShadow={false}
            width={800}
            height={600}
          />
          {/* Mobile: badge on photo */}
          {imageSource && (
            <span className="md:hidden absolute bottom-2 left-2 text-[10px] text-content/80 bg-background/60 backdrop-blur-sm px-2 py-0.5 rounded max-w-[calc(100%-1rem)] truncate z-10">
              Źródło: {imageSource}
            </span>
          )}
        </LocalizedLink>
        {/* Desktop: badge + leadbox overlaid on image */}
        {(imageSource || mainEvent.lead) && (
          <motion.div
            className="hidden md:block mx-4 mb-4 -mt-16 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {imageSource && (
              <span className="inline-block text-[10px] text-content/80 bg-background/60 backdrop-blur-sm px-2 py-0.5 rounded mb-2 max-w-full truncate">
                Źródło: {imageSource}
              </span>
            )}
            {mainEvent.lead && (
              <LocalizedLink to={`/event/${mainEvent.id}`}>
                <p className="text-content leading-relaxed p-4 bg-background border border-divider hover:bg-surface transition-colors">
                  {mainEvent.lead}
                </p>
              </LocalizedLink>
            )}
          </motion.div>
        )}
      </div>

      <div className="px-6 pt-2 pb-6 md:p-6">
        <span className="text-content-subtle text-sm">{t(`categories.${mainEvent.category}`, { defaultValue: mainEvent.category })}</span>
        <AnimatedHeadline
          to={`/event/${mainEvent.id}`}
          as="h2"
          className="text-3xl md:text-4xl font-bold text-content-heading mt-1 mb-3 leading-tight"
        >
          {mainEvent.title}
        </AnimatedHeadline>

        {/* Leadbox - only on mobile (after headline) */}
        {mainEvent.lead && (
          <LocalizedLink to={`/event/${mainEvent.id}`}>
            <motion.div
              className="md:hidden mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <p className="text-content leading-relaxed p-4 bg-background border border-divider hover:bg-surface transition-colors">
                {mainEvent.lead}
              </p>
            </motion.div>
          </LocalizedLink>
        )}

        {secondaryEvents.length > 0 && (
          <motion.div
            key={secondaryEvents.map(e => e.id).join(',')}
            className="border-t border-divider pt-5 mt-4 space-y-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {secondaryEvents.map((event) => (
              <motion.div key={event.id} variants={staggerItem}>
                <LocalizedLink
                  to={`/event/${event.id}`}
                  className="group hover:bg-surface transition-colors flex gap-4 p-2 -mx-2 rounded"
                >
                  <div className="w-40 shrink-0">
                    <div className="relative">
                      <EventImage
                        event={event}
                        className="w-full aspect-video object-cover"
                        groupHover
                        width={320}
                        height={180}
                      />
                      {getImageSource(event) && (
                        <span className="absolute bottom-1 left-1 text-[10px] text-content/80 bg-background/60 backdrop-blur-sm px-1.5 py-0.5 rounded z-10 max-w-[calc(100%-0.5rem)] truncate">
                          Źródło: {getImageSource(event)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col justify-center group/underline">
                    <span className="text-content-faint text-xs">{t(`categories.${event.category}`, { defaultValue: event.category })}</span>
                    <h3 className="text-content-heading font-semibold text-base leading-snug">
                      <AnimatedUnderline>
                        {event.title}
                      </AnimatedUnderline>
                    </h3>
                  </div>
                </LocalizedLink>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      </div>
    </SectionWrapper>
  );
}
