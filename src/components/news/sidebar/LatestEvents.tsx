import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Event } from '../../../types/events';
import { LiveTimeAgo } from '../../common/LiveTimeAgo';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface LatestEventsProps {
  events: Event[];
}

export function LatestEvents({ events }: LatestEventsProps) {
  return (
    <div className="p-6">
      <h3 className="text-red-500 font-semibold mb-4">Najnowsze</h3>
      <motion.div
        key={events.map(e => e.id).join(',')}
        className="space-y-5"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {events.map((event) => (
          <motion.div key={event.id} variants={staggerItem}>
            <Link to={`/event/${event.id}`} className="block group">
              <div className="flex items-center gap-2 text-xs mb-1">
                <LiveTimeAgo date={event.updatedAt} className="text-red-500" />
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
