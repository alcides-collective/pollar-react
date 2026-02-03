import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const changePassword = useAuthStore((s) => s.changePassword);
  const isLoading = useAuthStore((s) => s.isLoading);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Nowe hasło musi mieć co najmniej 6 znaków');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Hasła nie są zgodne');
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      toast.success('Hasło zostało zmienione');
      onOpenChange(false);
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      // Error is handled in store
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form on close
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Zmień hasło</DialogTitle>
          <DialogDescription>
            Wprowadź obecne hasło oraz nowe hasło, które chcesz ustawić.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Input
              type="password"
              placeholder="Obecne hasło"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="current-password"
            />
            <Input
              type="password"
              placeholder="Nowe hasło"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="new-password"
            />
            <Input
              type="password"
              placeholder="Potwierdź nowe hasło"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Anuluj
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Zmieniam...' : 'Zmień hasło'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
