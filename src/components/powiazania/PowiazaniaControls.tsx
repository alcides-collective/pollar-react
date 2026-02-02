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
  return (
    <div className="flex justify-center gap-2 mt-4 w-full">
      <button
        className={cn(
          'flex-1 px-4 py-2 text-[11px] tracking-[0.08em] uppercase',
          'border border-black/10 transition-colors',
          'hover:bg-black hover:text-white',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-black'
        )}
        onClick={onHint}
        disabled={hintUsed || gameStatus !== 'playing'}
      >
        Podpowiedź
      </button>

      <button
        className={cn(
          'flex-1 px-6 py-2 text-[11px] tracking-[0.08em] uppercase transition-colors',
          canSubmit
            ? 'bg-black text-white hover:opacity-80'
            : 'bg-black/10 text-black/40 cursor-not-allowed'
        )}
        onClick={onSubmit}
        disabled={!canSubmit}
      >
        Sprawdź
      </button>
    </div>
  );
}
