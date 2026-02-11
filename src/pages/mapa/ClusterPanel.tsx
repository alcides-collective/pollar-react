import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLanguageNavigate } from '../../hooks/useLanguageNavigate';
import type { Event } from '../../types/events';

interface ClusterPanelProps {
  events: Event[];
  onClose: () => void;
}

export function ClusterPanel({ events, onClose }: ClusterPanelProps) {
  const navigate = useLanguageNavigate();
  const { t } = useTranslation();

  const handleEventClick = (event: Event) => {
    navigate(`/event/${event.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      className="absolute bottom-3 md:bottom-4 left-3 right-3 bg-background/98 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl"
      style={{ border: '0.5px solid rgba(160, 160, 160, 0.15)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="text-[11px] tracking-wide uppercase text-content-faint font-medium">
          {t('map.eventsInArea', { count: events.length })}
        </span>
        <button
          onClick={onClose}
          className="text-[11px] uppercase tracking-wide text-content-faint hover:text-content-heading transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Horizontal scrolling list */}
      <div className="px-4 pb-4 flex gap-3 overflow-x-auto">
        {events.map((event, index) => (
          <button
            key={event.id}
            onClick={() => handleEventClick(event)}
            className="min-w-[220px] max-w-[260px] text-left p-3 rounded-lg bg-background transition-transform hover:scale-[1.02] shrink-0"
            style={{
              border: '0.5px solid rgba(160, 160, 160, 0.15)',
              boxShadow: '0 0 15px rgba(0,0,0,0.06)',
            }}
          >
            {/* Index and category */}
            <div className="flex items-center gap-2 mb-2 text-[10px] tracking-wide uppercase font-medium">
              <span className="text-content-faint">
                {String(index + 1).padStart(2, '0')}
              </span>
              {event.category && (
                <span className="text-content-subtle">
                  {t(`map.categories.${event.category}`, { defaultValue: event.category })}
                </span>
              )}
            </div>

            {/* Title */}
            <div className="text-sm font-medium leading-tight line-clamp-2 mb-1 text-content-heading">
              {event.title}
            </div>

            {/* Short headline */}
            {event.metadata?.shortHeadline && (
              <div className="text-[11px] text-content-subtle line-clamp-1">
                {event.metadata.shortHeadline}
              </div>
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
