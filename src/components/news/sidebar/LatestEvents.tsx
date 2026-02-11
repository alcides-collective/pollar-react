import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { Event } from '../../../types/events';
import { LiveTimeAgo } from '../../common/LiveTimeAgo';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { useEventsStore } from '../../../stores/eventsStore';
import { useEngineStatus } from '../../../hooks/useEngineStatus';
import { LocalizedLink } from '../../LocalizedLink';
import { eventPath } from '../../../utils/slug';

interface LatestEventsProps {
  events: Event[];
}

export function LatestEvents({ events }: LatestEventsProps) {
  const { t } = useTranslation('common');
  const newEventIds = useEventsStore((s) => s.newEventIds);
  const markEventAsSeen = useEventsStore((s) => s.markEventAsSeen);
  const engineDown = useEngineStatus();

  const handleEventClick = (eventId: string) => {
    // Remove highlight when user clicks the event
    if (newEventIds.has(eventId)) {
      markEventAsSeen(eventId);
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-red-500 font-semibold mb-4">{t('sidebar.latest')}</h3>
      {engineDown && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/30 p-3">
          <div className="flex items-start gap-2">
            <i className="ri-alert-line text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              <p>{t('sidebar.engineDown')}</p>
              <a
                href="https://status.pollar.news"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-1.5 font-medium text-amber-700 dark:text-amber-200 hover:underline"
              >
                {t('sidebar.engineStatusLink')}
                <i className="ri-external-link-line text-[10px]" />
              </a>
            </div>
          </div>
        </div>
      )}
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
                to={eventPath(event)}
                className="block group"
                onClick={() => handleEventClick(event.id)}
              >
                <div className="flex items-center gap-2 text-xs mb-1">
                  <LiveTimeAgo date={event.updatedAt} className="text-red-500" />
                  <span className="text-content-faint">•</span>
                  <span className="text-content-faint">{t(`categories.${event.category}`, { defaultValue: event.category })}</span>
                </div>
                <h4 className={`text-sm leading-tight transition-colors duration-300 ${
                  isNew
                    ? 'text-red-600 font-semibold'
                    : 'text-content group-hover:text-content-heading'
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
