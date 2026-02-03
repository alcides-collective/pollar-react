import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore, useAuthError } from '@/stores/authStore';
import { SocialLoginButtons } from './SocialLoginButtons';
import { AuthDivider } from './AuthDivider';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signIn = useAuthStore((s) => s.signInWithEmail);
  const setView = useAuthStore((s) => s.setAuthModalView);
  const clearError = useAuthStore((s) => s.clearError);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthError();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await signIn(email, password);
    } catch {
      // Error is handled in store
    }
  };

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
            autoComplete="current-password"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setView('reset')}
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Nie pamiętasz hasła?
          </button>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Logowanie...' : 'Zaloguj się'}
        </Button>

        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Nie masz konta?{' '}
          <button
            type="button"
            onClick={() => setView('register')}
            className="font-medium text-zinc-900 hover:underline dark:text-zinc-200"
          >
            Zarejestruj się
          </button>
        </p>
      </form>
    </div>
  );
}
