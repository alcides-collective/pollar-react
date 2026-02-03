import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAlerts, useAlertsStore } from '@/stores/alertsStore';
import { useFavoriteCategories, useFollowedMPIds } from '@/stores/userStore';
import { useEvents } from '@/stores/eventsStore';
import { useMPs } from '@/hooks/useMPs';
import {
  getHistoricalVotingAlerts,
  type HistoricalVotingAlert,
  type CombinedAlert,
} from '@/services/alertsService';

type FilterType = 'all' | 'voting' | 'category';
type VoteFilter = 'all' | 'yes' | 'no' | 'abstain' | 'absent';

function formatVote(vote: string): { text: string; color: string; bg: string } {
  switch (vote) {
    case 'yes':
      return { text: 'Za', color: 'text-green-700', bg: 'bg-green-100' };
    case 'no':
      return { text: 'Przeciw', color: 'text-red-700', bg: 'bg-red-100' };
    case 'abstain':
      return { text: 'Wstrzymał się', color: 'text-amber-700', bg: 'bg-amber-100' };
    case 'absent':
      return { text: 'Nieobecny', color: 'text-zinc-600', bg: 'bg-zinc-100' };
    default:
      return { text: vote, color: 'text-zinc-600', bg: 'bg-zinc-100' };
  }
}

function formatDate(dateStr: string | { seconds: number }): string {
  let date: Date;
  if (typeof dateStr === 'object' && 'seconds' in dateStr) {
    date = new Date(dateStr.seconds * 1000);
  } else {
    date = new Date(dateStr);
  }
  return date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsContent />
    </ProtectedRoute>
  );
}

