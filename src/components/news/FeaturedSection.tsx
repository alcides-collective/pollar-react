import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Event } from '../../types/events';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { getImageSource } from '@/lib/imageSource';
import { EventImage } from '../common/EventImage';
import { SectionWrapper } from '../common/SectionWrapper';

interface FeaturedSectionProps {
  events: Event[];
}

export function FeaturedSection({ events }: FeaturedSectionProps) {
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
      <div className="md:border-r border-zinc-200 relative overflow-hidden">
        <Link to={`/event/${mainEvent.id}`} className="group block">
          <EventImage
            event={mainEvent}
            className="w-full aspect-[4/3] object-cover"
            style={{
              maskImage: 'radial-gradient(ellipse 150% 100% at 0% 0%, black 50%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 150% 100% at 0% 0%, black 50%, transparent 100%)',
            }}
            groupHover
            hoverShadow={false}
            width={800}
            height={600}
          />
        </Link>
        {/* Leadbox - only on desktop (overlaid on image) */}
        {(imageSource || mainEvent.lead) && (
          <Link to={`/event/${mainEvent.id}`}>
            <motion.div
              className="hidden md:block mx-4 mb-4 -mt-16 relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {imageSource && (
                <span className="inline-block text-[10px] text-zinc-700/80 bg-white/60 backdrop-blur-sm px-2 py-0.5 rounded mb-2 max-w-full truncate">
                  Źródło: {imageSource}
                </span>
              )}
              {mainEvent.lead && (
                <p className="text-zinc-600 leading-relaxed p-4 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors">
                  {mainEvent.lead}
                </p>
              )}
            </motion.div>
          </Link>
        )}
      </div>

      <div className="p-6">
        <span className="text-zinc-500 text-sm">{mainEvent.category}</span>
        <Link to={`/event/${mainEvent.id}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mt-1 mb-3 leading-tight hover:underline cursor-pointer">
            {mainEvent.title}
          </h2>
        </Link>

        {/* Leadbox - only on mobile (after headline) */}
        {(imageSource || mainEvent.lead) && (
          <Link to={`/event/${mainEvent.id}`}>
            <motion.div
              className="md:hidden mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {imageSource && (
                <span className="inline-block text-[10px] text-zinc-700/80 bg-white/60 backdrop-blur-sm px-2 py-0.5 rounded mb-2 max-w-full truncate">
                  Źródło: {imageSource}
                </span>
              )}
              {mainEvent.lead && (
                <p className="text-zinc-600 leading-relaxed p-4 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors">
                  {mainEvent.lead}
                </p>
              )}
            </motion.div>
          </Link>
        )}

        {secondaryEvents.length > 0 && (
          <motion.div
            key={secondaryEvents.map(e => e.id).join(',')}
            className="border-t border-zinc-200 pt-5 mt-4 space-y-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {secondaryEvents.map((event) => (
              <motion.div key={event.id} variants={staggerItem}>
                <Link
                  to={`/event/${event.id}`}
                  className="group hover:bg-zinc-50 transition-colors flex gap-4 p-2 -mx-2 rounded"
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
                        <span className="absolute bottom-1 left-1 text-[10px] text-zinc-700/80 bg-white/60 backdrop-blur-sm px-1.5 py-0.5 rounded z-10 max-w-[calc(100%-0.5rem)] truncate">
                          Źródło: {getImageSource(event)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-zinc-400 text-xs">{event.category}</span>
                    <h3 className="text-zinc-900 font-semibold text-base leading-snug">
                      {event.title}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      </div>
    </SectionWrapper>
  );
}
