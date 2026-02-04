import { LocalizedLink } from '@/components/LocalizedLink';
import { motion } from 'framer-motion';
import type { Event } from '../../types/events';
import { LiveTimeAgo } from '../../components/common/LiveTimeAgo';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface CategoryCardProps {
  category: string;
  events: Event[];
  maxEvents?: number;
}

export function CategoryCard({ category, events, maxEvents = 5 }: CategoryCardProps) {
  const displayEvents = events.slice(0, maxEvents);
  const categoryUrl = `/archiwum/${encodeURIComponent(category.toLowerCase())}`;

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5 h-full flex flex-col">
      <LocalizedLink
        to={categoryUrl}
        className="block text-sm font-semibold text-zinc-900 mb-4 pb-2 border-b border-zinc-100 hover:text-red-600 transition-colors"
      >
        {category}
        <span className="ml-2 text-xs font-normal text-zinc-400">
          ({events.length})
        </span>
      </LocalizedLink>

      <motion.div
        className="space-y-4 flex-1"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {displayEvents.map((event) => (
          <motion.div key={event.id} variants={staggerItem}>
            <LocalizedLink to={`/event/${event.id}`} className="block group">
              <div className="flex items-center gap-2 text-xs mb-1">
                <LiveTimeAgo date={event.updatedAt} className="text-red-500" />
                <span className="text-zinc-300">•</span>
                <span className="text-zinc-400 truncate">
                  {event.sourceCount || event.sources?.length || 0}{' '}
                  {(event.sourceCount || event.sources?.length || 0) === 1 ? 'źródło' : 'źródeł'}
                </span>
              </div>
              <h4 className="text-sm leading-tight text-zinc-600 group-hover:text-zinc-900 transition-colors line-clamp-2">
                {event.title}
              </h4>
            </LocalizedLink>
          </motion.div>
        ))}
      </motion.div>

      {events.length > maxEvents && (
        <div className="mt-4 pt-3 border-t border-zinc-100">
          <LocalizedLink
            to={categoryUrl}
            className="text-xs text-zinc-400 hover:text-red-600 transition-colors"
          >
            +{events.length - maxEvents} więcej
          </LocalizedLink>
        </div>
      )}
    </div>
  );
}
