import { useState, useEffect } from 'react';
import { LocalizedLink } from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import { useUser, useAuthStore } from '@/stores/authStore';
import {
  useUserProfile,
  useSavedEventIds,
  useHiddenCategories,
  useFavoriteCategories,
  useFollowedMPIds,
  useUserStore,
} from '@/stores/userStore';
import { useEvents } from '@/stores/eventsStore';
import { useLanguage } from '@/stores/languageStore';
import { useRecentlyRead, useReadHistoryStore } from '@/stores/readHistoryStore';
import { useAlerts, useAlertsStore } from '@/stores/alertsStore';
import { useMPs } from '@/hooks/useMPs';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AvatarUpload } from '@/components/AvatarUpload';
import { ChangePasswordDialog } from '@/components/profile/ChangePasswordDialog';
import { DeleteAccountDialog } from '@/components/profile/DeleteAccountDialog';
import { EventImage } from '@/components/common/EventImage';
import { Button } from '@/components/ui/button';
import { isPrivateRelayEmail } from '@/types/auth';
import { updateMarketingConsent } from '@/services/userService';

// Static category list (same as Header)
const ALL_CATEGORIES = [
  'Świat',
  'Gospodarka',
  'Społeczeństwo',
  'Polityka',
  'Sport',
  'Kultura',
  'Przestępczość',
  'Styl Życia',
  'Pogoda i Środowisko',
  'Nauka i Technologia',
];

