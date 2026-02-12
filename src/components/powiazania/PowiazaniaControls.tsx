import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { GameStatus } from '@/types/powiazania';

interface PowiazaniaControlsProps {
  canSubmit: boolean;
  hintUsed: boolean;
  gameStatus: GameStatus;
  onSubmit: () => void;
  onHint: () => void;
}

export function PowiazaniaControls({
  canSubmit,
  hintUsed,
  gameStatus,
  onSubmit,
  onHint,
}: PowiazaniaControlsProps) {
  const { t } = useTranslation('powiazania');
  return (
    <div className="flex justify-center gap-2 mt-4 w-full">
      <button
        className={cn(
          'flex-1 px-4 py-2 text-[11px] tracking-[0.08em] uppercase',
          'border border-black/10 transition-colors dark:border-white/10 dark:text-white',
          'hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-black dark:disabled:hover:bg-transparent dark:disabled:hover:text-white'
        )}
        onClick={onHint}
        disabled={hintUsed || gameStatus !== 'playing'}
      >
        {t('hint')}
      </button>

      <button
        className={cn(
          'flex-1 px-6 py-2 text-[11px] tracking-[0.08em] uppercase transition-colors',
          canSubmit
            ? 'bg-black text-white hover:opacity-80 dark:bg-white dark:text-black'
            : 'bg-black/10 text-black/40 cursor-not-allowed dark:bg-white/10 dark:text-white/40'
        )}
        onClick={onSubmit}
        disabled={!canSubmit}
      >
        {t('check')}
      </button>
    </div>
  );
}
