import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LocalizedLink } from '@/components/LocalizedLink';
import { useUserProfile, useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { updateUserConsents } from '@/services/userService';
import { CURRENT_TERMS_VERSION } from '@/types/auth';

export function ConsentRequiredModal() {
  const { t } = useTranslation('auth');
  const profile = useUserProfile();
  const user = useAuthStore((s) => s.user);
  const fetchProfile = useUserStore((s) => s.fetchProfile);

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Show for logged-in users whose accepted terms version is outdated or missing
  const needsConsent =
    user &&
    profile &&
    profile.consentTermsVersion !== CURRENT_TERMS_VERSION;

  if (!needsConsent) return null;

  const canSubmit = acceptTerms && acceptPrivacy && !isSubmitting;

  const handleAccept = async () => {
    if (!canSubmit || !profile) return;
    setIsSubmitting(true);
    try {
      await updateUserConsents(profile.id, {
        terms: true,
        privacy: true,
        marketing: acceptMarketing,
      });
      // Refresh profile to clear the modal
      await fetchProfile(profile.id);
    } catch (error) {
      console.error('Failed to update consents:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md max-h-[90vh] overflow-y-auto"
        hideCloseButton
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {t('consentModal.title')}
          </DialogTitle>
          <DialogDescription className="text-content-faint text-sm text-center">
            {t('consentModal.description')}
          </DialogDescription>
        </DialogHeader>

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
          <div
            className="flex items-start gap-2.5 cursor-pointer"
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.closest('a') || target.tagName === 'INPUT') return;
              setAcceptTerms((v) => !v);
            }}
          >
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5 rounded border-zinc-600 bg-zinc-800 text-zinc-100 focus:ring-divider shrink-0 accent-white"
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
                      className="text-white underline hover:text-white/80"
                    />
                  ),
                }}
              />
              <span className="text-red-400"> *</span>
            </span>
          </div>

          <div
            className="flex items-start gap-2.5 cursor-pointer"
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.closest('a') || target.tagName === 'INPUT') return;
              setAcceptPrivacy((v) => !v);
            }}
          >
            <input
              type="checkbox"
              checked={acceptPrivacy}
              onChange={(e) => setAcceptPrivacy(e.target.checked)}
              className="mt-0.5 rounded border-zinc-600 bg-zinc-800 text-zinc-100 focus:ring-divider shrink-0 accent-white"
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
                      className="text-white underline hover:text-white/80"
                    />
                  ),
                }}
              />
              <span className="text-red-400"> *</span>
            </span>
          </div>

          <div
            className="flex items-start gap-2.5 cursor-pointer"
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.tagName === 'INPUT') return;
              setAcceptMarketing((v) => !v);
            }}
          >
            <input
              type="checkbox"
              checked={acceptMarketing}
              onChange={(e) => setAcceptMarketing(e.target.checked)}
              className="mt-0.5 rounded border-zinc-600 bg-zinc-800 text-zinc-100 focus:ring-divider shrink-0 accent-white"
            />
            <span className="text-content-faint text-xs leading-relaxed">
              {t('register.acceptMarketing')}
            </span>
          </div>
        </div>

        <DialogFooter>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleAccept}
            className="w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors bg-background text-content-heading hover:bg-divider disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '...' : t('consentModal.accept')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
