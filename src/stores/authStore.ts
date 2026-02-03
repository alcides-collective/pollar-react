import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  getIdToken,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  type User,
} from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/config/firebase';
import { createOrUpdateUserProfile } from '@/services/userService';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { trackLogin, trackSignUp, trackLogout } from '@/lib/analytics';
import type {
  AuthUser,
  AuthModalView,
  AuthProvider,
} from '@/types/auth';

// ============ Types ============

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  isAuthModalOpen: boolean;
  authModalView: AuthModalView;
}

interface AuthActions {
  // Modal controls
  openAuthModal: (view?: AuthModalView) => void;
  closeAuthModal: () => void;
  setAuthModalView: (view: AuthModalView) => void;

  // Auth operations
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;

  // Token management
  getAccessToken: () => Promise<string | null>;

  // User management
  refreshUser: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;

  // Internal
  setUser: (user: AuthUser | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initialize: () => () => void;
}

type AuthStore = AuthState & AuthActions;

// ============ Helpers ============

function getProviderIdFromUser(user: User): AuthProvider {
  const providerData = user.providerData[0];
  if (providerData?.providerId === 'google.com') return 'google.com';
  if (providerData?.providerId === 'apple.com') return 'apple.com';
  return 'password';
}

function transformUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    providerId: getProviderIdFromUser(user),
  };
}

// ============ Store ============

export const useAuthStore = create<AuthStore>((set) => ({
  // Initial State
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,
  isAuthModalOpen: false,
  authModalView: 'login',

  // Modal Controls
  openAuthModal: (view = 'login') => {
    set({ isAuthModalOpen: true, authModalView: view, error: null });
  },

  closeAuthModal: () => {
    set({ isAuthModalOpen: false, error: null });
  },

  setAuthModalView: (view) => {
    set({ authModalView: view, error: null });
  },

  // Auth Operations
  signInWithEmail: async (email, password) => {
    if (!isFirebaseConfigured || !auth) {
      set({ error: 'Firebase nie jest skonfigurowany' });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await createOrUpdateUserProfile(credential.user, 'email');
      trackLogin('email');
      set({ user: transformUser(credential.user), isAuthModalOpen: false });
    } catch (error) {
      const message = getAuthErrorMessage(error);
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signUpWithEmail: async (email, password, displayName) => {
    if (!isFirebaseConfigured || !auth) {
      set({ error: 'Firebase nie jest skonfigurowany' });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Set display name
      await updateProfile(credential.user, { displayName });

      // Send verification email
      await sendEmailVerification(credential.user);

      // Create Firestore profile
      await createOrUpdateUserProfile(credential.user, 'email');

      trackSignUp('email');
      set({
        user: transformUser({ ...credential.user, displayName }),
        isAuthModalOpen: false,
      });
    } catch (error) {
      const message = getAuthErrorMessage(error);
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithGoogle: async () => {
    if (!isFirebaseConfigured || !auth) {
      set({ error: 'Firebase nie jest skonfigurowany' });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      const credential = await signInWithPopup(auth, provider);
      await createOrUpdateUserProfile(credential.user, 'google');
      trackLogin('google');
      set({ user: transformUser(credential.user), isAuthModalOpen: false });
    } catch (error) {
      const message = getAuthErrorMessage(error);
      // Don't show error for user-cancelled popup
      if (message !== 'Logowanie zostalo anulowane') {
        set({ error: message });
      }
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithApple: async () => {
    if (!isFirebaseConfigured || !auth) {
      set({ error: 'Firebase nie jest skonfigurowany' });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      const credential = await signInWithPopup(auth, provider);
      await createOrUpdateUserProfile(credential.user, 'apple');
      trackLogin('apple');
      set({ user: transformUser(credential.user), isAuthModalOpen: false });
    } catch (error) {
      const message = getAuthErrorMessage(error);
      // Don't show error for user-cancelled popup
      if (message !== 'Logowanie zostalo anulowane') {
        set({ error: message });
      }
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    if (!isFirebaseConfigured || !auth) return;
    set({ isLoading: true });
    try {
      await firebaseSignOut(auth);
      trackLogout();
      set({ user: null });
    } catch (error) {
      const message = getAuthErrorMessage(error);
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (email) => {
    if (!isFirebaseConfigured || !auth) {
      set({ error: 'Firebase nie jest skonfigurowany' });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      await sendPasswordResetEmail(auth, email);
      set({ authModalView: 'login' });
    } catch (error) {
      const message = getAuthErrorMessage(error);
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  resendVerificationEmail: async () => {
    if (!isFirebaseConfigured || !auth) return;
    const currentUser = auth.currentUser;
    if (currentUser && !currentUser.emailVerified) {
      await sendEmailVerification(currentUser);
    }
  },

  getAccessToken: async () => {
    if (!isFirebaseConfigured || !auth) return null;
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    return getIdToken(currentUser);
  },

  refreshUser: async () => {
    if (!isFirebaseConfigured || !auth) return;
    const currentUser = auth.currentUser;
    if (currentUser) {
      // Reload user data from Firebase
      await currentUser.reload();
      set({ user: transformUser(currentUser) });
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase nie jest skonfigurowany');
    }
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      throw new Error('Nie jesteś zalogowany');
    }

    set({ isLoading: true, error: null });
    try {
      // Reauthenticate first
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);
    } catch (error) {
      const message = getAuthErrorMessage(error);
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteAccount: async (password) => {
    if (!isFirebaseConfigured || !auth || !db) {
      throw new Error('Firebase nie jest skonfigurowany');
    }
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      throw new Error('Nie jesteś zalogowany');
    }

    set({ isLoading: true, error: null });
    try {
      // Reauthenticate first
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        password
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Delete Firestore profile
      const userRef = doc(db, 'users', currentUser.uid);
      await deleteDoc(userRef);

      // Delete Firebase Auth account
      await deleteUser(currentUser);
      set({ user: null });
    } catch (error) {
      const message = getAuthErrorMessage(error);
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateDisplayName: async (displayName) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase nie jest skonfigurowany');
    }
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Nie jesteś zalogowany');
    }

    set({ isLoading: true, error: null });
    try {
      await updateProfile(currentUser, { displayName });
      set({ user: transformUser(currentUser) });
    } catch (error) {
      const message = getAuthErrorMessage(error);
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Internal
  setUser: (user) => set({ user }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  initialize: () => {
    // If Firebase is not configured, mark as initialized with no user
    if (!isFirebaseConfigured || !auth) {
      set({ isInitialized: true, isLoading: false, user: null });
      return () => {}; // No-op unsubscribe
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({
        user: user ? transformUser(user) : null,
        isInitialized: true,
        isLoading: false,
      });
    });
    return unsubscribe;
  },
}));

// ============ Convenience Hooks ============

export function useUser() {
  return useAuthStore((state) => state.user);
}

export function useIsAuthenticated() {
  return useAuthStore((state) => state.user !== null);
}

export function useIsAuthLoading() {
  return useAuthStore((state) => state.isLoading || !state.isInitialized);
}

export function useAuthError() {
  return useAuthStore((state) => state.error);
}

export function useAuthModal() {
  return useAuthStore((state) => ({
    isOpen: state.isAuthModalOpen,
    view: state.authModalView,
    open: state.openAuthModal,
    close: state.closeAuthModal,
    setView: state.setAuthModalView,
  }));
}
