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
    <div className="bg-background border border-divider rounded-xl p-5 h-full flex flex-col">
      <LocalizedLink
        to={categoryUrl}
        className="block text-sm font-semibold text-content-heading mb-4 pb-2 border-b border-divider-subtle hover:text-red-600 transition-colors"
      >
        {category}
        <span className="ml-2 text-xs font-normal text-content-faint">
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
                <span className="text-content-faint">•</span>
                <span className="text-content-faint truncate">
                  {event.sourceCount || event.sources?.length || 0}{' '}
                  {(event.sourceCount || event.sources?.length || 0) === 1 ? 'źródło' : 'źródeł'}
                </span>
              </div>
              <h4 className="text-sm leading-tight text-content group-hover:text-content-heading transition-colors line-clamp-2">
                {event.title}
              </h4>
            </LocalizedLink>
          </motion.div>
        ))}
      </motion.div>

      {events.length > maxEvents && (
        <div className="mt-4 pt-3 border-t border-divider-subtle">
          <LocalizedLink
            to={categoryUrl}
            className="text-xs text-content-faint hover:text-red-600 transition-colors"
          >
            +{events.length - maxEvents} więcej
          </LocalizedLink>
        </div>
      )}
    </div>
  );
}
