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
          <Link key={event.id} to={`/event/${event.id}`} className="flex gap-4 group">
            <span className="text-red-500 text-xs shrink-0 w-12">
              {formatTimeAgo(event.updatedAt)}
            </span>
            <div>
              <span className="text-zinc-400 text-xs block">{event.category}</span>
              <h4 className="text-sm text-zinc-600 leading-tight group-hover:text-zinc-900 transition-colors">
                {event.title}
              </h4>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
