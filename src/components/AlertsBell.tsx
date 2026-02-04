import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LocalizedLink } from './LocalizedLink';
import { useIsAuthenticated } from '@/stores/authStore';
import {
  useAlertsStore,
  useTotalUnreadCount,
  useCombinedAlerts,
  type CombinedAlert,
} from '@/stores/alertsStore';
import { useTranslatedEventTitles } from '@/hooks/useTranslatedEventTitles';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell } from 'lucide-react';

function VotingAlertItem({ alert, onMarkAsRead }: { alert: CombinedAlert & { alertType: 'voting' }; onMarkAsRead: () => void }) {
  const { t } = useTranslation('notifications');

  const formatVote = (vote: string): { text: string; color: string } => {
    switch (vote) {
      case 'yes':
        return { text: t('voting.for'), color: 'text-green-400' };
      case 'no':
        return { text: t('voting.against'), color: 'text-red-400' };
      case 'abstain':
        return { text: t('voting.abstained'), color: 'text-amber-400' };
      case 'absent':
        return { text: t('voting.absent'), color: 'text-zinc-500' };
      default:
        return { text: vote, color: 'text-zinc-400' };
    }
  };

  const voteInfo = formatVote(alert.vote);

  return (
    <DropdownMenuItem
      asChild
      className={`py-2 cursor-pointer ${!alert.read ? 'bg-blue-500/20' : ''}`}
      onClick={onMarkAsRead}
    >
      <LocalizedLink to={`/sejm/glosowania/${alert.sitting}/${alert.votingNumber}`}>
        <div className="flex items-start gap-1.5 w-full">
          <p className="text-xs text-zinc-300 line-clamp-2 flex-1">
            <span className="inline-flex items-baseline gap-1 mr-1 text-xs font-medium">
              <span className="text-white">{alert.mpName}</span>
              <span className={voteInfo.color}>{voteInfo.text}</span>
            </span>
            {alert.votingTitle}
          </p>
          {!alert.read && (
            <span className="shrink-0 h-1.5 w-1.5 bg-blue-400 rounded-full mt-1" />
          )}
        </div>
      </LocalizedLink>
    </DropdownMenuItem>
  );
}

// Normalize category key for translation lookup (lowercase, no diacritics)
function normalizeCategoryKey(category: string): string {
  return category
    ?.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/ł/g, 'l'); // Handle Polish ł
}

function CategoryAlertItem({
  alert,
  onMarkAsRead,
  translatedTitle,
}: {
  alert: CombinedAlert & { alertType: 'category' };
  onMarkAsRead: () => void;
  translatedTitle?: string;
}) {
  const { t } = useTranslation('notifications');
  const categoryKey = normalizeCategoryKey(alert.category);
  const categoryLabel = t(`categoryLabels.${categoryKey}`, alert.category);
  const displayTitle = translatedTitle || alert.eventTitle;

  return (
    <DropdownMenuItem
      asChild
      className={`py-2 cursor-pointer ${!alert.read ? 'bg-blue-500/20' : ''}`}
      onClick={onMarkAsRead}
    >
      <LocalizedLink to={`/event/${alert.eventId}`}>
        <div className="flex items-start gap-1.5 w-full">
          <p className="text-xs text-zinc-200 line-clamp-2 flex-1">
            <span className="inline text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded font-medium mr-1">
              {categoryLabel}
            </span>
            {displayTitle}
          </p>
          {!alert.read && (
            <span className="shrink-0 h-1.5 w-1.5 bg-blue-400 rounded-full mt-1" />
          )}
        </div>
      </LocalizedLink>
    </DropdownMenuItem>
  );
}

export function AlertsBell() {
  const { t } = useTranslation('notifications');
  const isAuthenticated = useIsAuthenticated();
  const totalUnreadCount = useTotalUnreadCount();
  const combinedAlerts = useCombinedAlerts();

  const [isOpen, setIsOpen] = useState(false);

  // Collect eventIds from category alerts for translation
  const categoryEventIds = useMemo(() => {
    return combinedAlerts
      .filter((a): a is CombinedAlert & { alertType: 'category' } => a.alertType === 'category')
      .slice(0, 10)
      .map(a => a.eventId);
  }, [combinedAlerts]);

  // Fetch translated titles for category alerts
  const { titles: translatedTitles } = useTranslatedEventTitles(categoryEventIds);

  // Start polling when authenticated - use getState() to avoid dependency issues
  useEffect(() => {
    const { startPolling, stopPolling } = useAlertsStore.getState();

    if (isAuthenticated) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [isAuthenticated]);

  // Fetch full alerts when dropdown opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && isAuthenticated) {
      useAlertsStore.getState().fetchAllAlerts();
    }
  };

  const handleMarkVotingAlertAsRead = (alertId: string) => {
    useAlertsStore.getState().markVotingAlertAsRead(alertId);
  };

  const handleMarkCategoryAlertAsRead = (alertId: string) => {
    useAlertsStore.getState().markCategoryAlertAsRead(alertId);
  };

  const handleMarkAllAsRead = () => {
    useAlertsStore.getState().markAllAlertsAsRead();
  };

  if (!isAuthenticated) {
    return null;
  }

  const displayAlerts = combinedAlerts.slice(0, 10);

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button className="relative h-9 w-9 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg border border-zinc-700/50 hover:border-zinc-600 transition-colors">
          <Bell className="h-5 w-5" />
          {totalUnreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="text-zinc-300">{t('title')}</span>
          {totalUnreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {t('markAsRead')}
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {displayAlerts.length === 0 ? (
          <div className="px-2 py-4 text-center">
            <p className="text-sm text-zinc-400 mb-2">{t('noNew')}</p>
            <LocalizedLink
              to="/powiadomienia"
              className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
            >
              {t('viewHistory')}
            </LocalizedLink>
          </div>
        ) : (
          <>
            {displayAlerts.map((alert) => {
              if (alert.alertType === 'voting') {
                return (
                  <VotingAlertItem
                    key={`voting-${alert.id}`}
                    alert={alert}
                    onMarkAsRead={() => handleMarkVotingAlertAsRead(alert.id)}
                  />
                );
              } else {
                return (
                  <CategoryAlertItem
                    key={`category-${alert.id}`}
                    alert={alert}
                    onMarkAsRead={() => handleMarkCategoryAlertAsRead(alert.id)}
                    translatedTitle={translatedTitles[alert.eventId]?.title}
                  />
                );
              }
            })}

            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="justify-center">
              <LocalizedLink
                to="/powiadomienia"
                className="text-sm text-zinc-400 hover:text-white"
              >
                {t('viewAll')}
              </LocalizedLink>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
