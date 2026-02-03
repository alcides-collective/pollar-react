import { FirebaseError } from 'firebase/app';

/**
 * Polish translations for Firebase Auth error codes
 * Must match iOS error messages for consistent UX
 */
const errorMessages: Record<string, string> = {
  // Sign In errors
  'auth/user-not-found': 'Nie znaleziono konta z tym adresem email',
  'auth/wrong-password': 'Nieprawidłowe hasło',
  'auth/invalid-email': 'Nieprawidłowy format adresu email',
  'auth/user-disabled': 'To konto zostało zablokowane',
  'auth/too-many-requests': 'Zbyt wiele prób. Spróbuj ponownie później',
  'auth/invalid-credential': 'Nieprawidłowy email lub hasło',

  // Sign Up errors
  'auth/email-already-in-use': 'Konto z tym adresem email już istnieje',
  'auth/weak-password': 'Hasło musi mieć co najmniej 6 znaków',
  'auth/operation-not-allowed': 'Ta metoda logowania jest wyłączona',

  // Social Sign In errors
  'auth/popup-closed-by-user': 'Logowanie zostało anulowane',
  'auth/popup-blocked':
    'Wyskakujące okno zostało zablokowane. Włącz wyskakujące okna dla tej strony',
  'auth/account-exists-with-different-credential':
    'Konto z tym adresem email istnieje z inną metodą logowania',
  'auth/cancelled-popup-request': 'Logowanie zostało anulowane',
  'auth/credential-already-in-use':
    'Te dane logowania są już powiązane z innym kontem',

  // Password Reset errors
  'auth/missing-email': 'Wprowadź adres email',
  'auth/expired-action-code': 'Link resetowania hasła wygasł',
  'auth/invalid-action-code': 'Link resetowania hasła jest nieprawidłowy',

  // Reauthentication errors
  'auth/requires-recent-login':
    'Ze względów bezpieczeństwa musisz ponownie podać hasło',

  // Network errors
  'auth/network-request-failed':
    'Błąd połączenia. Sprawdź połączenie internetowe',
};

/**
 * Get user-friendly error message from Firebase error
 */
export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return (
      errorMessages[error.code] ||
      'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.'
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Wystąpił nieoczekiwany błąd';
}

/**
 * Custom auth error types for non-Firebase errors
 */
export const AuthErrorMessages = {
  MISSING_NONCE: 'Błąd bezpieczeństwa - brak nonce',
  MISSING_TOKEN: 'Nie udało się pobrać tokenu',
  APPLE_ID_REVOKED: 'Dostęp Apple ID został odwołany',
  MISSING_GOOGLE_CLIENT_ID: 'Brak konfiguracji Google Sign-In',
  USER_NOT_FOUND: 'Nie znaleziono użytkownika',
  PASSWORDS_DONT_MATCH: 'Hasła nie są zgodne',
  PASSWORD_TOO_SHORT: 'Hasło musi mieć co najmniej 6 znaków',
  INVALID_EMAIL: 'Nieprawidłowy format adresu email',
  NAME_TOO_SHORT: 'Imię musi mieć co najmniej 2 znaki',
  OFFLINE: 'Brak połączenia z internetem',
} as const;

/**
 * Simple email validation (matches iOS implementation)
 */
export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  return trimmed.includes('@') && trimmed.includes('.');
}

/**
 * Password validation - minimum 6 characters (Firebase requirement)
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * Name validation - minimum 2 non-whitespace characters
 */
export function isValidName(name: string): boolean {
  return name.trim().length >= 2;
}
