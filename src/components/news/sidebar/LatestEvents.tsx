import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Event } from '../../../types/events';
import { formatTimeAgo } from '../../../utils/formatTimeAgo';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface LatestEventsProps {
  events: Event[];
}

export function LatestEvents({ events }: LatestEventsProps) {
  return (
    <div className="p-6">
      <h3 className="text-red-500 font-semibold mb-4">Najnowsze</h3>
      <motion.div
        className="space-y-5"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        {events.map((event) => (
          <motion.div key={event.id} variants={staggerItem}>
            <Link to={`/event/${event.id}`} className="block group">
              <div className="flex items-center gap-2 text-xs mb-1">
                <span className="text-red-500">{formatTimeAgo(event.updatedAt)}</span>
                <span className="text-zinc-300">•</span>
                <span className="text-zinc-400">{event.category}</span>
              </div>
              <h4 className="text-sm text-zinc-600 leading-tight group-hover:text-zinc-900 transition-colors duration-300">
                {event.title}
              </h4>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
