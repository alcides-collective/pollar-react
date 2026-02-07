import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAccountDialog({ open, onOpenChange }: DeleteAccountDialogProps) {
  const { t } = useTranslation('profile');
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const isLoading = useAuthStore((s) => s.isLoading);

  const confirmTextRequired = t('deleteAccount.confirmText');
  const canDelete = confirmText === confirmTextRequired;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!canDelete) {
      setError(t('deleteAccount.confirmPrompt'));
      return;
    }

    try {
      await deleteAccount(password);
      toast.success(t('deleteAccount.success'));
      navigate('/');
    } catch {
      // Error is handled in store
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form on close
      setPassword('');
      setConfirmText('');
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">{t('deleteAccount.title')}</DialogTitle>
          <DialogDescription>
            {t('deleteAccount.warning')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
            <p className="font-medium mb-2">{t('deleteAccount.willBeDeleted')}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('deleteAccount.item1')}</li>
              <li>{t('deleteAccount.item2')}</li>
              <li>{t('deleteAccount.item3')}</li>
              <li>{t('deleteAccount.item4')}</li>
            </ul>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Input
              type="password"
              placeholder={t('deleteAccount.enterPassword')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="current-password"
            />
            <div>
              <label className="block text-sm text-content mb-1.5">
                {t('deleteAccount.typeToConfirm').split('<1>')[0]}
                <span className="font-mono font-medium">{confirmTextRequired}</span>
                {t('deleteAccount.typeToConfirm').split('</1>')[1]}
              </label>
              <Input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="off"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              {t('deleteAccount.cancel')}
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isLoading || !canDelete}
            >
              {isLoading ? t('deleteAccount.loading') : t('deleteAccount.submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
