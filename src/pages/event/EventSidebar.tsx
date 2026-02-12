import { useTranslation } from 'react-i18next';
import type { Event } from '../../types/events';
import { EventMap } from './EventMap';
import { AudioPlayer } from './AudioPlayer';
import { extractKeyNumber, extractTimeline } from '../../utils/text';
import { useRouteLanguage } from '../../hooks/useRouteLanguage';
import { useUser } from '../../stores/authStore';
import { trackSourceClicked } from '../../lib/analytics';
import { incrementSourcesClicked } from '../../hooks/useSessionTracking';
import { useMPLookup } from '../../hooks/useMPLookup';
import { mpPath } from '../../utils/slug';
import { LocalizedLink } from '../../components/LocalizedLink';

interface EventSidebarProps {
  event: Event;
  wikipediaImages: Record<string, string>;
}

function formatSourceDate(dateValue: string | { _seconds: number; _nanoseconds: number }, language: string): string {
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

  const localeMap: Record<string, string> = { pl: 'pl-PL', en: 'en-US', de: 'de-DE' };
  const locale = localeMap[language] || 'pl-PL';

  const dateStr = date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
  });
  const timeStr = date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${dateStr}, ${timeStr}`;
}

export function EventSidebar({ event, wikipediaImages }: EventSidebarProps) {
  const { t } = useTranslation('event');
  const language = useRouteLanguage();
  const user = useUser();
  const { findMP } = useMPLookup();
  const articles = event.articles || [];
  const location = event.metadata?.location;

  // Extract special elements from summary for sidebar display
  const keyNumber = extractKeyNumber(event.summary);
  const timeline = extractTimeline(event.summary);

  return (
    <aside className="lg:sticky lg:top-6 space-y-6">
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
          <h3 className="text-xs font-medium uppercase tracking-wider text-content-subtle mb-3">
            {t('sidebar.mentionedPeople')}
          </h3>
          <ul className="space-y-2">
            {event.metadata.mentionedPeople.map((person, index) => {
              const matchedMP = findMP(person.name);
              const imageUrl = matchedMP?.photoMiniUrl || wikipediaImages[person.name];
              const initials = person.name.split(' ').map(n => n[0]).join('').toUpperCase();
              const content = (
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 bg-surface border border-divider flex items-center justify-center text-xs font-mono text-content-subtle overflow-hidden shrink-0 rounded-sm">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={person.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center min-h-[3.5rem]">
                    <div className="flex items-center gap-1.5 text-sm text-content-heading font-medium">
                      <span>{person.name}</span>
                      {!matchedMP && person.wikipediaUrl && (
                        <i className="ri-external-link-line text-content-faint text-xs" />
                      )}
                    </div>
                    {person.context && (
                      <p className="text-xs text-content-subtle mt-0.5 line-clamp-2">
                        {person.context}
                      </p>
                    )}
                  </div>
                </div>
              );

              return (
                <li key={index}>
                  {matchedMP ? (
                    <LocalizedLink
                      to={mpPath(matchedMP)}
                      className="block p-3 rounded-lg border border-divider hover:border-divider hover:bg-surface transition-colors"
                    >
                      {content}
                    </LocalizedLink>
                  ) : person.wikipediaUrl ? (
                    <a
                      href={person.wikipediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-lg border border-divider hover:border-divider hover:bg-surface transition-colors"
                    >
                      {content}
                    </a>
                  ) : (
                    <div className="block p-3 rounded-lg border border-divider">
                      {content}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Sources */}
      {articles.length > 0 && (
        <div className="px-6 lg:px-0">
          <h3 className="text-xs font-medium uppercase tracking-wider text-content-subtle mb-3">
            {t('sidebar.sources', { count: articles.length })}
          </h3>
          <ul className="space-y-2">
            {articles.slice(0, 10).map((article, index) => (
              <li key={article.id}>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    trackSourceClicked({
                      event_id: event.id,
                      source_name: article.source,
                      position: index,
                    });
                    if (user) {
                      incrementSourcesClicked();
                    }
                  }}
                  className="block p-3 rounded-lg border border-divider hover:border-divider hover:bg-surface transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-content-heading font-medium line-clamp-2 mb-1">
                        {article.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-content-subtle">
                        <span>{article.source}</span>
                        <span>•</span>
                        <span>{formatSourceDate(article.publishDate, language)}</span>
                      </div>
                    </div>
                    <i className="ri-external-link-line text-content-faint shrink-0" />
                  </div>
                </a>
              </li>
            ))}
          </ul>
          {articles.length > 10 && (
            <p className="text-xs text-content-subtle mt-3 text-center">
              {t('sidebar.moreSources', { count: articles.length - 10 })}
            </p>
          )}
        </div>
      )}
    </aside>
  );
}
