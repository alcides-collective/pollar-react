import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const isLoading = useAuthStore((s) => s.isLoading);

  const canDelete = confirmText === 'USUŃ KONTO';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!canDelete) {
      setError('Wpisz "USUŃ KONTO" aby potwierdzić');
      return;
    }

    try {
      await deleteAccount(password);
      toast.success('Konto zostało usunięte');
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
          <DialogTitle className="text-red-600">Usuń konto</DialogTitle>
          <DialogDescription>
            Ta operacja jest nieodwracalna. Wszystkie Twoje dane zostaną trwale usunięte.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
            <p className="font-medium mb-2">Usunięte zostaną:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Twój profil i dane osobowe</li>
              <li>Zapisane wydarzenia</li>
              <li>Preferencje kategorii</li>
              <li>Historia aktywności</li>
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
              placeholder="Wprowadź hasło"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="current-password"
            />
            <div>
              <label className="block text-sm text-zinc-600 mb-1.5">
                Wpisz <span className="font-mono font-medium">USUŃ KONTO</span> aby potwierdzić:
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
              Anuluj
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isLoading || !canDelete}
            >
              {isLoading ? 'Usuwam...' : 'Usuń konto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
