import type { Event } from '../../types/events';
import { EventMap } from './EventMap';
import { AudioPlayer } from './AudioPlayer';
import { extractKeyNumber, extractTimeline } from '../../utils/text';
import logoWhite from '../../assets/logo-white.png';

interface EventSidebarProps {
  event: Event;
}

function formatSourceDate(dateValue: string | { _seconds: number; _nanoseconds: number }): string {
  let date: Date;
  if (typeof dateValue === 'object' && '_seconds' in dateValue) {
    // Firestore Timestamp format
    date = new Date(dateValue._seconds * 1000);
  } else {
    date = new Date(dateValue);
  }

  if (isNaN(date.getTime())) {
    return '';
  }

  const dateStr = date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
  });
  const timeStr = date.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${dateStr}, ${timeStr}`;
}

export function EventSidebar({ event }: EventSidebarProps) {
  const articles = event.articles || [];
  const location = event.metadata?.location;

  // Extract special elements from summary for sidebar display
  const keyNumber = extractKeyNumber(event.summary);
  const timeline = extractTimeline(event.summary);

  // OG Image uses full title
  const ogTitle = event.title;

  return (
    <aside className="lg:sticky lg:top-6 space-y-6">
      {/* OG Image Preview (dev only) - rendered as React component */}
      {import.meta.env.DEV && (
        <div className="hidden lg:block px-6 lg:px-0">
          <div className="rounded-lg border border-dashed border-amber-400 bg-amber-50/50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <i className="ri-image-line text-amber-600" />
              <span className="text-xs font-medium text-amber-700 uppercase tracking-wider">
                og:image preview
              </span>
            </div>
            {/* Simulated OG Image - same styles as api/og.tsx */}
            <div
              className="w-full rounded border border-amber-200 overflow-hidden"
              style={{ aspectRatio: '1200/630' }}
            >
              <div
                style={{
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#09090b',
                  padding: '16px',
                  position: 'relative',
                }}
              >
                {/* Type label */}
                <div
                  style={{
                    fontSize: '8px',
                    color: '#a1a1aa',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  Wydarzenie
                </div>
                {/* Title */}
                <div
                  style={{
                    fontSize: ogTitle.length > 100 ? '10px' : ogTitle.length > 80 ? '12px' : ogTitle.length > 50 ? '14px' : '16px',
                    fontWeight: 600,
                    color: '#fafafa',
                    lineHeight: 1.2,
                    flex: 1,
                    overflow: 'hidden',
                  }}
                >
                  {ogTitle}
                </div>
                {/* Logo */}
                <img
                  src={logoWhite}
                  alt=""
                  style={{
                    position: 'absolute',
                    bottom: '26px',
                    right: '22px',
                    height: '20px',
                    width: 'auto',
                    opacity: 0.8,
                  }}
                />
              </div>
            </div>
            <p className="text-[10px] text-amber-600 mt-2 font-mono">
              /api/og?title={encodeURIComponent(ogTitle)}&type=event
            </p>
          </div>
        </div>
      )}

      {/* Map */}
      {location && (
        <div className="px-6 lg:px-0">
          <EventMap location={location} />
        </div>
      )}

      {/* Audio player - desktop only */}
      {event.audioUrl && (
        <div className="hidden lg:block px-6 lg:px-0">
          <AudioPlayer audioUrl={event.audioUrl} fullWidth />
        </div>
      )}

      {/* Key Number (desktop only) */}
      {keyNumber && (
        <div className="hidden lg:block px-6 lg:px-0">
          <div className="key-number-sidebar">
            <span className="key-number-sidebar-value">{keyNumber.value}</span>
            <span className="key-number-sidebar-desc">{keyNumber.description}</span>
          </div>
        </div>
      )}

      {/* Timeline (desktop only) */}
      {timeline && (
        <div className="hidden lg:block px-6 lg:px-0">
          <div className="timeline-sidebar">
            <div className="timeline-sidebar-title">{timeline.title}</div>
            <div className="timeline-sidebar-events">
              <div className="timeline-sidebar-line" />
              {timeline.events.map((timelineEvent, i) => (
                <div key={i} className="timeline-sidebar-event">
                  <div className="timeline-sidebar-dot" />
                  <div className="timeline-sidebar-content">
                    {timelineEvent.data && (
                      <div className="timeline-sidebar-date">{timelineEvent.data}</div>
                    )}
                    {timelineEvent.tytul && (
                      <div className="timeline-sidebar-event-title">{timelineEvent.tytul}</div>
                    )}
                    {timelineEvent.opis && (
                      <div className="timeline-sidebar-event-desc">{timelineEvent.opis}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mentioned People */}
      {event.metadata?.mentionedPeople?.length > 0 && (
        <div className="px-6 lg:px-0">
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-3">
            Wspomniane osoby
          </h3>
          <ul className="space-y-2">
            {event.metadata.mentionedPeople.map((person, index) => (
              <li key={index}>
                {person.wikipediaUrl ? (
                  <a
                    href={person.wikipediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-sm text-zinc-900 font-medium">
                      <i className="ri-user-line text-zinc-400" />
                      <span>{person.name}</span>
                      <i className="ri-external-link-line text-zinc-300 text-xs ml-auto" />
                    </div>
                    {person.context && (
                      <p className="text-xs text-zinc-500 mt-1 ml-6 line-clamp-2">
                        {person.context}
                      </p>
                    )}
                  </a>
                ) : (
                  <div className="block p-3 rounded-lg border border-zinc-200">
                    <div className="flex items-center gap-2 text-sm text-zinc-900 font-medium">
                      <i className="ri-user-line text-zinc-400" />
                      <span>{person.name}</span>
                    </div>
                    {person.context && (
                      <p className="text-xs text-zinc-500 mt-1 ml-6 line-clamp-2">
                        {person.context}
                      </p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sources */}
      {articles.length > 0 && (
        <div className="px-6 lg:px-0">
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-3">
            Źródła ({articles.length})
          </h3>
          <ul className="space-y-2">
            {articles.slice(0, 10).map((article) => (
              <li key={article.id}>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {article.imageUrl && (
                      <img
                        src={article.imageUrl}
                        alt=""
                        className="w-16 h-12 object-cover rounded shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-zinc-900 font-medium line-clamp-2 mb-1">
                        {article.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span>{article.source}</span>
                        <span>•</span>
                        <span>{formatSourceDate(article.publishDate)}</span>
                      </div>
                    </div>
                    <i className="ri-external-link-line text-zinc-400 shrink-0" />
                  </div>
                </a>
              </li>
            ))}
          </ul>
          {articles.length > 10 && (
            <p className="text-xs text-zinc-500 mt-3 text-center">
              + {articles.length - 10} więcej źródeł
            </p>
          )}
        </div>
      )}
    </aside>
  );
}
