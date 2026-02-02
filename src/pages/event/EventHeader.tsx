import type { Event } from '../../types/events';
import { translateCategory } from '../../utils/categories';
import { AudioPlayer } from './AudioPlayer';

interface EventHeaderProps {
  event: Event;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function EventHeader({ event }: EventHeaderProps) {
  const category = translateCategory(event.category);

  return (
    <header className="px-6 pt-8 pb-6">
      {/* Category & Date */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          {category}
        </span>
        <span className="text-zinc-300">•</span>
        <time className="text-xs text-zinc-500">
          {formatDate(event.createdAt)}
        </time>
        {event.viewCount > 0 && (
          <>
            <span className="text-zinc-300">•</span>
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <i className="ri-eye-line" />
              {event.viewCount}
            </span>
          </>
        )}
        {event.audioUrl && (
          <>
            <span className="text-zinc-300">•</span>
            <AudioPlayer audioUrl={event.audioUrl} />
          </>
        )}
      </div>

      {/* Title */}
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-medium text-zinc-900 leading-tight mb-4">
        {event.title}
      </h1>

      {/* Lead */}
      <p className="text-lg text-zinc-600 leading-relaxed">
        {event.lead}
      </p>
    </header>
  );
}
