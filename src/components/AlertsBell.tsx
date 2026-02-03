import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useIsAuthenticated } from '@/stores/authStore';
import {
  useAlertsStore,
  useTotalUnreadCount,
  useCombinedAlerts,
  type CombinedAlert,
} from '@/stores/alertsStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell } from 'lucide-react';

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

function formatVote(vote: string): { text: string; color: string } {
  switch (vote) {
    case 'yes':
      return { text: 'Za', color: 'text-green-600' };
    case 'no':
      return { text: 'Przeciw', color: 'text-red-600' };
    case 'abstain':
      return { text: 'Wstrzymał się', color: 'text-amber-600' };
    case 'absent':
      return { text: 'Nieobecny', color: 'text-zinc-500' };
    default:
      return { text: vote, color: 'text-zinc-600' };
  }
}

function VotingAlertItem({ alert, onMarkAsRead }: { alert: CombinedAlert & { alertType: 'voting' }; onMarkAsRead: () => void }) {
  const voteInfo = formatVote(alert.vote);

  return (
    <DropdownMenuItem
      asChild
      className={`flex flex-col items-start gap-1 py-3 cursor-pointer ${
        !alert.read ? 'bg-blue-50' : ''
      }`}
      onClick={onMarkAsRead}
    >
      <Link to={`/sejm/glosowania/${alert.sitting}/${alert.votingNumber}`}>
        <div className="flex items-center gap-2 w-full">
          <span className="font-medium text-sm text-zinc-900 truncate">
            {alert.mpName}
          </span>
          <span className={`text-xs font-medium ${voteInfo.color}`}>
            {voteInfo.text}
          </span>
          {!alert.read && (
            <span className="ml-auto h-2 w-2 bg-blue-500 rounded-full" />
          )}
        </div>
        <p className="text-xs text-zinc-500 line-clamp-2 w-full">
          {alert.votingTitle}
        </p>
      </Link>
    </DropdownMenuItem>
  );
}

function CategoryAlertItem({ alert, onMarkAsRead }: { alert: CombinedAlert & { alertType: 'category' }; onMarkAsRead: () => void }) {
  const categoryLabel = CATEGORY_LABELS[alert.category] || alert.category;

  return (
    <DropdownMenuItem
      asChild
      className={`flex flex-col items-start gap-1 py-3 cursor-pointer ${
        !alert.read ? 'bg-blue-50' : ''
      }`}
      onClick={onMarkAsRead}
    >
      <Link to={`/event/${alert.eventId}`}>
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">
            {categoryLabel}
          </span>
          {!alert.read && (
            <span className="ml-auto h-2 w-2 bg-blue-500 rounded-full" />
          )}
        </div>
        <p className="text-sm font-medium text-zinc-900 line-clamp-2 w-full">
          {alert.eventTitle}
        </p>
      </Link>
    </DropdownMenuItem>
  );
}

export function AlertsBell() {
  const isAuthenticated = useIsAuthenticated();
  const totalUnreadCount = useTotalUnreadCount();
  const combinedAlerts = useCombinedAlerts();

  const [isOpen, setIsOpen] = useState(false);

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
          <span>Powiadomienia</span>
          {totalUnreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-zinc-500 hover:text-zinc-700"
            >
              Oznacz jako przeczytane
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {displayAlerts.length === 0 ? (
          <div className="px-2 py-4 text-center">
            <p className="text-sm text-zinc-500 mb-2">Brak nowych powiadomień</p>
            <Link
              to="/powiadomienia"
              className="text-xs text-blue-600 hover:underline"
            >
              Zobacz historię powiadomień
            </Link>
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
                  />
                );
              }
            })}

            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="justify-center">
              <Link
                to="/powiadomienia"
                className="text-sm text-zinc-600 hover:text-zinc-900"
              >
                Zobacz wszystkie powiadomienia
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
