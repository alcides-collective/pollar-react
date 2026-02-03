import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser, useAuthStore } from '@/stores/authStore';
import {
  useUserProfile,
  useSavedEventIds,
  useHiddenCategories,
  useUserStore,
} from '@/stores/userStore';
import { useEvents } from '@/stores/eventsStore';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AvatarUpload } from '@/components/AvatarUpload';
import { ChangePasswordDialog } from '@/components/profile/ChangePasswordDialog';
import { DeleteAccountDialog } from '@/components/profile/DeleteAccountDialog';
import { Button } from '@/components/ui/button';
import { isPrivateRelayEmail } from '@/types/auth';

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
  const user = useUser();
  const profile = useUserProfile();
  const savedEventIds = useSavedEventIds();
  const hiddenCategories = useHiddenCategories();
  const toggleHiddenCategory = useUserStore((s) => s.toggleHiddenCategory);
  const signOut = useAuthStore((s) => s.signOut);

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  // Fetch saved events details (skip hidden filter so all saved events show)
  const { events } = useEvents({ limit: 100, lang: 'pl', skipHiddenFilter: true });
  const savedEvents = events.filter((e) => savedEventIds.includes(e.id));

  if (!user) return null;

  const displayName = user.displayName ||
    (isPrivateRelayEmail(user.email) ? 'Użytkownik Apple' : user.email) ||
    'Użytkownik';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Twój profil
        </h2>
        <div className="bg-zinc-50 rounded-lg p-6">
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
                Email niezweryfikowany
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Saved Events */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Zapisane wydarzenia ({savedEvents.length})
        </h2>
        {savedEvents.length === 0 ? (
          <div className="bg-zinc-50 rounded-lg p-6 text-center">
            <p className="text-zinc-500">Nie masz jeszcze zapisanych wydarzeń.</p>
            <Link to="/" className="text-zinc-900 hover:underline text-sm mt-2 inline-block">
              Przeglądaj wydarzenia
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {savedEvents.map((event) => (
              <Link
                key={event.id}
                to={`/event/${event.id}`}
                className="block bg-white border border-zinc-200 rounded-lg p-4 hover:border-zinc-300 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {event.imageUrl && (
                    <img
                      src={event.imageUrl}
                      alt=""
                      className="h-16 w-24 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-zinc-900 line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1">
                      {event.category}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Hidden Categories */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-zinc-900 mb-2">
          Ukryte kategorie
        </h2>
        <p className="text-sm text-zinc-500 mb-4">
          Wydarzenia z ukrytych kategorii nie będą wyświetlane na stronie głównej.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ALL_CATEGORIES.map((category) => {
            const isHidden = hiddenCategories.includes(category);
            return (
              <button
                key={category}
                onClick={() => toggleHiddenCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm text-left transition-colors ${
                  isHidden
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                {category}
                {isHidden && <span className="ml-2">✕</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* Account Settings */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Ustawienia konta
        </h2>
        <div className="space-y-3">
          {user.providerId === 'password' && (
            <div className="flex items-center justify-between py-3 border-b border-zinc-100">
              <div>
                <p className="font-medium text-zinc-900">Zmień hasło</p>
                <p className="text-sm text-zinc-500">
                  Zaktualizuj swoje hasło
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChangePasswordOpen(true)}
              >
                Zmień
              </Button>
            </div>
          )}
          {user.providerId === 'password' && (
            <div className="flex items-center justify-between py-3 border-b border-zinc-100">
              <div>
                <p className="font-medium text-red-600">Usuń konto</p>
                <p className="text-sm text-zinc-500">
                  Trwale usuń swoje konto i dane
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setDeleteAccountOpen(true)}
              >
                Usuń
              </Button>
            </div>
          )}
          {user.providerId !== 'password' && (
            <div className="py-3 text-sm text-zinc-500">
              Zalogowano przez {user.providerId === 'google.com' ? 'Google' : 'Apple'}.
              Zarządzanie kontem odbywa się przez dostawcę.
            </div>
          )}
        </div>
      </section>

      {/* Dialogs */}
      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
      <DeleteAccountDialog
        open={deleteAccountOpen}
        onOpenChange={setDeleteAccountOpen}
      />

      {/* Logout */}
      <div className="border-t border-zinc-200 pt-6">
        <Button
          variant="outline"
          onClick={() => signOut()}
          className="w-full sm:w-auto"
        >
          Wyloguj się
        </Button>
      </div>

      {/* Debug info */}
      {import.meta.env.DEV && profile && (
        <div className="mt-8 p-4 bg-zinc-100 rounded-lg">
          <p className="text-xs text-zinc-500 font-mono">
            UID: {profile.id}<br />
            Provider: {profile.authProvider}<br />
            Saved: {savedEventIds.length}<br />
            Hidden: {hiddenCategories.length}
          </p>
        </div>
      )}
    </div>
  );
}
