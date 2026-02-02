import { Link } from 'react-router-dom';
import type { Event } from '../../../types/events';
import { formatTimeAgo } from '../../../utils/formatTimeAgo';

interface LatestEventsProps {
  events: Event[];
}

export function LatestEvents({ events }: LatestEventsProps) {
  return (
    <div className="p-6">
      <h3 className="text-red-500 font-semibold mb-4">Najnowsze</h3>
      <div className="space-y-5">
        {events.map((event) => (
          <Link key={event.id} to={`/event/${event.id}`} className="block group">
            <div className="flex items-center gap-2 text-xs mb-1">
              <span className="text-red-500">{formatTimeAgo(event.updatedAt)}</span>
              <span className="text-zinc-300">•</span>
              <span className="text-zinc-400">{event.category}</span>
            </div>
            <h4 className="text-sm text-zinc-600 leading-tight group-hover:text-zinc-900 transition-colors">
              {event.title}
            </h4>
          </Link>
        ))}
      </div>
    </div>
  );
}
