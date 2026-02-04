import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { Event } from '../../../types/events';
import { LiveTimeAgo } from '../../common/LiveTimeAgo';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { useEventsStore } from '../../../stores/eventsStore';
import { LocalizedLink } from '../../LocalizedLink';

interface LatestEventsProps {
  events: Event[];
}

export function LatestEvents({ events }: LatestEventsProps) {
  const { t } = useTranslation('common');
  const newEventIds = useEventsStore((s) => s.newEventIds);
  const markEventAsSeen = useEventsStore((s) => s.markEventAsSeen);

  const handleEventClick = (eventId: string) => {
    // Remove highlight when user clicks the event
    if (newEventIds.has(eventId)) {
      markEventAsSeen(eventId);
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-red-500 font-semibold mb-4">{t('sidebar.latest')}</h3>
      <motion.div
        key={events.map(e => e.id).join(',')}
        className="space-y-5"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {events.map((event) => {
          const isNew = newEventIds.has(event.id);
          return (
            <motion.div key={event.id} variants={staggerItem}>
              <LocalizedLink
                to={`/event/${event.id}`}
                className="block group"
                onClick={() => handleEventClick(event.id)}
              >
                <div className="flex items-center gap-2 text-xs mb-1">
                  <LiveTimeAgo date={event.updatedAt} className="text-red-500" />
                  <span className="text-zinc-300">•</span>
                  <span className="text-zinc-400">{event.category}</span>
                </div>
                <h4 className={`text-sm leading-tight transition-colors duration-300 ${
                  isNew
                    ? 'text-red-600 font-semibold'
                    : 'text-zinc-600 group-hover:text-zinc-900'
                }`}>
                  {event.title}
                </h4>
              </LocalizedLink>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
