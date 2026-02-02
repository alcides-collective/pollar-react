import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Event } from '../../types/events';
import { cardHover, imageHover } from '@/lib/animations';

type EventCardSize = 'sm' | 'md' | 'lg' | 'xl';

interface EventCardProps {
  event: Event;
  size?: EventCardSize;
  showImage?: boolean;
  showCategory?: boolean;
  showLead?: boolean;
  className?: string;
}

const sizeStyles: Record<EventCardSize, { title: string; lead: string }> = {
  sm: { title: 'text-sm', lead: 'text-xs' },
  md: { title: 'text-base', lead: 'text-sm' },
  lg: { title: 'text-xl', lead: 'text-sm' },
  xl: { title: 'text-2xl', lead: 'text-base' },
};

export function EventCard({
  event,
  size = 'md',
  showImage = true,
  showCategory = true,
  showLead = false,
  className = '',
}: EventCardProps) {
  const styles = sizeStyles[size];

  return (
    <Link to={`/event/${event.id}`} className={`group block ${className}`}>
      <motion.article
        {...cardHover}
      >
        {showImage && event.imageUrl && (
          <div className="overflow-hidden mb-4">
            <motion.img
              src={event.imageUrl}
              alt=""
              className="w-full aspect-video object-cover"
              {...imageHover}
            />
          </div>
        )}
        {showCategory && (
          <span className="text-zinc-400 text-xs">{event.category}</span>
        )}
        <h3 className={`text-zinc-900 font-semibold leading-tight group-hover:underline ${styles.title}`}>
          {event.title}
        </h3>
        {showLead && event.lead && (
          <p className={`text-zinc-600 mt-2 leading-snug ${styles.lead}`}>
            {event.lead}
          </p>
        )}
      </motion.article>
    </Link>
  );
}
