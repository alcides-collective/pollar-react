import { useTranslation } from 'react-i18next';
import type { Event } from '../../../types/events';

interface TrendingListProps {
  events: Event[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onNavigate: (event: Event) => void;
  focused: boolean;
}

// Decode HTML entities (without DOM innerHTML)
function decodeHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

// Format relative time
function formatRelativeTime(dateString: string | undefined): { text: string; freshness: 'green' | 'yellow' | 'none' } {
  if (!dateString) return { text: '-', freshness: 'none' };
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  let freshness: 'green' | 'yellow' | 'none' = 'none';
  if (diffMins < 30) freshness = 'green';
  else if (diffMins < 60) freshness = 'yellow';

  if (diffMins < 1) {
    const diffSecs = Math.floor(diffMs / 1000);
    return { text: `${diffSecs}s`, freshness };
  }
  if (diffMins < 60) return { text: `${diffMins}m`, freshness };
  if (diffHours < 24) return { text: `${diffHours}h`, freshness };
  return { text: `${diffDays}d`, freshness };
}

// Check if recently summarized
function isRecentlySummarized(dateString: string | undefined, minutes = 10): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  return diffMins < minutes;
}

// Normalize score
function normalize(value: number, max: number): number {
  if (max === 0) return 0;
  return (value / max) * 10;
}

// Get genealogy indicator for terminal display
function getGenealogyIndicator(event: Event): { symbol: string; color: string; title: string } | null {
  const g = event.metadata?.genealogy;
  if (!g) return null;

  const hasSplitInto = g.splitInto && g.splitInto.length > 0;
  const hasSplitFrom = !!g.splitFrom;
  const hasMergedFrom = g.mergedFrom && g.mergedFrom.length > 0;

  if (hasSplitInto && hasSplitFrom) return { symbol: '⇅', color: 'cyan', title: `Split from parent, then split into ${g.splitInto!.length} children` };
  if (hasSplitInto) return { symbol: '↓', color: 'yellow', title: `Split into ${g.splitInto!.length} sub-topics` };
  if (hasSplitFrom && hasMergedFrom) return { symbol: '⇄', color: 'magenta', title: `Split from parent + merged ${g.mergedFrom!.length} events` };
  if (hasSplitFrom) return { symbol: '↑', color: 'green', title: `Split from parent event` };
  if (hasMergedFrom) return { symbol: '⊕', color: 'blue', title: `Merged ${g.mergedFrom!.length} events` };

  return null;
}

export function TrendingList({
  events,
  selectedIndex,
  onSelect,
  onNavigate,
  focused
}: TrendingListProps) {
  const { t } = useTranslation('terminal');
  const maxScore = Math.max(...events.map(e => e.trendingScore || 0), 1);
  const recentlySummarizedCount = events.filter(e => isRecentlySummarized(e.lastSummarizationComplete)).length;

  return (
    <div className={`panel list-panel ${focused ? 'focused' : ''}`}>
      <div className="panel-header">
        <span className="panel-title">TRENDING</span>
        <span className="panel-count">{events.length}</span>
      </div>

      <div className="event-list">
        {/* Header row */}
        <div className="event-row header-row">
          <span className="event-marker"></span>
          <span className="event-index">#</span>
          <span className="event-category">{t('list.category').toUpperCase()}</span>
          <span className="event-city">{t('list.city').toUpperCase()}</span>
          <span className="event-title">
            {t('list.titleHeader').toUpperCase()} ({recentlySummarizedCount}/{events.length}) - {events.length > 0 ? Math.round(recentlySummarizedCount / events.length * 100) : 0}%
          </span>
          <span className="event-score">SCORE</span>
          <span className="event-time">UPD</span>
          <span className="event-time">SUM</span>
          <span className="event-count">#ART</span>
          <span className="event-count">#SRC</span>
          <span className="event-genealogy">GEN</span>
        </div>

        {/* Event rows */}
        {events.map((event, i) => {
          const eventCity = event.metadata?.locations?.[0]?.city || event.metadata?.location?.city || '';
          const eventScore = event.trendingScore || 0;
          const updateTime = formatRelativeTime(event.lastContentUpdate);
          const sumTime = formatRelativeTime(event.lastSummarizationComplete);
          const isRecent = isRecentlySummarized(event.lastSummarizationComplete);
          const category = event.category || 'News';

          return (
            <button
              key={event.id}
              className={`event-row ${selectedIndex === i ? 'selected' : ''}`}
              onClick={() => onSelect(i)}
              onDoubleClick={() => onNavigate(event)}
            >
              <span className="event-marker">{selectedIndex === i ? '>' : ' '}</span>
              <span className="event-index">{String(i + 1).padStart(2, '0')}</span>
              <span className="event-category">{t(`categories.${category}`, { defaultValue: category }).toUpperCase()}</span>
              <span className="event-city">{eventCity || '-'}</span>
              <span className={`event-title ${!eventCity ? 'no-city' : ''}`}>
                {isRecent && <span className="recent-dot" title={t('list.recentlyUpdated')} />}
                {decodeHtml(event.title)}
              </span>
              <span className="event-score">
                {normalize(eventScore, maxScore).toFixed(2).padStart(5, '0')}
              </span>
              <span className={`event-time ${updateTime.freshness}`} title="Content update">
                {updateTime.text}
              </span>
              <span className={`event-time ${sumTime.freshness}`} title="Summarization">
                {sumTime.text}
              </span>
              <span className="event-count">{event.articleCount || 0}</span>
              <span className={`event-count ${event.sourceCount === 3 ? 'source-three' : ''}`}>
                {event.sourceCount || 0}
              </span>
              <span className="event-genealogy">
                {(() => {
                  const gen = getGenealogyIndicator(event);
                  if (!gen) return <span className="dim">·</span>;
                  return <span className={`gen-${gen.color}`} title={gen.title}>{gen.symbol}</span>;
                })()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
