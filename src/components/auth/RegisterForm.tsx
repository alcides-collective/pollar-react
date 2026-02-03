import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore, useAuthError } from '@/stores/authStore';
import { SocialLoginButtons } from './SocialLoginButtons';
import { AuthDivider } from './AuthDivider';
import {
  isValidEmail,
  isValidPassword,
  isValidName,
  AuthErrorMessages,
} from '@/lib/auth-errors';

export function RegisterForm() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const signUp = useAuthStore((s) => s.signUpWithEmail);
  const setView = useAuthStore((s) => s.setAuthModalView);
  const clearError = useAuthStore((s) => s.clearError);
  const isLoading = useAuthStore((s) => s.isLoading);
  const storeError = useAuthError();

  const error = localError || storeError;

  const validateForm = (): boolean => {
    if (!isValidName(displayName)) {
      setLocalError(AuthErrorMessages.NAME_TOO_SHORT);
      return false;
    }
    if (!isValidEmail(email)) {
      setLocalError(AuthErrorMessages.INVALID_EMAIL);
      return false;
    }
    if (!isValidPassword(password)) {
      setLocalError(AuthErrorMessages.PASSWORD_TOO_SHORT);
      return false;
    }
    if (password !== confirmPassword) {
      setLocalError(AuthErrorMessages.PASSWORDS_DONT_MATCH);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!validateForm()) return;

    try {
      await signUp(email, password, displayName.trim());
    } catch {
      // Error is handled in store
    }
  };

  const passwordRequirements = [
    { met: password.length >= 6, text: 'Minimum 6 znaków' },
    { met: password === confirmPassword && password.length > 0, text: 'Hasła są zgodne' },
  ];

  return (
    <div className="space-y-4">
      <SocialLoginButtons />
      <AuthDivider />

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Imię"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={isLoading}
            required
            autoComplete="name"
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
            autoComplete="new-password"
          />
          <Input
            type="password"
            placeholder="Powtórz hasło"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            required
            autoComplete="new-password"
          />
        </div>

        {/* Password requirements */}
        {password.length > 0 && (
          <div className="space-y-1 text-xs">
            {passwordRequirements.map((req, i) => (
              <div
                key={i}
                className={`flex items-center gap-1.5 ${
                  req.met
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-zinc-400 dark:text-zinc-500'
                }`}
              >
                <span>{req.met ? '✓' : '○'}</span>
                <span>{req.text}</span>
              </div>
            ))}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Rejestracja...' : 'Zarejestruj się'}
        </Button>

        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Masz już konto?{' '}
          <button
            type="button"
            onClick={() => setView('login')}
            className="font-medium text-zinc-900 hover:underline dark:text-zinc-200"
          >
            Zaloguj się
          </button>
        </p>
      </form>
    </div>
  );
}
