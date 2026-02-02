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
      className="absolute bottom-3 md:bottom-4 left-3 right-3 md:left-4 md:right-auto bg-white rounded-xl overflow-hidden shadow-2xl"
      style={{
        maxWidth: '400px',
        border: '0.5px solid rgba(160, 160, 160, 0.15)',
      }}
    >
      <div className="p-4">
        {/* Meta header */}
        <div className="flex items-center gap-3 mb-3 text-[11px] tracking-wide uppercase font-medium">
          {event.category && (
            <span className="text-zinc-500">
              {categoryLabels[event.category] || event.category}
            </span>
          )}
          <span className="flex-1 h-px bg-zinc-200" />
          {event.articleCount > 0 && (
            <span className="text-zinc-400">
              {event.articleCount} źródeł
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-lg md:text-xl font-semibold mb-2 leading-tight text-zinc-900">
          {event.title}
        </h2>

        {/* Short headline */}
        {event.metadata?.shortHeadline && (
          <p className="text-sm text-zinc-600 mb-4 line-clamp-2">
            {event.metadata.shortHeadline}
          </p>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDetails}
            className="flex-1 text-xs tracking-wide uppercase px-3 py-2 rounded-md bg-zinc-900 text-white font-semibold transition-opacity hover:opacity-80"
          >
            Szczegóły
          </button>
          <button
            onClick={onClose}
            className="text-xs tracking-wide uppercase px-3 py-2 rounded-md border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 transition-colors"
          >
            Zamknij
          </button>
        </div>
      </div>
    </motion.div>
  );
}
