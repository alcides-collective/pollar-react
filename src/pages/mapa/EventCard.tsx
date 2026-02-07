import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Event } from '../../types/events';

interface EventCardProps {
  event: Event;
  onClose: () => void;
}

const categoryLabels: Record<string, string> = {
  polityka: 'Polityka',
  gospodarka: 'Gospodarka',
  swiat: 'Świat',
  spoleczenstwo: 'Społeczeństwo',
  nauka: 'Nauka',
  technologia: 'Technologia',
  kultura: 'Kultura',
  sport: 'Sport',
};

export function EventCard({ event, onClose }: EventCardProps) {
  const navigate = useNavigate();

  const handleDetails = () => {
    navigate(`/event/${event.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      className="absolute bottom-3 md:bottom-4 left-3 right-3 md:left-4 md:right-auto bg-background rounded-xl overflow-hidden shadow-2xl"
      style={{
        maxWidth: '400px',
        border: '0.5px solid rgba(160, 160, 160, 0.15)',
      }}
    >
      <div className="p-4">
        {/* Meta header */}
        <div className="flex items-center gap-3 mb-3 text-[11px] tracking-wide uppercase font-medium">
          {event.category && (
            <span className="text-content-subtle">
              {categoryLabels[event.category] || event.category}
            </span>
          )}
          <span className="flex-1 h-px bg-divider" />
          {event.articleCount > 0 && (
            <span className="text-content-faint">
              {event.articleCount} źródeł
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-lg md:text-xl font-semibold mb-2 leading-tight text-content-heading">
          {event.title}
        </h2>

        {/* Short headline */}
        {event.metadata?.shortHeadline && (
          <p className="text-sm text-content mb-4 line-clamp-2">
            {event.metadata.shortHeadline}
          </p>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDetails}
            className="flex-1 text-xs tracking-wide uppercase px-3 py-2 rounded-md bg-primary text-primary-foreground font-semibold transition-opacity hover:opacity-80"
          >
            Szczegóły
          </button>
          <button
            onClick={onClose}
            className="text-xs tracking-wide uppercase px-3 py-2 rounded-md border border-divider text-content-subtle hover:text-content-heading hover:border-divider transition-colors"
          >
            Zamknij
          </button>
        </div>
      </div>
    </motion.div>
  );
}
