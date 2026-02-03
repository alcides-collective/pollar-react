import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useUser } from '@/stores/authStore';
import {
  useSavedEventIds,
  useFavoriteCategories,
  useFollowedMPIds,
} from '@/stores/userStore';
import { useRecentlyRead, useReadHistoryStore } from '@/stores/readHistoryStore';
import { useAlerts, useAlertsStore } from '@/stores/alertsStore';
import { useEvents } from '@/stores/eventsStore';
import { useMPs } from '@/hooks/useMPs';

export function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const user = useUser();
  const savedEventIds = useSavedEventIds();
  const favoriteCategories = useFavoriteCategories();
  const followedMPIds = useFollowedMPIds();
  const recentlyRead = useRecentlyRead();
  const alerts = useAlerts();

  const fetchReadHistory = useReadHistoryStore((s) => s.fetchReadHistory);
  const fetchAlerts = useAlertsStore((s) => s.fetchAlerts);

  // Fetch data on mount
  useEffect(() => {
    if (user?.uid) {
      fetchReadHistory(user.uid);
      fetchAlerts();
    }
  }, [user?.uid, fetchReadHistory, fetchAlerts]);

  // Get events for display
  const { events } = useEvents({ limit: 100, lang: 'pl', skipHiddenFilter: true });
  const savedEvents = events.filter((e) => savedEventIds.includes(e.id));
  const recentlyReadEvents = events.filter((e) =>
    recentlyRead.some((r) => r.eventId === e.id)
  );

  // Filter events by favorite categories
  const forYouEvents = favoriteCategories.length > 0
    ? events.filter((e) => favoriteCategories.includes(e.category)).slice(0, 6)
    : events.slice(0, 6);

  // Get followed MPs data
  const { mps } = useMPs();
  const followedMPs = mps.filter((mp) => followedMPIds.includes(mp.id));

  // Format vote for display
  const formatVote = (vote: string) => {
    switch (vote) {
      case 'yes': return { text: 'Za', color: 'text-green-600 bg-green-50' };
      case 'no': return { text: 'Przeciw', color: 'text-red-600 bg-red-50' };
      case 'abstain': return { text: 'Wstrzymał się', color: 'text-amber-600 bg-amber-50' };
      case 'absent': return { text: 'Nieobecny', color: 'text-zinc-500 bg-zinc-100' };
      default: return { text: vote, color: 'text-zinc-600 bg-zinc-50' };
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-8">Dashboard</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content - 2 columns */}
        <div className="lg:col-span-2 space-y-8">
          {/* For You Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-900">
                Dla Ciebie
              </h2>
              {favoriteCategories.length > 0 && (
                <span className="text-xs text-zinc-500">
                  Na podstawie: {favoriteCategories.slice(0, 3).join(', ')}
                </span>
              )}
            </div>
            {forYouEvents.length === 0 ? (
              <div className="bg-zinc-50 rounded-lg p-6 text-center">
                <p className="text-zinc-500">Dodaj ulubione kategorie, żeby zobaczyć spersonalizowane wydarzenia.</p>
                <Link to="/profil" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                  Ustaw ulubione kategorie
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {forYouEvents.map((event) => (
                  <Link
                    key={event.id}
                    to={`/event/${event.id}`}
                    className="block bg-white border border-zinc-200 rounded-lg overflow-hidden hover:border-zinc-300 transition-colors"
                  >
                    {event.imageUrl && (
                      <img
                        src={event.imageUrl}
                        alt=""
                        className="h-32 w-full object-cover"
                      />
                    )}
                    <div className="p-3">
                      <span className="text-xs text-zinc-500">{event.category}</span>
                      <h3 className="font-medium text-zinc-900 line-clamp-2 mt-1">
                        {event.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Recently Read */}
          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">
              Ostatnio czytane
            </h2>
            {recentlyReadEvents.length === 0 ? (
              <div className="bg-zinc-50 rounded-lg p-6 text-center">
                <p className="text-zinc-500">Nie masz jeszcze historii czytania.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentlyReadEvents.slice(0, 5).map((event) => (
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
                      <h3 className="font-medium text-zinc-900 text-sm line-clamp-1">
                        {event.title}
                      </h3>
                      <span className="text-xs text-zinc-500">{event.category}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Saved Events */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-900">
                Zapisane ({savedEvents.length})
              </h2>
              {savedEvents.length > 0 && (
                <Link to="/profil" className="text-xs text-zinc-500 hover:text-zinc-700">
                  Zobacz wszystkie
                </Link>
              )}
            </div>
            {savedEvents.length === 0 ? (
              <div className="bg-zinc-50 rounded-lg p-6 text-center">
                <p className="text-zinc-500">Nie masz zapisanych wydarzeń.</p>
                <Link to="/" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                  Przeglądaj wydarzenia
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {savedEvents.slice(0, 5).map((event) => (
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
                      <h3 className="font-medium text-zinc-900 text-sm line-clamp-1">
                        {event.title}
                      </h3>
                      <span className="text-xs text-zinc-500">{event.category}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-8">
          {/* Followed MPs */}
          <section className="bg-white border border-zinc-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-zinc-900">
                Śledzeni posłowie ({followedMPs.length})
              </h2>
              <Link to="/sejm/poslowie" className="text-xs text-zinc-500 hover:text-zinc-700">
                Dodaj
              </Link>
            </div>
            {followedMPs.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-zinc-500 mb-2">Nie śledzisz żadnych posłów.</p>
                <Link
                  to="/sejm/poslowie"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Przeglądaj posłów
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {followedMPs.slice(0, 8).map((mp) => (
                  <Link
                    key={mp.id}
                    to={`/sejm/poslowie/${mp.id}`}
                    className="flex items-center gap-2 p-2 rounded hover:bg-zinc-50 transition-colors"
                  >
                    <img
                      src={mp.photoUrl}
                      alt={mp.firstLastName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">
                        {mp.firstLastName}
                      </p>
                      <p className="text-xs text-zinc-500">{mp.club}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Recent Alerts */}
          <section className="bg-white border border-zinc-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-zinc-900 mb-4">
              Ostatnie alerty
            </h2>
            {alerts.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-zinc-500">
                  Brak alertów o głosowaniach.
                </p>
                {followedMPs.length === 0 && (
                  <p className="text-xs text-zinc-400 mt-1">
                    Zacznij śledzić posłów, żeby otrzymywać alerty.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert) => {
                  const voteInfo = formatVote(alert.vote);
                  return (
                    <Link
                      key={alert.id}
                      to={`/sejm/glosowania/${alert.sitting}/${alert.votingNumber}`}
                      className={`block p-2 rounded transition-colors ${
                        !alert.read ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-zinc-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-zinc-900">
                          {alert.mpName}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${voteInfo.color}`}>
                          {voteInfo.text}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-2">
                        {alert.votingTitle}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
