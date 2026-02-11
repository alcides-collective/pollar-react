import { toast } from 'sonner';
import i18next from 'i18next';

type BackendKey = 'main' | 'archive';

const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const lastToastTime = new Map<BackendKey, number>();

const translationKeys: Record<BackendKey, string> = {
  main: 'errors:general.mainServerUnavailable',
  archive: 'errors:general.archiveServerUnavailable',
};

export function showBackendErrorToast(backendKey: BackendKey, error: Error | null) {
  if (!error) return;

  const now = Date.now();
  const lastTime = lastToastTime.get(backendKey) ?? 0;

  if (now - lastTime < COOLDOWN_MS) return;

  lastToastTime.set(backendKey, now);
  const message = i18next.t(translationKeys[backendKey]);
  toast.error(message);
}
