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

const titles = {
  login: 'Zaloguj się',
  register: 'Utwórz konto',
  reset: 'Zresetuj hasło',
};

export function AuthModal() {
  const isOpen = useAuthStore((s) => s.isAuthModalOpen);
  const view = useAuthStore((s) => s.authModalView);
  const closeModal = useAuthStore((s) => s.closeAuthModal);

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
