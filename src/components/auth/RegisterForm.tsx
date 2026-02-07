import { useState, type FormEvent } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore, useAuthError } from '@/stores/authStore';
import { SocialLoginButtons } from './SocialLoginButtons';
import { AuthDivider } from './AuthDivider';
import { LocalizedLink } from '@/components/LocalizedLink';
import {
  isValidEmail,
  isValidPassword,
  isValidName,
} from '@/lib/auth-errors';
import type { ConsentData } from '@/types/auth';

export function RegisterForm() {
  const { t } = useTranslation('auth');
  const { t: tErrors } = useTranslation('errors');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const signUp = useAuthStore((s) => s.signUpWithEmail);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const signInWithApple = useAuthStore((s) => s.signInWithApple);
  const setView = useAuthStore((s) => s.setAuthModalView);
  const clearError = useAuthStore((s) => s.clearError);
  const isLoading = useAuthStore((s) => s.isLoading);
  const storeError = useAuthError();

  const error = localError || storeError;
  const consentsValid = acceptTerms && acceptPrivacy;

  const getConsents = (): ConsentData => ({
    terms: acceptTerms,
    privacy: acceptPrivacy,
    marketing: acceptMarketing,
  });

  const validateForm = (): boolean => {
    if (!acceptTerms) {
      setLocalError(tErrors('auth.termsRequired'));
      return false;
    }
    if (!acceptPrivacy) {
      setLocalError(tErrors('auth.privacyRequired'));
      return false;
    }
    if (!isValidName(displayName)) {
      setLocalError(tErrors('auth.nameTooShort'));
      return false;
    }
    if (!isValidEmail(email)) {
      setLocalError(tErrors('auth.invalidEmailFormat'));
      return false;
    }
    if (!isValidPassword(password)) {
      setLocalError(tErrors('auth.passwordTooShort'));
      return false;
    }
    if (password !== confirmPassword) {
      setLocalError(tErrors('auth.passwordsDontMatch'));
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
      await signUp(email, password, displayName.trim(), getConsents());
    } catch {
      // Error is handled in store
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle(getConsents());
    } catch {
      // Error is handled in store
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple(getConsents());
    } catch {
      // Error is handled in store
    }
  };

  const passwordRequirements = [
    { met: password.length >= 6, text: t('register.minChars') },
    { met: password === confirmPassword && password.length > 0, text: t('register.passwordsMatch') },
  ];

  return (
    <div className="space-y-4">
      {/* Consent checkboxes — gate both social and email registration */}
      <div className="space-y-3">
        {!(acceptTerms && acceptPrivacy && acceptMarketing) && (
          <button
            type="button"
            onClick={() => {
              setAcceptTerms(true);
              setAcceptPrivacy(true);
              setAcceptMarketing(true);
            }}
            className="text-xs text-content-faint hover:text-content transition-colors underline"
          >
            {t('register.selectAll')}
          </button>
        )}
        <label className="flex items-start gap-2.5 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-0.5 rounded border-zinc-600 bg-zinc-800 text-zinc-100 focus:ring-divider shrink-0"
          />
          <span className="text-content-faint text-xs leading-relaxed">
            <Trans
              i18nKey="register.acceptTerms"
              ns="auth"
              components={{
                termsLink: (
                  <LocalizedLink
                    to="/regulamin"
                    target="_blank"
                    className="text-content underline hover:text-white"
                  />
                ),
              }}
            />
            <span className="text-red-400"> *</span>
          </span>
        </label>

        <label className="flex items-start gap-2.5 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={acceptPrivacy}
            onChange={(e) => setAcceptPrivacy(e.target.checked)}
            className="mt-0.5 rounded border-zinc-600 bg-zinc-800 text-zinc-100 focus:ring-divider shrink-0"
          />
          <span className="text-content-faint text-xs leading-relaxed">
            <Trans
              i18nKey="register.acceptPrivacy"
              ns="auth"
              components={{
                privacyLink: (
                  <LocalizedLink
                    to="/polityka-prywatnosci"
                    target="_blank"
                    className="text-content underline hover:text-white"
                  />
                ),
              }}
            />
            <span className="text-red-400"> *</span>
          </span>
        </label>

        <label className="flex items-start gap-2.5 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={acceptMarketing}
            onChange={(e) => setAcceptMarketing(e.target.checked)}
            className="mt-0.5 rounded border-zinc-600 bg-zinc-800 text-zinc-100 focus:ring-divider shrink-0"
          />
          <span className="text-content-faint text-xs leading-relaxed">
            {t('register.acceptMarketing')}
          </span>
        </label>
      </div>

      <SocialLoginButtons
        disabled={!consentsValid}
        onGoogle={handleGoogleSignIn}
        onApple={handleAppleSignIn}
      />
      <AuthDivider />

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-500/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <Input
            type="text"
            placeholder={t('register.firstName')}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={isLoading}
            required
            autoComplete="name"
          />
          <Input
            type="email"
            placeholder={t('register.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder={t('register.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
            autoComplete="new-password"
          />
          <Input
            type="password"
            placeholder={t('register.repeatPassword')}
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
                    ? 'text-green-400'
                    : 'text-content-subtle'
                }`}
              >
                <span>{req.met ? '\u2713' : '\u25CB'}</span>
                <span>{req.text}</span>
              </div>
            ))}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading || !consentsValid}>
          {isLoading ? t('register.loading') : t('register.title')}
        </Button>

        <p className="text-center text-sm text-content-faint">
          {t('register.hasAccount')}{' '}
          <button
            type="button"
            onClick={() => setView('login')}
            className="font-medium text-content hover:text-white hover:underline transition-colors"
          >
            {t('register.login')}
          </button>
        </p>
      </form>
    </div>
  );
}
