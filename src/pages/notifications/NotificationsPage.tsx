import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  useAlertsStore,
  useCombinedAlerts,
  useTotalUnreadCount,
  type CombinedAlert,
} from '@/stores/alertsStore';
import { useFavoriteCategories, useFollowedMPIds } from '@/stores/userStore';
import { useMPs } from '@/hooks/useMPs';
import {
  getHistoricalVotingAlerts,
  type HistoricalVotingAlert,
} from '@/services/alertsService';

type FilterType = 'all' | 'voting' | 'category';
type VoteFilter = 'all' | 'yes' | 'no' | 'abstain' | 'absent';

const CATEGORY_LABELS: Record<string, string> = {
  polityka: 'Polityka',
  swiat: 'Świat',
  gospodarka: 'Gospodarka',
  spoleczenstwo: 'Społeczeństwo',
  nauka: 'Nauka',
  sport: 'Sport',
  kultura: 'Kultura',
  technologia: 'Technologia',
  inne: 'Inne',
};

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

function formatDate(dateStr: string | { seconds?: number; _seconds?: number }): string {
  let date: Date;
  if (typeof dateStr === 'object' && dateStr !== null) {
    // Handle Firestore Timestamp (can be { seconds } or { _seconds })
    const seconds = dateStr.seconds ?? dateStr._seconds;
    if (seconds !== undefined) {
      date = new Date(seconds * 1000);
    } else {
      return 'Brak daty';
    }
  } else if (typeof dateStr === 'string' && dateStr) {
    date = new Date(dateStr);
  } else {
    return 'Brak daty';
  }

  if (isNaN(date.getTime())) {
    return 'Brak daty';
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
  const combinedAlerts = useCombinedAlerts();
  const totalUnreadCount = useTotalUnreadCount();

  const fetchAllAlerts = useAlertsStore((s) => s.fetchAllAlerts);
  const markVotingAlertAsRead = useAlertsStore((s) => s.markVotingAlertAsRead);
  const markCategoryAlertAsRead = useAlertsStore((s) => s.markCategoryAlertAsRead);
  const markAllAlertsAsRead = useAlertsStore((s) => s.markAllAlertsAsRead);

  const favoriteCategories = useFavoriteCategories();
  const followedMPIds = useFollowedMPIds();
  const { mps } = useMPs();

  const [historicalAlerts, setHistoricalAlerts] = useState<HistoricalVotingAlert[]>([]);
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false);
  const [historicalOffset, setHistoricalOffset] = useState(0);
  const [hasMoreHistorical, setHasMoreHistorical] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [voteFilter, setVoteFilter] = useState<VoteFilter>('all');
  const [mpFilter, setMpFilter] = useState<number | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');
  const [showHistorical, setShowHistorical] = useState(true);

  // Get followed MP names for filter dropdown
  const followedMPs = useMemo(() => {
    return mps.filter((mp) => followedMPIds.includes(mp.id));
  }, [mps, followedMPIds]);

  // Fetch alerts on mount
  useEffect(() => {
    fetchAllAlerts();
  }, [fetchAllAlerts]);

  // Fetch historical voting alerts
  useEffect(() => {
    if (followedMPIds.length > 0) {
      setIsLoadingHistorical(true);
      setHistoricalAlerts([]);
      setHistoricalOffset(0);
      getHistoricalVotingAlerts(30, 10, 0)
        .then(({ alerts, hasMore }) => {
          setHistoricalAlerts(alerts);
          setHasMoreHistorical(hasMore);
          setHistoricalOffset(10);
        })
        .catch(console.error)
        .finally(() => setIsLoadingHistorical(false));
    }
  }, [followedMPIds]);

  const loadMoreHistorical = async () => {
    setIsLoadingHistorical(true);
    try {
      const { alerts, hasMore } = await getHistoricalVotingAlerts(30, 10, historicalOffset);
      setHistoricalAlerts((prev) => [...prev, ...alerts]);
      setHasMoreHistorical(hasMore);
      setHistoricalOffset((prev) => prev + 10);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingHistorical(false);
    }
  };

  // Combine real alerts with historical
  type DisplayAlert =
    | CombinedAlert
    | (HistoricalVotingAlert & { alertType: 'historical' });

  const allAlerts = useMemo(() => {
    const alerts: DisplayAlert[] = [...combinedAlerts];

    // Add historical alerts (exclude duplicates)
    if (showHistorical) {
      const votingAlertIds = new Set(
        combinedAlerts
          .filter((a) => a.alertType === 'voting')
          .map((a) => (a as any).votingId + '-' + (a as any).mpId)
      );

      for (const alert of historicalAlerts) {
        const key = alert.votingId + '-' + alert.mpId;
        if (!votingAlertIds.has(key)) {
          alerts.push({ ...alert, alertType: 'historical' });
        }
      }
    }

    return alerts;
  }, [combinedAlerts, historicalAlerts, showHistorical]);

  // Apply filters
  const filteredAlerts = useMemo(() => {
    let result = allAlerts;

    // Filter by type
    if (filterType === 'voting') {
      result = result.filter((a) => a.alertType === 'voting' || a.alertType === 'historical');
    } else if (filterType === 'category') {
      result = result.filter((a) => a.alertType === 'category');
    }

    // Filter by vote (only for voting alerts)
    if (voteFilter !== 'all') {
      result = result.filter((a) => {
        if (a.alertType === 'voting' || a.alertType === 'historical') {
          return (a as any).vote === voteFilter;
        }
        return true;
      });
    }

    // Filter by MP (only for voting alerts)
    if (mpFilter !== 'all') {
      result = result.filter((a) => {
        if (a.alertType === 'voting' || a.alertType === 'historical') {
          return (a as any).mpId === mpFilter;
        }
        return true;
      });
    }

    // Filter by category (only for category alerts)
    if (categoryFilter !== 'all') {
      result = result.filter((a) => {
        if (a.alertType === 'category') {
          return (a as any).category === categoryFilter;
        }
        return true;
      });
    }

    // Sort by date (newest first)
    return result.sort((a, b) => {
      const getTimestamp = (alert: DisplayAlert): number => {
        if ('createdAt' in alert && alert.createdAt) {
          const createdAt = alert.createdAt as any;
          if (typeof createdAt === 'object' && 'seconds' in createdAt) {
            return createdAt.seconds;
          }
          if (createdAt.toDate) {
            return createdAt.toDate().getTime() / 1000;
          }
        }
        if ('date' in alert) {
          return new Date((alert as any).date).getTime() / 1000;
        }
        return 0;
      };
      return getTimestamp(b) - getTimestamp(a);
    });
  }, [allAlerts, filterType, voteFilter, mpFilter, categoryFilter]);

  const handleAlertClick = (alert: DisplayAlert) => {
    if (alert.alertType === 'voting') {
      markVotingAlertAsRead(alert.id);
    } else if (alert.alertType === 'category') {
      markCategoryAlertAsRead(alert.id);
    }
    // Historical alerts don't need to be marked as read
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Powiadomienia</h1>
        {totalUnreadCount > 0 && (
          <button
            onClick={() => markAllAlertsAsRead()}
            className="text-sm text-zinc-500 hover:text-zinc-700"
          >
            Oznacz wszystkie jako przeczytane ({totalUnreadCount})
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

        {filterType !== 'category' && (
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
        )}

        {filterType !== 'category' && followedMPs.length > 0 && (
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

        {filterType !== 'voting' && favoriteCategories.length > 0 && (
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Kategoria</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-sm border border-zinc-200 rounded px-2 py-1"
            >
              <option value="all">Wszystkie ({favoriteCategories.length})</option>
              {favoriteCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat] || cat}
                </option>
              ))}
            </select>
          </div>
        )}

        {filterType !== 'category' && (
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
        )}
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

      {/* Alerts list */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Powiadomienia
          {isLoadingHistorical && (
            <span className="ml-2 text-sm font-normal text-zinc-500">
              (ładowanie historycznych...)
            </span>
          )}
        </h2>

        {filteredAlerts.length === 0 ? (
          <div className="bg-zinc-50 rounded-lg p-6 text-center">
            <p className="text-zinc-500">Brak powiadomień.</p>
            {followedMPIds.length === 0 && favoriteCategories.length === 0 && (
              <p className="text-sm text-zinc-400 mt-2">
                Dodaj ulubione kategorie lub zacznij śledzić posłów
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAlerts.map((alert) => {
              if (alert.alertType === 'category') {
                // Category alert
                const categoryLabel = CATEGORY_LABELS[alert.category] || alert.category;
                const isUnread = !alert.read;

                return (
                  <Link
                    key={`category-${alert.id}`}
                    to={`/event/${alert.eventId}`}
                    className={`block p-4 rounded-lg border transition-colors ${
                      isUnread
                        ? 'bg-blue-50 border-blue-200 hover:border-blue-300'
                        : 'bg-white border-zinc-200 hover:border-zinc-300'
                    }`}
                    onClick={() => handleAlertClick(alert)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">
                            {categoryLabel}
                          </span>
                          {isUnread && (
                            <span className="h-2 w-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <p className="font-medium text-zinc-900 line-clamp-2">
                          {alert.eventTitle}
                        </p>
                        {alert.eventLead && (
                          <p className="text-sm text-zinc-500 line-clamp-1 mt-1">
                            {alert.eventLead}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 whitespace-nowrap">
                        {formatDate(alert.createdAt as any)}
                      </div>
                    </div>
                  </Link>
                );
              } else {
                // Voting alert (regular or historical)
                const votingAlert = alert as any;
                const voteInfo = formatVote(votingAlert.vote);
                const isHistorical = alert.alertType === 'historical';
                const isUnread = !isHistorical && !votingAlert.read;
                const dateStr = 'createdAt' in votingAlert ? votingAlert.createdAt : votingAlert.date;

                return (
                  <Link
                    key={`voting-${alert.id}`}
                    to={`/sejm/glosowania/${votingAlert.sitting}/${votingAlert.votingNumber}`}
                    className={`block p-4 rounded-lg border transition-colors ${
                      isUnread
                        ? 'bg-blue-50 border-blue-200 hover:border-blue-300'
                        : isHistorical
                        ? 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                        : 'bg-white border-zinc-200 hover:border-zinc-300'
                    }`}
                    onClick={() => handleAlertClick(alert)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-zinc-900">
                            {votingAlert.mpName}
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
                          {votingAlert.votingTitle}
                        </p>
                      </div>
                      <div className="text-xs text-zinc-400 whitespace-nowrap">
                        {formatDate(dateStr)}
                      </div>
                    </div>
                  </Link>
                );
              }
            })}

            {/* Load more button for historical */}
            {showHistorical && hasMoreHistorical && filterType !== 'category' && (
              <button
                onClick={loadMoreHistorical}
                disabled={isLoadingHistorical}
                className="w-full mt-4 py-3 text-sm text-zinc-600 hover:text-zinc-900 border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingHistorical ? 'Ładowanie...' : 'Załaduj więcej historycznych'}
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
