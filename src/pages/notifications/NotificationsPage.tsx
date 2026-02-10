import { useState, useEffect, useMemo } from 'react';
import { LocalizedLink } from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
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
import { useRouteLanguage } from '@/hooks/useRouteLanguage';
import { useTranslatedEventTitles } from '@/hooks/useTranslatedEventTitles';

type FilterType = 'all' | 'voting' | 'category';
type VoteFilter = 'all' | 'yes' | 'no' | 'abstain' | 'absent' | 'present';

// Normalize category key for translation lookup (lowercase, no diacritics)
function normalizeCategoryKey(category: string): string {
  return category
    ?.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/ł/g, 'l'); // Handle Polish ł
}

function formatVote(vote: string, t: (key: string) => string): { text: string; color: string; bg: string } {
  switch (vote) {
    case 'yes':
      return { text: t('voting.for'), color: 'text-green-700 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/40' };
    case 'no':
      return { text: t('voting.against'), color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/40' };
    case 'abstain':
      return { text: t('voting.abstained'), color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/40' };
    case 'absent':
      return { text: t('voting.absent'), color: 'text-content', bg: 'bg-surface' };
    case 'present':
      return { text: t('voting.present'), color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/40' };
    default:
      return { text: vote, color: 'text-content', bg: 'bg-surface' };
  }
}

function formatDate(dateStr: string | { seconds?: number; _seconds?: number }, locale: string, noDateText: string): string {
  let date: Date;
  if (typeof dateStr === 'object' && dateStr !== null) {
    const seconds = dateStr.seconds ?? dateStr._seconds;
    if (seconds !== undefined) {
      date = new Date(seconds * 1000);
    } else {
      return noDateText;
    }
  } else if (typeof dateStr === 'string' && dateStr) {
    date = new Date(dateStr);
  } else {
    return noDateText;
  }

  if (isNaN(date.getTime())) {
    return noDateText;
  }

  const localeMap: Record<string, string> = { pl: 'pl-PL', en: 'en-US', de: 'de-DE' };
  return date.toLocaleDateString(localeMap[locale] || 'pl-PL', {
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
  const { t } = useTranslation('notifications');
  const language = useRouteLanguage();
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

  // Collect eventIds from category alerts for translation
  const categoryEventIds = useMemo(() => {
    return allAlerts
      .filter((a): a is CombinedAlert & { alertType: 'category' } => a.alertType === 'category')
      .map(a => a.eventId);
  }, [allAlerts]);

  // Fetch translated titles for category alerts
  const { titles: translatedTitles } = useTranslatedEventTitles(categoryEventIds);

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
        <h1 className="text-2xl font-bold text-content-heading">{t('title')}</h1>
        {totalUnreadCount > 0 && (
          <button
            onClick={() => markAllAlertsAsRead()}
            className="text-sm text-content-subtle hover:text-content"
          >
            {t('markAllAsRead', { count: totalUnreadCount })}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 p-4 bg-surface rounded-lg">
        <div>
          <label className="block text-xs text-content-subtle mb-1">{t('filters.type')}</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="text-sm border border-divider rounded px-2 py-1"
          >
            <option value="all">{t('filters.all')}</option>
            <option value="voting">{t('filters.votings')}</option>
            <option value="category">{t('filters.categories')}</option>
          </select>
        </div>

        {filterType !== 'category' && (
          <div>
            <label className="block text-xs text-content-subtle mb-1">{t('filters.vote')}</label>
            <select
              value={voteFilter}
              onChange={(e) => setVoteFilter(e.target.value as VoteFilter)}
              className="text-sm border border-divider rounded px-2 py-1"
            >
              <option value="all">{t('filters.all')}</option>
              <option value="yes">{t('voting.for')}</option>
              <option value="no">{t('voting.against')}</option>
              <option value="abstain">{t('voting.abstained')}</option>
              <option value="absent">{t('voting.absent')}</option>
              <option value="present">{t('voting.present')}</option>
            </select>
          </div>
        )}

        {filterType !== 'category' && followedMPs.length > 0 && (
          <div>
            <label className="block text-xs text-content-subtle mb-1">{t('filters.mp')}</label>
            <select
              value={mpFilter}
              onChange={(e) => setMpFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="text-sm border border-divider rounded px-2 py-1"
            >
              <option value="all">{t('filters.allMPs', { count: followedMPs.length })}</option>
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
            <label className="block text-xs text-content-subtle mb-1">{t('filters.category')}</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-sm border border-divider rounded px-2 py-1"
            >
              <option value="all">{t('filters.allCategories', { count: favoriteCategories.length })}</option>
              {favoriteCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`categoryLabels.${cat}`, cat)}
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
              <span className="text-content">{t('filters.showHistorical')}</span>
            </label>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-surface-alt border border-divider rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-content-heading">{followedMPIds.length}</div>
          <div className="text-xs text-content-subtle">{t('stats.followedMPs')}</div>
        </div>
        <div className="bg-surface-alt border border-divider rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-content-heading">{favoriteCategories.length}</div>
          <div className="text-xs text-content-subtle">{t('stats.favoriteCategories')}</div>
        </div>
        <div className="bg-surface-alt border border-divider rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-content-heading">{filteredAlerts.length}</div>
          <div className="text-xs text-content-subtle">{t('stats.notifications')}</div>
        </div>
      </div>

      {/* No preferences message */}
      {followedMPIds.length === 0 && favoriteCategories.length === 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center mb-6">
          <i className="ri-notification-off-line text-3xl text-amber-500 mb-2" />
          <h3 className="font-medium text-content-heading mb-1">{t('noPreferences.title')}</h3>
          <p className="text-sm text-content mb-4">
            {t('noPreferences.description')}
          </p>
          <div className="flex gap-3 justify-center">
            <LocalizedLink
              to="/sejm/poslowie"
              className="text-sm px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              {t('noPreferences.browseMPs')}
            </LocalizedLink>
            <LocalizedLink
              to="/profil"
              className="text-sm px-4 py-2 border border-divider rounded-lg hover:bg-muted"
            >
              {t('noPreferences.setCategories')}
            </LocalizedLink>
          </div>
        </div>
      )}

      {/* Alerts list */}
      <section>
        <h2 className="text-lg font-semibold text-content-heading mb-4">
          {t('title')}
          {isLoadingHistorical && (
            <span className="ml-2 text-sm font-normal text-content-subtle">
              ({t('loadingHistorical')})
            </span>
          )}
        </h2>

        {filteredAlerts.length === 0 ? (
          <div className="bg-surface rounded-lg p-6 text-center">
            <p className="text-content-subtle">{t('noNotifications')}</p>
            {followedMPIds.length === 0 && favoriteCategories.length === 0 && (
              <p className="text-sm text-content-faint mt-2">
                {t('noPreferences.hint')}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAlerts.map((alert) => {
              if (alert.alertType === 'category') {
                // Category alert - use translated title if available
                const translated = translatedTitles[alert.eventId];
                const displayTitle = translated?.title || alert.eventTitle;
                const displayLead = translated?.lead || alert.eventLead;
                const categoryKey = normalizeCategoryKey(alert.category);
                const categoryLabel = t(`categoryLabels.${categoryKey}`, alert.category);
                const isUnread = !alert.read;

                return (
                  <LocalizedLink
                    key={`category-${alert.id}`}
                    to={`/event/${alert.eventId}`}
                    className={`block p-4 rounded-lg border transition-colors ${
                      isUnread
                        ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700'
                        : 'bg-surface-alt border-divider hover:border-divider'
                    }`}
                    onClick={() => handleAlertClick(alert)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded font-medium">
                            {categoryLabel}
                          </span>
                          {isUnread && (
                            <span className="h-2 w-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <p className="font-medium text-content-heading line-clamp-2">
                          {displayTitle}
                        </p>
                        {displayLead && (
                          <p className="text-sm text-content-subtle line-clamp-1 mt-1">
                            {displayLead}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-content-faint whitespace-nowrap">
                        {formatDate(alert.createdAt as any, language, t('noDate'))}
                      </div>
                    </div>
                  </LocalizedLink>
                );
              } else {
                // Voting alert (regular or historical)
                const votingAlert = alert as any;
                const voteInfo = formatVote(votingAlert.vote, t);
                const isHistorical = alert.alertType === 'historical';
                const isUnread = !isHistorical && !votingAlert.read;
                const dateStr = 'createdAt' in votingAlert ? votingAlert.createdAt : votingAlert.date;

                return (
                  <LocalizedLink
                    key={`voting-${alert.id}`}
                    to={`/sejm/glosowania/${votingAlert.sitting}/${votingAlert.votingNumber}`}
                    className={`block p-4 rounded-lg border transition-colors ${
                      isUnread
                        ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700'
                        : isHistorical
                        ? 'bg-surface border-divider hover:border-divider'
                        : 'bg-surface-alt border-divider hover:border-divider'
                    }`}
                    onClick={() => handleAlertClick(alert)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-content-heading">
                            {votingAlert.mpName}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${voteInfo.bg} ${voteInfo.color}`}>
                            {voteInfo.text}
                          </span>
                          {isHistorical && (
                            <span className="text-xs px-2 py-0.5 bg-divider text-content rounded">
                              {t('historical')}
                            </span>
                          )}
                          {isUnread && (
                            <span className="h-2 w-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-content line-clamp-2">
                          {votingAlert.votingTitle}
                        </p>
                      </div>
                      <div className="text-xs text-content-faint whitespace-nowrap">
                        {formatDate(dateStr, language, t('noDate'))}
                      </div>
                    </div>
                  </LocalizedLink>
                );
              }
            })}

            {/* Load more button for historical */}
            {showHistorical && hasMoreHistorical && filterType !== 'category' && (
              <button
                onClick={loadMoreHistorical}
                disabled={isLoadingHistorical}
                className="w-full mt-4 py-3 text-sm text-content hover:text-content-heading border border-divider rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingHistorical ? t('loading') : t('loadMore')}
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
