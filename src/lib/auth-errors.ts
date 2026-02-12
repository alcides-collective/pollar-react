import { FirebaseError } from 'firebase/app';
import i18n from '@/i18n';

/**
 * Firebase Auth error code to i18n key mapping
 */
const errorCodeToKey: Record<string, string> = {
  // Sign In errors
  'auth/user-not-found': 'auth.userNotFound',
  'auth/wrong-password': 'auth.wrongPassword',
  'auth/invalid-email': 'auth.invalidEmail',
  'auth/user-disabled': 'auth.userDisabled',
  'auth/too-many-requests': 'auth.tooManyRequests',
  'auth/invalid-credential': 'auth.invalidCredential',

  // Sign Up errors
  'auth/email-already-in-use': 'auth.emailInUse',
  'auth/weak-password': 'auth.weakPassword',
  'auth/operation-not-allowed': 'auth.operationNotAllowed',

  // Social Sign In errors
  'auth/popup-closed-by-user': 'auth.popupClosed',
  'auth/popup-blocked': 'auth.popupBlocked',
  'auth/account-exists-with-different-credential': 'auth.accountExistsWithDifferentCredential',
  'auth/cancelled-popup-request': 'auth.popupClosed',
  'auth/credential-already-in-use': 'auth.credentialAlreadyInUse',

  // Password Reset errors
  'auth/missing-email': 'auth.missingEmail',
  'auth/expired-action-code': 'auth.expiredActionCode',
  'auth/invalid-action-code': 'auth.invalidActionCode',

  // Reauthentication errors
  'auth/requires-recent-login': 'auth.requiresRecentLogin',

  // Network errors
  'auth/network-request-failed': 'auth.networkError',
};

/**
 * Get user-friendly error message from Firebase error
 */
export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    const key = errorCodeToKey[error.code];
    if (key) {
      return i18n.t(key, { ns: 'errors' });
    }
    return i18n.t('auth.unexpected', { ns: 'errors' });
  }

  if (error instanceof Error) {
    return error.message;
  }

  return i18n.t('auth.unknownError', { ns: 'errors' });
}

/**
 * Email validation with basic RFC format check
 */
export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

/**
 * Password validation - minimum 8 characters with complexity (OWASP recommendation)
 * Requires at least one uppercase, one lowercase, and one digit
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

/**
 * Name validation - minimum 2 non-whitespace characters, max 50, no HTML
 */
export function isValidName(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 50) return false;
  if (/<[^>]*>/.test(trimmed)) return false;
  return true;
}
