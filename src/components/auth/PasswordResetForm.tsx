import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore, useAuthError } from '@/stores/authStore';
import { isValidEmail } from '@/lib/auth-errors';

export function PasswordResetForm() {
  const { t } = useTranslation('auth');
  const { t: tErrors } = useTranslation('errors');
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetPassword = useAuthStore((s) => s.resetPassword);
  const setView = useAuthStore((s) => s.setAuthModalView);
  const clearError = useAuthStore((s) => s.clearError);
  const isLoading = useAuthStore((s) => s.isLoading);
  const storeError = useAuthError();

  const error = localError || storeError;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    setSuccess(false);

    if (!isValidEmail(email)) {
      setLocalError(tErrors('auth.invalidEmailFormat'));
      return;
    }

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch {
      // Error is handled in store
    }
  };

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
          <svg
            className="h-6 w-6 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm text-zinc-400">
            {t('reset.emailSent')}
          </p>
          <p className="mt-1 font-medium text-zinc-100">
            {email}
          </p>
        </div>
        <p className="text-xs text-zinc-500">
          {t('reset.checkSpam')}
        </p>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setView('login')}
        >
          {t('reset.backToLogin')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-400">
        {t('reset.instructions')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-500/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <Input
          type="email"
          placeholder={t('login.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
          autoComplete="email"
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t('reset.sending') : t('reset.sendLink')}
        </Button>

        <button
          type="button"
          onClick={() => setView('login')}
          className="w-full text-center text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          {t('reset.backToLogin')}
        </button>
      </form>
    </div>
  );
}
