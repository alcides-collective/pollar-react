import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useIsAuthenticated } from '@/stores/authStore';
import { useAlertsStore, useUnreadAlertsCount, useAlerts } from '@/stores/alertsStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

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

export function AlertsBell() {
  const isAuthenticated = useIsAuthenticated();
  const unreadCount = useUnreadAlertsCount();
  const alerts = useAlerts();

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
      useAlertsStore.getState().fetchAlerts();
    }
  };

  const handleMarkAsRead = (alertId: string) => {
    useAlertsStore.getState().markAsRead(alertId);
  };

  const handleMarkAllAsRead = () => {
    useAlertsStore.getState().markAllAsRead();
  };

  if (!isAuthenticated) {
    return null;
  }

  const displayAlerts = alerts.slice(0, 10);

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Alerty o głosowaniach</span>
          {unreadCount > 0 && (
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
            <p className="text-sm text-zinc-500 mb-2">Brak nowych alertów</p>
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
              const voteInfo = formatVote(alert.vote);
              return (
                <DropdownMenuItem
                  key={alert.id}
                  asChild
                  className={`flex flex-col items-start gap-1 py-3 cursor-pointer ${
                    !alert.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleMarkAsRead(alert.id)}
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
