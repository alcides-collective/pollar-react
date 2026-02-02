import type { Event, Article } from '../../types/events';
import { EventMap } from './EventMap';

interface EventSidebarProps {
  event: Event;
}

function formatSourceDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
  });
}

export function EventSidebar({ event }: EventSidebarProps) {
  const articles = event.articles || [];
  const imageUrl = event.imageUrl || articles.find(a => a.imageUrl)?.imageUrl;
  const location = event.metadata?.location;

  return (
    <aside className="lg:sticky lg:top-6 space-y-6">
      {/* Map */}
      {location && (
        <div className="px-6 lg:px-0">
          <EventMap location={location} />
        </div>
      )}

      {/* Image */}
      {imageUrl && (
        <div className="px-6 lg:px-0">
          <div className="rounded-lg overflow-hidden bg-zinc-100">
            <img
              src={imageUrl}
              alt={event.title}
              className="w-full h-auto object-cover"
            />
          </div>
          {event.metadata?.imageAttribution && (
            <p className="text-xs text-zinc-400 mt-2">
              {event.metadata.imageAttribution}
            </p>
          )}
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
                    className="flex items-center gap-2 text-sm text-zinc-700 hover:text-zinc-900"
                  >
                    <i className="ri-user-line text-zinc-400" />
                    <span>{person.name}</span>
                    <i className="ri-external-link-line text-zinc-300 text-xs" />
                  </a>
                ) : (
                  <span className="flex items-center gap-2 text-sm text-zinc-700">
                    <i className="ri-user-line text-zinc-400" />
                    {person.name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
