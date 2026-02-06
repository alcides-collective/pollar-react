import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
          <DialogDescription className="text-zinc-400 text-sm text-center">
            {t('consentModal.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5 rounded border-zinc-600 bg-zinc-800 text-zinc-100 focus:ring-zinc-500 shrink-0"
            />
            <span className="text-zinc-300 text-xs leading-relaxed">
              <Trans
                i18nKey="register.acceptTerms"
                ns="auth"
                components={{
                  termsLink: (
                    <LocalizedLink
                      to="/regulamin"
                      target="_blank"
                      className="text-zinc-100 underline hover:text-white"
                    />
                  ),
                }}
              />
              <span className="text-red-400"> *</span>
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptPrivacy}
              onChange={(e) => setAcceptPrivacy(e.target.checked)}
              className="mt-0.5 rounded border-zinc-600 bg-zinc-800 text-zinc-100 focus:ring-zinc-500 shrink-0"
            />
            <span className="text-zinc-300 text-xs leading-relaxed">
              <Trans
                i18nKey="register.acceptPrivacy"
                ns="auth"
                components={{
                  privacyLink: (
                    <LocalizedLink
                      to="/polityka-prywatnosci"
                      target="_blank"
                      className="text-zinc-100 underline hover:text-white"
                    />
                  ),
                }}
              />
              <span className="text-red-400"> *</span>
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptMarketing}
              onChange={(e) => setAcceptMarketing(e.target.checked)}
              className="mt-0.5 rounded border-zinc-600 bg-zinc-800 text-zinc-100 focus:ring-zinc-500 shrink-0"
            />
            <span className="text-zinc-400 text-xs leading-relaxed">
              {t('register.acceptMarketing')}
            </span>
          </label>
        </div>

        <Button
          className="w-full"
          disabled={!canSubmit}
          onClick={handleAccept}
        >
          {isSubmitting ? '...' : t('consentModal.accept')}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