export function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { t } = useTranslation('profile');
  const { t: tDashboard } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');
  const language = useLanguage();
  const user = useUser();
  const profile = useUserProfile();
  const savedEventIds = useSavedEventIds();
  const hiddenCategories = useHiddenCategories();
  const favoriteCategories = useFavoriteCategories();
  const followedMPIds = useFollowedMPIds();
  const recentlyRead = useRecentlyRead();
  const alerts = useAlerts();
  const toggleHiddenCategory = useUserStore((s) => s.toggleHiddenCategory);
  const toggleFavoriteCategory = useUserStore((s) => s.toggleFavoriteCategory);
  const signOut = useAuthStore((s) => s.signOut);

  const fetchReadHistory = useReadHistoryStore((s) => s.fetchReadHistory);
  const fetchAllAlerts = useAlertsStore((s) => s.fetchAllAlerts);

  const fetchProfile = useUserStore((s) => s.fetchProfile);

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    if (user?.uid) {
      fetchReadHistory(user.uid);
      fetchAllAlerts();
    }
  }, [user?.uid, fetchReadHistory, fetchAllAlerts]);

  // Fetch events for display
  const { events } = useEvents({ limit: 100, lang: language, skipHiddenFilter: true });
  const savedEvents = events.filter((e) => savedEventIds.includes(e.id));
  const recentlyReadEvents = events.filter((e) =>
    recentlyRead.some((r) => r.eventId === e.id)
  );

  // Filter events by favorite categories for "For You" section
  const forYouEvents = favoriteCategories.length > 0
    ? events.filter((e) => favoriteCategories.includes(e.category)).slice(0, 6)
    : events.slice(0, 6);

  // Get followed MPs data
  const { mps } = useMPs();
  const followedMPs = mps.filter((mp) => followedMPIds.includes(mp.id));

  // Format vote for display
  const formatVote = (vote: string) => {
    switch (vote) {
      case 'yes': return { text: tDashboard('voting.for'), color: 'text-green-600 bg-green-50' };
      case 'no': return { text: tDashboard('voting.against'), color: 'text-red-600 bg-red-50' };
      case 'abstain': return { text: tDashboard('voting.abstained'), color: 'text-amber-600 bg-amber-50' };
      case 'absent': return { text: tDashboard('voting.absent'), color: 'text-zinc-500 bg-zinc-100' };
      default: return { text: vote, color: 'text-zinc-600 bg-zinc-50' };
    }
  };

  const isNewsletterEnabled = !!profile?.consentMarketingAcceptedAt;

  const handleNewsletterToggle = async () => {
    if (!user) return;
    setNewsletterLoading(true);
    try {
      await updateMarketingConsent(user.uid, !isNewsletterEnabled);
      await fetchProfile(user.uid);
    } catch {
      // silently fail — profile will show stale state
    } finally {
      setNewsletterLoading(false);
    }
  };

  if (!user) return null;

  const displayName = user.displayName ||
    (isPrivateRelayEmail(user.email) ? tCommon('user.appleUser') : user.email) ||
    tCommon('user.defaultName');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-8">{t('title')}</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Panel - Dashboard Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* For You Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-900">
                {tDashboard('forYou.title')}
              </h2>
              {favoriteCategories.length > 0 && (
                <span className="text-xs text-zinc-500">
                  {tDashboard('forYou.basedOn', { categories: favoriteCategories.slice(0, 3).join(', ') })}
                </span>
              )}
            </div>
            {forYouEvents.length === 0 ? (
              <div className="bg-zinc-50 rounded-lg p-6 text-center">
                <p className="text-zinc-500">{tDashboard('forYou.empty')}</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {forYouEvents.map((event) => (
                  <LocalizedLink
                    key={event.id}
                    to={`/event/${event.id}`}
                    className="block bg-white border border-zinc-200 rounded-lg overflow-hidden hover:border-zinc-300 transition-colors"
                  >
                    <EventImage
                      event={event}
                      className="h-32 w-full object-cover"
                      hoverScale={1}
                    />
                    <div className="p-3">
                      <span className="text-xs text-zinc-500">
                        {tCommon(`categories.${event.category}`, event.category)}
                      </span>
                      <h3 className="font-medium text-zinc-900 line-clamp-2 mt-1">
                        {event.title}
                      </h3>
                    </div>
                  </LocalizedLink>
                ))}
              </div>
            )}
          </section>

          {/* Recently Read */}
          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">
              {tDashboard('recentlyRead.title')}
            </h2>
            {recentlyReadEvents.length === 0 ? (
              <div className="bg-zinc-50 rounded-lg p-6 text-center">
                <p className="text-zinc-500">{tDashboard('recentlyRead.empty')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentlyReadEvents.slice(0, 5).map((event) => (
                  <LocalizedLink
                    key={event.id}
                    to={`/event/${event.id}`}
                    className="flex items-center gap-3 p-3 bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 transition-colors"
                  >
                    <EventImage
                      event={event}
                      className="h-12 w-16 object-cover rounded"
                      hoverScale={1}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-zinc-900 text-sm line-clamp-1">
                        {event.title}
                      </h3>
                      <span className="text-xs text-zinc-500">
                        {tCommon(`categories.${event.category}`, event.category)}
                      </span>
                    </div>
                  </LocalizedLink>
                ))}
              </div>
            )}
          </section>

          {/* Saved Events */}
          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">
              {tDashboard('saved.title', { count: savedEvents.length })}
            </h2>
            {savedEvents.length === 0 ? (
              <div className="bg-zinc-50 rounded-lg p-6 text-center">
                <p className="text-zinc-500">{tDashboard('saved.empty')}</p>
                <LocalizedLink to="/" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                  {tDashboard('saved.browseEvents')}
                </LocalizedLink>
              </div>
            ) : (
              <div className="space-y-2">
                {savedEvents.slice(0, 5).map((event) => (
                  <LocalizedLink
                    key={event.id}
                    to={`/event/${event.id}`}
                    className="flex items-center gap-3 p-3 bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 transition-colors"
                  >
                    <EventImage
                      event={event}
                      className="h-12 w-16 object-cover rounded"
                      hoverScale={1}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-zinc-900 text-sm line-clamp-1">
                        {event.title}
                      </h3>
                      <span className="text-xs text-zinc-500">
                        {tCommon(`categories.${event.category}`, event.category)}
                      </span>
                    </div>
                  </LocalizedLink>
                ))}
              </div>
            )}
          </section>

          {/* Followed MPs */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-900">
                {tDashboard('followedMPs.title', { count: followedMPs.length })}
              </h2>
              <LocalizedLink to="/sejm/poslowie" className="text-xs text-zinc-500 hover:text-zinc-700">
                {tDashboard('followedMPs.add')}
              </LocalizedLink>
            </div>
            {followedMPs.length === 0 ? (
              <div className="bg-zinc-50 rounded-lg p-6 text-center">
                <p className="text-zinc-500">{tDashboard('followedMPs.empty')}</p>
                <LocalizedLink
                  to="/sejm/poslowie"
                  className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                >
                  {tDashboard('followedMPs.browseMPs')}
                </LocalizedLink>
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {followedMPs.slice(0, 8).map((mp) => (
                  <LocalizedLink
                    key={mp.id}
                    to={`/sejm/poslowie/${mp.id}`}
                    className="flex items-center gap-3 p-3 bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 transition-colors"
                  >
                    <img
                      src={mp.photoUrl}
                      alt={mp.firstLastName}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">
                        {mp.firstLastName}
                      </p>
                      <p className="text-xs text-zinc-500">{mp.club}</p>
                    </div>
                  </LocalizedLink>
                ))}
              </div>
            )}
          </section>

          {/* Recent Alerts */}
          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">
              {tDashboard('alerts.title')}
            </h2>
            {alerts.length === 0 ? (
              <div className="bg-zinc-50 rounded-lg p-6 text-center">
                <p className="text-zinc-500">{tDashboard('alerts.empty')}</p>
                {followedMPs.length === 0 && (
                  <p className="text-xs text-zinc-400 mt-1">
                    {tDashboard('alerts.hint')}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.slice(0, 5).map((alert) => {
                  const voteInfo = formatVote(alert.vote);
                  return (
                    <LocalizedLink
                      key={alert.id}
                      to={`/sejm/glosowania/${alert.sitting}/${alert.votingNumber}`}
                      className={`block p-3 rounded-lg border transition-colors ${
                        !alert.read
                          ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                          : 'bg-white border-zinc-200 hover:border-zinc-300'
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
                    </LocalizedLink>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right Panel - Settings (Sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Profile Header */}
            <section className="bg-white border border-zinc-200 rounded-lg p-4">
              <AvatarUpload
                currentPhotoURL={user.photoURL}
                displayName={displayName}
                uid={user.uid}
              />
              <div className="mt-4 pt-4 border-t border-zinc-200">
                <p className="font-medium text-zinc-900">{displayName}</p>
                {user.email && (
                  <p className="text-sm text-zinc-500">{user.email}</p>
                )}
                {!user.emailVerified && user.providerId === 'password' && (
                  <p className="text-sm text-amber-600 mt-1">
                    {t('emailNotVerified')}
                  </p>
                )}
              </div>
            </section>

            {/* Favorite Categories */}
            <section className="bg-white border border-zinc-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-zinc-900 mb-2">
                {t('favoriteCategories.title')}
              </h3>
              <p className="text-xs text-zinc-500 mb-3">
                {t('favoriteCategories.description')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_CATEGORIES.map((category) => {
                  const isFavorite = favoriteCategories.includes(category);
                  return (
                    <button
                      key={category}
                      onClick={() => toggleFavoriteCategory(category)}
                      className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                        isFavorite
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {isFavorite && <span className="mr-1">★</span>}
                      {tCommon(`categories.${category}`, category)}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Hidden Categories */}
            <section className="bg-white border border-zinc-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-zinc-900 mb-2">
                {t('hiddenCategories.title')}
              </h3>
              <p className="text-xs text-zinc-500 mb-3">
                {t('hiddenCategories.description')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_CATEGORIES.map((category) => {
                  const isHidden = hiddenCategories.includes(category);
                  return (
                    <button
                      key={category}
                      onClick={() => toggleHiddenCategory(category)}
                      className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                        isHidden
                          ? 'bg-zinc-900 text-white'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {tCommon(`categories.${category}`, category)}
                      {isHidden && <span className="ml-1">✕</span>}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Newsletter / Marketing Consent */}
            <section className="bg-white border border-zinc-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-zinc-900 mb-2">
                {t('newsletter.title')}
              </h3>
              <p className="text-xs text-zinc-500 mb-3">
                {t('newsletter.description')}
              </p>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isNewsletterEnabled ? 'text-green-700' : 'text-zinc-500'}`}>
                  {isNewsletterEnabled ? t('newsletter.enabled') : t('newsletter.disabled')}
                </span>
                <button
                  onClick={handleNewsletterToggle}
                  disabled={newsletterLoading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 disabled:opacity-50 ${
                    isNewsletterEnabled ? 'bg-zinc-900' : 'bg-zinc-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                      isNewsletterEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </section>

            {/* Account Settings */}
            <section className="bg-white border border-zinc-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-zinc-900 mb-3">
                {t('accountSettings.title')}
              </h3>
              <div className="space-y-3">
                {user.providerId === 'password' && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{t('changePassword.title')}</p>
                        <p className="text-xs text-zinc-500">
                          {t('changePassword.description')}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setChangePasswordOpen(true)}
                      >
                        {tCommon('actions.edit')}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                      <div>
                        <p className="text-sm font-medium text-red-600">{t('deleteAccount.title')}</p>
                        <p className="text-xs text-zinc-500">
                          {t('deleteAccount.warning')}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => setDeleteAccountOpen(true)}
                      >
                        {tCommon('actions.delete')}
                      </Button>
                    </div>
                  </>
                )}
                {user.providerId !== 'password' && (
                  <p className="text-sm text-zinc-500">
                    {t('oauthProvider', {
                      provider: user.providerId === 'google.com' ? 'Google' : 'Apple'
                    })}
                  </p>
                )}
              </div>
            </section>

            {/* Logout */}
            <Button
              variant="outline"
              onClick={() => signOut()}
              className="w-full"
            >
              {tCommon('user.logout')}
            </Button>

            {/* Debug info */}
            {import.meta.env.DEV && profile && (
              <div className="p-3 bg-zinc-100 rounded-lg">
                <p className="text-xs text-zinc-500 font-mono">
                  UID: {profile.id}<br />
                  Provider: {profile.authProvider}<br />
                  Saved: {savedEventIds.length}<br />
                  Hidden: {hiddenCategories.length}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
      <DeleteAccountDialog
        open={deleteAccountOpen}
        onOpenChange={setDeleteAccountOpen}
      />
    </div>
  );
}
