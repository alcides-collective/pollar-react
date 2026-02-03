import type { Timestamp } from 'firebase/firestore';

/**
 * Represents the authenticated user from Firebase Auth
 */
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  providerId: AuthProvider;
}

/**
 * Authentication provider type
 * Must match iOS implementation
 */
export type AuthProvider = 'password' | 'google.com' | 'apple.com';

/**
 * Simplified provider name for display and storage
 * Must match iOS Firestore values: "apple", "google", "email"
 */
export type AuthProviderName = 'apple' | 'google' | 'email';

/**
 * User profile stored in Firestore
 * Structure must match iOS UserProfile model for cross-platform sync
 */
export interface UserProfile {
  /** Firebase Auth UID (document ID) */
  id: string;
  /** User's email address */
  email: string;
  /** Display name (can be null for Apple Private Relay users) */
  displayName: string | null;
  /** Authentication method: "apple", "google", or "email" */
  authProvider: AuthProviderName;
  /** Account creation timestamp */
  createdAt: Timestamp;
  /** Last activity timestamp */
  lastActiveAt: Timestamp | null;
  /** Favorite categories (e.g., ["polityka", "sport"]) */
  favoriteCategories: string[];
  /** Saved event IDs (bookmarks) */
  savedEventIds: string[];
  /** Hidden categories - events from these won't be displayed */
  hiddenCategories: string[];
  /** Avatar URL from Firebase Storage */
  photoURL?: string | null;
}

/**
 * Auth modal view states
 */
export type AuthModalView = 'login' | 'register' | 'reset';

/**
 * Form state for authentication forms
 */
export interface AuthFormState {
  email: string;
  password: string;
  confirmPassword?: string;
  displayName?: string;
}

/**
 * Read history entry for tracking read events
 * Stored in subcollection: users/{userId}/readHistory
 */
export interface ReadHistoryEntry {
  eventId: string;
  readAt: Timestamp;
}

/**
 * Maps Firebase provider ID to simplified provider name
 */
export function getProviderName(providerId: AuthProvider): AuthProviderName {
  switch (providerId) {
    case 'google.com':
      return 'google';
    case 'apple.com':
      return 'apple';
    case 'password':
    default:
      return 'email';
  }
}

/**
 * Checks if email is Apple Private Relay
 */
export function isPrivateRelayEmail(email: string | null): boolean {
  return email?.includes('@privaterelay.appleid.com') ?? false;
}
