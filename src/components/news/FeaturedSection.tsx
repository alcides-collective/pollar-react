import { Link } from 'react-router-dom';
import type { Event } from '../../types/events';

interface FeaturedSectionProps {
  events: Event[];
}

export function FeaturedSection({ events }: FeaturedSectionProps) {
  if (events.length === 0) return null;

  const mainEvent = events[0];
  const secondaryEvents = events.slice(1, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      <Link to={`/event/${mainEvent.id}`} className="p-6 border-r border-zinc-200 block">
        {mainEvent.imageUrl && (
          <img
            src={mainEvent.imageUrl}
            alt=""
            className="w-full aspect-video object-cover"
          />
        )}
      </Link>

      <div className="p-6">
        <span className="text-zinc-500 text-sm">{mainEvent.category}</span>
        <Link to={`/event/${mainEvent.id}`}>
          <h2 className="text-3xl font-bold text-zinc-900 mt-1 mb-4 leading-tight hover:underline cursor-pointer">
            {mainEvent.title}
          </h2>
        </Link>

        {secondaryEvents.length > 0 && (
          <div className="border-t border-zinc-200 pt-4 mt-4 space-y-4">
            {secondaryEvents.map((event) => (
              <Link
                key={event.id}
                to={`/event/${event.id}`}
                className="hover:bg-zinc-50 transition-colors flex gap-3 p-2 -mx-2 rounded"
              >
                {event.imageUrl && (
                  <img
                    src={event.imageUrl}
                    alt=""
                    className="w-28 aspect-video object-cover shrink-0"
                  />
                )}
                <div>
                  <span className="text-zinc-400 text-xs">{event.category}</span>
                  <h3 className="text-zinc-900 font-semibold text-sm leading-tight">
                    {event.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
