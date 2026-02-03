import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Event } from '../../types/events';
import { scrollReveal } from '@/lib/animations';
import { getImageSource } from '@/lib/imageSource';
import { EventImage } from '../common/EventImage';

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
    <motion.div
      className={`grid grid-cols-1 ${gridCols}`}
      initial={scrollReveal.initial}
      whileInView={scrollReveal.whileInView}
      viewport={scrollReveal.viewport}
      transition={scrollReveal.transition}
    >
      <Link to={`/event/${leftEvent.id}`} className="group p-6 hover:bg-zinc-50 transition-colors border-b md:border-b-0 md:border-r border-zinc-200">
        <article>
          <div className="overflow-hidden mb-4 relative">
            <EventImage
              event={leftEvent}
              className="w-full aspect-video object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
              hoverScale={1}
            />
            {getImageSource(leftEvent) && (
              <span className="absolute bottom-2 left-2 text-[10px] text-zinc-700/80 bg-white/60 backdrop-blur-sm px-2 py-0.5 rounded">
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
      </Link>

      <Link to={`/event/${rightEvent.id}`} className="group p-6 hover:bg-zinc-50 transition-colors">
        <article>
          <div className="overflow-hidden mb-4 relative">
            <EventImage
              event={rightEvent}
              className="w-full aspect-video object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
              hoverScale={1}
            />
            {getImageSource(rightEvent) && (
              <span className="absolute bottom-2 left-2 text-[10px] text-zinc-700/80 bg-white/60 backdrop-blur-sm px-2 py-0.5 rounded">
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
      </Link>
    </motion.div>
  );
}
