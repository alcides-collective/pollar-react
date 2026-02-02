import type { Event, KeyPoint, Article } from '../../../types/events';

interface EventDetailsPanelProps {
  event: Event | null;
  keyPointIndex: number;
  keyPoints: KeyPoint[];
  currentKeyPoint: KeyPoint | null;
  progress: number;
  selectedIndex: number;
  focused: boolean;
}

// Decode HTML entities and strip tags
function decodeHtml(html: string, stripTags = false): string {
  if (!html) return '';
  let result = html;
  if (stripTags) {
    result = result.replace(/<[^>]*>/g, '');
  }
  const txt = document.createElement('textarea');
  txt.innerHTML = result;
  return txt.value;
}

// Get display source - extract domain from URL if source is "Unknown"
function getDisplaySource(article: Article): string {
  const source = article.source || '';
  if (source.toLowerCase() === 'unknown' && article.url) {
    try {
      const url = new URL(article.url);
      return url.hostname.replace(/^www\./, '');
    } catch {
      return source;
    }
  }
  return source;
}

// Group articles by source
function groupArticlesBySource(articles: Article[]): { source: string; count: number; url: string }[] {
  const sourceMap = new Map<string, { count: number; url: string }>();

  for (const article of articles) {
    const source = getDisplaySource(article);
    const existing = sourceMap.get(source);

    if (!existing) {
      sourceMap.set(source, { count: 1, url: article.url });
    } else {
      existing.count++;
    }
  }

  return Array.from(sourceMap.entries()).map(([source, data]) => ({
    source,
    count: data.count,
    url: data.url
  }));
}

// Category translation (simplified)
function translateCategory(category: string): string {
  const translations: Record<string, string> = {
    'News': 'AKTUALNOSCI',
    'Politics': 'POLITYKA',
    'Business': 'BIZNES',
    'Economy': 'EKONOMIA',
    'Technology': 'TECHNOLOGIA',
    'Science': 'NAUKA',
    'Health': 'ZDROWIE',
    'Sports': 'SPORT',
    'Entertainment': 'ROZRYWKA',
    'World': 'SWIAT',
    'Poland': 'POLSKA',
    'Culture': 'KULTURA',
    'Society': 'SPOLECZENSTWO',
  };
  return translations[category] || category.toUpperCase();
}

export function EventDetailsPanel({
  event,
  keyPointIndex,
  keyPoints,
  currentKeyPoint,
  progress,
  selectedIndex,
  focused
}: EventDetailsPanelProps) {
  return (
    <div className={`panel details-panel ${focused ? 'focused' : ''}`}>
      <div className="panel-header">
        <span className="panel-title">SZCZEGOLY WYDARZENIA</span>
        <span className="panel-index">[{String(selectedIndex + 1).padStart(2, '0')}]</span>
      </div>

      <div className="event-progress-bar">
        <div className="event-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="details-content">
        {event ? (
          <div className="details-panels">
            {/* Panel 1: Event (Title + Lead) */}
            <div className="detail-panel panel-event">
              <div className="panel-header">
                <span className="panel-title">WYDARZENIE</span>
                <span className="panel-meta">
                  <span className="details-category">
                    {translateCategory(event.category || 'News')}
                  </span>
                </span>
              </div>
              <div className="panel-body">
                <h2 className="details-title">{decodeHtml(event.title)}</h2>
                {(event.lead || event.summary) && (
                  <p className="details-lead">
                    {decodeHtml(event.lead || event.summary || '', true)}
                  </p>
                )}
              </div>
            </div>

            {/* Panel 2: Key Points */}
            <div className="detail-panel panel-keypoints">
              <div className="panel-header">
                <span className="panel-title">KLUCZOWE PUNKTY</span>
                {keyPoints.length > 0 && (
                  <span className="keypoint-counter">
                    [{keyPointIndex + 1}/{keyPoints.length}]
                  </span>
                )}
              </div>
              <div className="panel-body">
                {currentKeyPoint ? (
                  <div className="keypoint-display">
                    <div className="keypoint-title">{currentKeyPoint.title}</div>
                    {currentKeyPoint.description && (
                      <div className="keypoint-content">
                        {decodeHtml(currentKeyPoint.description, true)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-data">---</div>
                )}
              </div>
            </div>

            {/* Panel 3: Sources */}
            <div className="detail-panel panel-sources">
              <div className="panel-header">
                <span className="panel-title">ZRODLA</span>
                <span className="panel-count">
                  {event.articles?.length || event.sources?.length || 0}
                </span>
              </div>
              <div className="panel-body">
                <div className="sources-grid">
                  {event.articles && event.articles.length > 0 ? (
                    groupArticlesBySource(event.articles).map(({ source, count, url }) => (
                      <a
                        key={source}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="source-link"
                      >
                        <span className="source-domain">
                          {source}{count > 1 ? ` (${count})` : ''}
                        </span>
                      </a>
                    ))
                  ) : event.sources && event.sources.length > 0 ? (
                    event.sources.map((source, i) => (
                      <div key={i} className="source-text">{source}</div>
                    ))
                  ) : (
                    <div className="no-data">---</div>
                  )}
                </div>
              </div>
            </div>

            {/* Panel 4: Statistics */}
            <div className="detail-panel panel-stats">
              <div className="panel-header">
                <span className="panel-title">STATYSTYKI</span>
              </div>
              <div className="panel-body">
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Artykuly</span>
                    <span className="stat-value">
                      {event.articleCount || event.articles?.length || 0}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Zrodla</span>
                    <span className="stat-value">
                      {event.sourceCount || event.metadata?.sourceCount || event.sources?.length || 0}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Wyswietlenia</span>
                    <span className="stat-value">
                      {event.viewCount || 0}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Key Points</span>
                    <span className="stat-value">
                      {keyPoints.length}
                    </span>
                  </div>
                  {event.metadata?.mentionedPeople?.length ? (
                    <div className="stat-item">
                      <span className="stat-label">Osoby</span>
                      <span className="stat-value">
                        {event.metadata.mentionedPeople.length}
                      </span>
                    </div>
                  ) : null}
                  {event.metadata?.mentionedCountries?.length ? (
                    <div className="stat-item">
                      <span className="stat-label">Kraje</span>
                      <span className="stat-value">
                        {event.metadata.mentionedCountries.length}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-event">---</div>
        )}
      </div>
    </div>
  );
}
