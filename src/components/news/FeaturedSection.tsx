import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Event } from '../../types/events';
import { staggerContainer, staggerItem, scrollReveal } from '@/lib/animations';

interface FeaturedSectionProps {
  events: Event[];
}

export function FeaturedSection({ events }: FeaturedSectionProps) {
  if (events.length === 0) return null;

  const mainEvent = events[0];
  const secondaryEvents = events.slice(1, 3);

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2"
      initial={scrollReveal.initial}
      whileInView={scrollReveal.whileInView}
      viewport={scrollReveal.viewport}
      transition={scrollReveal.transition}
    >
      <div className="md:border-r border-zinc-200 relative">
        <Link to={`/event/${mainEvent.id}`} className="block overflow-hidden">
          {mainEvent.imageUrl && (
            <motion.img
              src={mainEvent.imageUrl}
              alt=""
              className="w-full aspect-[4/3] object-cover"
              style={{
                maskImage: 'radial-gradient(ellipse 150% 100% at 0% 0%, black 50%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(ellipse 150% 100% at 0% 0%, black 50%, transparent 100%)',
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4 }}
            />
          )}
        </Link>
        {mainEvent.lead && (
          <motion.p
            className="text-zinc-600 leading-relaxed p-4 bg-white border border-zinc-200 mx-4 mb-4 -mt-16 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {mainEvent.lead}
          </motion.p>
        )}
      </div>

      <div className="p-6">
        <span className="text-zinc-500 text-sm">{mainEvent.category}</span>
        <Link to={`/event/${mainEvent.id}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mt-1 mb-3 leading-tight hover:underline cursor-pointer">
            {mainEvent.title}
          </h2>
        </Link>

        {secondaryEvents.length > 0 && (
          <motion.div
            className="border-t border-zinc-200 pt-5 mt-4 space-y-4"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {secondaryEvents.map((event) => (
              <motion.div key={event.id} variants={staggerItem}>
                <Link
                  to={`/event/${event.id}`}
                  className="hover:bg-zinc-50 transition-colors flex gap-4 p-2 -mx-2 rounded"
                >
                  {event.imageUrl && (
                    <div className="w-32 shrink-0 overflow-hidden">
                      <motion.img
                        src={event.imageUrl}
                        alt=""
                        className="w-full aspect-video object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
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
    </motion.div>
  );
}
