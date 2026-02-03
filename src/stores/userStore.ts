import { create } from 'zustand';
import {
  getUserProfile,
  addSavedEvent,
  removeSavedEvent,
  addHiddenCategory,
  removeHiddenCategory,
  addFavoriteCategory,
  removeFavoriteCategory,
} from '@/services/userService';
import { trackBookmarkEvent, trackHiddenCategory } from '@/lib/analytics';
import type { UserProfile } from '@/types/auth';

// ============ Types ============

interface UserState {
  profile: UserProfile | null;
  savedEventIds: string[];
  hiddenCategories: string[];
  favoriteCategories: string[];
  isLoading: boolean;
  error: string | null;
}

interface UserActions {
  // Profile
  fetchProfile: (uid: string) => Promise<void>;
  clearProfile: () => void;

  // Saved Events (Bookmarks)
  toggleSaveEvent: (eventId: string) => Promise<void>;
  isEventSaved: (eventId: string) => boolean;

  // Hidden Categories
  toggleHiddenCategory: (category: string) => Promise<void>;
  isCategoryHidden: (category: string) => boolean;

  // Favorite Categories
  toggleFavoriteCategory: (category: string) => Promise<void>;
  isCategoryFavorite: (category: string) => boolean;

  // Internal
  setError: (error: string | null) => void;
}

type UserStore = UserState & UserActions;

// ============ Store ============

export const useUserStore = create<UserStore>((set, get) => ({
  // Initial State
  profile: null,
  savedEventIds: [],
  hiddenCategories: [],
  favoriteCategories: [],
  isLoading: false,
  error: null,

  // Profile
  fetchProfile: async (uid) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await getUserProfile(uid);
      if (profile) {
        set({
          profile,
          savedEventIds: profile.savedEventIds || [],
          hiddenCategories: profile.hiddenCategories || [],
          favoriteCategories: profile.favoriteCategories || [],
        });
      }
    } catch (error) {
      set({ error: 'Nie udało się pobrać profilu' });
      console.error('Error fetching profile:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  clearProfile: () => {
    set({
      profile: null,
      savedEventIds: [],
      hiddenCategories: [],
      favoriteCategories: [],
      error: null,
    });
  },

  // Saved Events (Bookmarks)
  toggleSaveEvent: async (eventId) => {
    const { profile, savedEventIds } = get();
    if (!profile) return;

    const isSaved = savedEventIds.includes(eventId);

    // Optimistic update
    if (isSaved) {
      set({ savedEventIds: savedEventIds.filter((id) => id !== eventId) });
    } else {
      set({ savedEventIds: [...savedEventIds, eventId] });
    }

    try {
      if (isSaved) {
        await removeSavedEvent(profile.id, eventId);
        trackBookmarkEvent(eventId, 'remove');
      } else {
        await addSavedEvent(profile.id, eventId);
        trackBookmarkEvent(eventId, 'add');
      }
    } catch (error) {
      // Revert on error
      if (isSaved) {
        set({ savedEventIds: [...savedEventIds, eventId] });
      } else {
        set({ savedEventIds: savedEventIds.filter((id) => id !== eventId) });
      }
      set({ error: 'Nie udało się zapisać eventu' });
      throw error;
    }
  },

  isEventSaved: (eventId) => {
    return get().savedEventIds.includes(eventId);
  },

  // Hidden Categories
  toggleHiddenCategory: async (category) => {
    const { profile, hiddenCategories } = get();
    if (!profile) return;

    const isHidden = hiddenCategories.includes(category);

    // Optimistic update
    if (isHidden) {
      set({
        hiddenCategories: hiddenCategories.filter((c) => c !== category),
      });
    } else {
      set({ hiddenCategories: [...hiddenCategories, category] });
    }

    try {
      if (isHidden) {
        await removeHiddenCategory(profile.id, category);
        trackHiddenCategory(category, 'show');
      } else {
        await addHiddenCategory(profile.id, category);
        trackHiddenCategory(category, 'hide');
      }
    } catch (error) {
      // Revert on error
      if (isHidden) {
        set({ hiddenCategories: [...hiddenCategories, category] });
      } else {
        set({
          hiddenCategories: hiddenCategories.filter((c) => c !== category),
        });
      }
      set({ error: 'Nie udało się zaktualizować ukrytych kategorii' });
      throw error;
    }
  },

  isCategoryHidden: (category) => {
    return get().hiddenCategories.includes(category);
  },

  // Favorite Categories
  toggleFavoriteCategory: async (category) => {
    const { profile, favoriteCategories } = get();
    if (!profile) return;

    const isFavorite = favoriteCategories.includes(category);

    // Optimistic update
    if (isFavorite) {
      set({
        favoriteCategories: favoriteCategories.filter((c) => c !== category),
      });
    } else {
      set({ favoriteCategories: [...favoriteCategories, category] });
    }

    try {
      if (isFavorite) {
        await removeFavoriteCategory(profile.id, category);
      } else {
        await addFavoriteCategory(profile.id, category);
      }
    } catch (error) {
      // Revert on error
      if (isFavorite) {
        set({ favoriteCategories: [...favoriteCategories, category] });
      } else {
        set({
          favoriteCategories: favoriteCategories.filter((c) => c !== category),
        });
      }
      set({ error: 'Nie udało się zaktualizować ulubionych kategorii' });
      throw error;
    }
  },

  isCategoryFavorite: (category) => {
    return get().favoriteCategories.includes(category);
  },

  // Internal
  setError: (error) => set({ error }),
}));

// ============ Convenience Hooks ============

export function useUserProfile() {
  return useUserStore((state) => state.profile);
}

export function useSavedEventIds() {
  return useUserStore((state) => state.savedEventIds);
}

export function useHiddenCategories() {
  return useUserStore((state) => state.hiddenCategories);
}

export function useFavoriteCategories() {
  return useUserStore((state) => state.favoriteCategories);
}

export function useIsEventSaved(eventId: string) {
  return useUserStore((state) => state.savedEventIds.includes(eventId));
}

export function useIsCategoryHidden(category: string) {
  return useUserStore((state) => state.hiddenCategories.includes(category));
}
