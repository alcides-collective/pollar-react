import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/stores/authStore';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { PasswordResetForm } from './PasswordResetForm';

export function AuthModal() {
  const { t } = useTranslation('auth');
  const isOpen = useAuthStore((s) => s.isAuthModalOpen);
  const view = useAuthStore((s) => s.authModalView);
  const closeModal = useAuthStore((s) => s.closeAuthModal);

  const titles = {
    login: t('modal.login'),
    register: t('modal.register'),
    reset: t('modal.reset'),
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {titles[view]}
          </DialogTitle>
        </DialogHeader>

        {view === 'login' && <LoginForm />}
        {view === 'register' && <RegisterForm />}
        {view === 'reset' && <PasswordResetForm />}
      </DialogContent>
    </Dialog>
  );
}
