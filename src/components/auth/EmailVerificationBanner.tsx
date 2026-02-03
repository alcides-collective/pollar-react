import { useState } from 'react';
import { useAuthStore, useUser } from '@/stores/authStore';

export function EmailVerificationBanner() {
  const user = useUser();
  const resendVerificationEmail = useAuthStore((s) => s.resendVerificationEmail);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Only show for logged in users with unverified email
  if (!user || user.emailVerified || user.providerId !== 'password') {
    return null;
  }

  const handleResend = async () => {
    setSending(true);
    try {
      await resendVerificationEmail();
      setSent(true);
      // Reset after 3 seconds
      setTimeout(() => setSent(false), 3000);
    } catch {
      // Silently fail - Firebase has built-in rate limiting
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
      <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-amber-600 dark:text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Twój adres email ({user.email}) nie został jeszcze zweryfikowany.
            </p>
          </div>
          <button
            onClick={handleResend}
            disabled={sending || sent}
            className="text-sm font-medium text-amber-800 hover:text-amber-900 dark:text-amber-200 dark:hover:text-amber-100 underline disabled:opacity-50 disabled:no-underline"
          >
            {sent ? 'Wysłano!' : sending ? 'Wysyłanie...' : 'Wyślij ponownie'}
          </button>
        </div>
      </div>
    </div>
  );
}