function NotificationsContent() {
  const realAlerts = useAlerts();
  const fetchAlerts = useAlertsStore((s) => s.fetchAlerts);
  const markAsRead = useAlertsStore((s) => s.markAsRead);
  const markAllAsRead = useAlertsStore((s) => s.markAllAsRead);

  const favoriteCategories = useFavoriteCategories();
  const followedMPIds = useFollowedMPIds();
  const { events } = useEvents({ limit: 100, lang: 'pl' });
  const { mps } = useMPs();

  const [historicalAlerts, setHistoricalAlerts] = useState<HistoricalVotingAlert[]>([]);
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [voteFilter, setVoteFilter] = useState<VoteFilter>('all');
  const [mpFilter, setMpFilter] = useState<number | 'all'>('all');
  const [showHistorical, setShowHistorical] = useState(true);

  // Get followed MP names for filter dropdown
  const followedMPs = useMemo(() => {
    return mps.filter((mp) => followedMPIds.includes(mp.id));
  }, [mps, followedMPIds]);

  // Fetch real alerts and historical on mount
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    if (followedMPIds.length > 0) {
      setIsLoadingHistorical(true);
      getHistoricalVotingAlerts(30, 100)
        .then(setHistoricalAlerts)
        .catch(console.error)
        .finally(() => setIsLoadingHistorical(false));
    }
  }, [followedMPIds]);

  // Combine and filter alerts
  const combinedAlerts = useMemo(() => {
    const alerts: CombinedAlert[] = [];

    // Add real alerts (with isHistorical = false)
    for (const alert of realAlerts) {
      alerts.push({ ...alert, isHistorical: false });
    }

    // Add historical alerts (exclude duplicates)
    if (showHistorical) {
      const realAlertIds = new Set(realAlerts.map((a) => a.votingId + '-' + a.mpId));
      for (const alert of historicalAlerts) {
        const key = alert.votingId + '-' + alert.mpId;
        if (!realAlertIds.has(key)) {
          alerts.push(alert);
        }
      }
    }

    return alerts;
  }, [realAlerts, historicalAlerts, showHistorical]);

  // Apply filters
  const filteredAlerts = useMemo(() => {
    let result = combinedAlerts;

    // Filter by type
    if (filterType === 'voting') {
      result = result.filter((a) => 'mpId' in a);
    }

    // Filter by vote
    if (voteFilter !== 'all') {
      result = result.filter((a) => 'vote' in a && a.vote === voteFilter);
    }

    // Filter by MP
    if (mpFilter !== 'all') {
      result = result.filter((a) => 'mpId' in a && a.mpId === mpFilter);
    }

    // Sort by date (newest first)
    return result.sort((a, b) => {
      const dateA = 'createdAt' in a ? (a.createdAt as any)?.seconds || 0 : new Date(a.date).getTime() / 1000;
      const dateB = 'createdAt' in b ? (b.createdAt as any)?.seconds || 0 : new Date(b.date).getTime() / 1000;
      return dateB - dateA;
    });
  }, [combinedAlerts, filterType, voteFilter, mpFilter]);

  // Category-based event suggestions
  const categoryEvents = useMemo(() => {
    if (favoriteCategories.length === 0) return [];
    return events
      .filter((e) => favoriteCategories.includes(e.category))
      .slice(0, 10);
  }, [events, favoriteCategories]);

  const unreadCount = realAlerts.filter((a) => !a.read).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Powiadomienia</h1>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="text-sm text-zinc-500 hover:text-zinc-700"
          >
            Oznacz wszystkie jako przeczytane ({unreadCount})
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 p-4 bg-zinc-50 rounded-lg">
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Typ</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="text-sm border border-zinc-200 rounded px-2 py-1"
          >
            <option value="all">Wszystkie</option>
            <option value="voting">Głosowania</option>
            <option value="category">Kategorie</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-zinc-500 mb-1">Głos</label>
          <select
            value={voteFilter}
            onChange={(e) => setVoteFilter(e.target.value as VoteFilter)}
            className="text-sm border border-zinc-200 rounded px-2 py-1"
          >
            <option value="all">Wszystkie</option>
            <option value="yes">Za</option>
            <option value="no">Przeciw</option>
            <option value="abstain">Wstrzymał się</option>
            <option value="absent">Nieobecny</option>
          </select>
        </div>

        {followedMPs.length > 0 && (
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Poseł</label>
            <select
              value={mpFilter}
              onChange={(e) => setMpFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="text-sm border border-zinc-200 rounded px-2 py-1"
            >
              <option value="all">Wszyscy ({followedMPs.length})</option>
              {followedMPs.map((mp) => (
                <option key={mp.id} value={mp.id}>
                  {mp.firstLastName}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showHistorical}
              onChange={(e) => setShowHistorical(e.target.checked)}
              className="rounded"
            />
            <span className="text-zinc-600">Pokaż historyczne</span>
          </label>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-zinc-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-zinc-900">{followedMPIds.length}</div>
          <div className="text-xs text-zinc-500">Śledzonych posłów</div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-zinc-900">{favoriteCategories.length}</div>
          <div className="text-xs text-zinc-500">Ulubionych kategorii</div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-zinc-900">{filteredAlerts.length}</div>
          <div className="text-xs text-zinc-500">Powiadomień</div>
        </div>
      </div>

      {/* No preferences message */}
      {followedMPIds.length === 0 && favoriteCategories.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center mb-6">
          <i className="ri-notification-off-line text-3xl text-amber-500 mb-2" />
          <h3 className="font-medium text-zinc-900 mb-1">Brak ustawionych preferencji</h3>
          <p className="text-sm text-zinc-600 mb-4">
            Zacznij śledzić posłów lub dodaj ulubione kategorie, żeby otrzymywać powiadomienia.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/sejm/poslowie"
              className="text-sm px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800"
            >
              Przeglądaj posłów
            </Link>
            <Link
              to="/profil"
              className="text-sm px-4 py-2 border border-zinc-300 rounded-lg hover:bg-zinc-50"
            >
              Ustaw kategorie
            </Link>
          </div>
        </div>
      )}

      {/* Favorite categories events */}
      {filterType !== 'voting' && categoryEvents.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">
            Z Twoich ulubionych kategorii
          </h2>
          <div className="space-y-2">
            {categoryEvents.slice(0, 5).map((event) => (
              <Link
                key={event.id}
                to={`/event/${event.id}`}
                className="flex items-center gap-3 p-3 bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 transition-colors"
              >
                {event.imageUrl && (
                  <img
                    src={event.imageUrl}
                    alt=""
                    className="h-12 w-16 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
                      {event.category}
                    </span>
                  </div>
                  <h3 className="font-medium text-zinc-900 text-sm line-clamp-1">
                    {event.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Voting alerts list */}
      {filterType !== 'category' && (
        <section>
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">
            Głosowania śledzonych posłów
            {isLoadingHistorical && (
              <span className="ml-2 text-sm font-normal text-zinc-500">
                (ładowanie historycznych...)
              </span>
            )}
          </h2>

          {filteredAlerts.length === 0 ? (
            <div className="bg-zinc-50 rounded-lg p-6 text-center">
              <p className="text-zinc-500">Brak powiadomień o głosowaniach.</p>
              {followedMPIds.length === 0 && (
                <Link
                  to="/sejm/poslowie"
                  className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                >
                  Zacznij śledzić posłów
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAlerts.map((alert) => {
                const voteInfo = formatVote(alert.vote);
                const isHistorical = 'isHistorical' in alert && alert.isHistorical;
                const isUnread = !isHistorical && 'read' in alert && !alert.read;
                const dateStr = 'createdAt' in alert ? alert.createdAt : alert.date;

                return (
                  <Link
                    key={alert.id}
                    to={`/sejm/glosowania/${alert.sitting}/${alert.votingNumber}`}
                    className={`block p-4 rounded-lg border transition-colors ${
                      isUnread
                        ? 'bg-blue-50 border-blue-200 hover:border-blue-300'
                        : isHistorical
                        ? 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                        : 'bg-white border-zinc-200 hover:border-zinc-300'
                    }`}
                    onClick={() => {
                      if (!isHistorical && 'id' in alert) {
                        markAsRead(alert.id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-zinc-900">
                            {alert.mpName}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${voteInfo.bg} ${voteInfo.color}`}>
                            {voteInfo.text}
                          </span>
                          {isHistorical && (
                            <span className="text-xs px-2 py-0.5 bg-zinc-200 text-zinc-600 rounded">
                              Historyczne
                            </span>
                          )}
                          {isUnread && (
                            <span className="h-2 w-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-zinc-600 line-clamp-2">
                          {alert.votingTitle}
                        </p>
                      </div>
                      <div className="text-xs text-zinc-400 whitespace-nowrap">
                        {formatDate(dateStr as string)}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
