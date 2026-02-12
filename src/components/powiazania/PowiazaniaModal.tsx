import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { GameStatus, PowiazaniaPuzzle, PowiazaniaGuess } from '@/types/powiazania';
import { PowiazaniaShare } from './PowiazaniaShare';

interface PowiazaniaModalProps {
  status: GameStatus;
  puzzle: PowiazaniaPuzzle | null;
  guesses: PowiazaniaGuess[];
  onPlayAgain: () => void;
}

export function PowiazaniaModal({
  status,
  puzzle,
  guesses,
  onPlayAgain,
}: PowiazaniaModalProps) {
  const { t } = useTranslation('powiazania');
  // In React 18+, createPortal works during SSR, so no need for mounted state
  if (typeof document === 'undefined') return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white text-black border border-black/10 p-6 max-w-sm w-full text-center animate-in fade-in zoom-in-95 duration-200 dark:bg-zinc-900 dark:text-white dark:border-white/10"
        style={{ fontFamily: "'HK Grotesk', sans-serif" }}
      >
        <h2 className="text-xl mb-2">
          {status === 'won' ? t('congratulations') : t('gameOver')}
        </h2>

        {puzzle && (
          <div className="my-4 space-y-2">
            {[...puzzle.categories]
              .sort((a, b) => a.difficulty - b.difficulty)
              .map((category) => (
                <div
                  key={category.name}
                  className="p-2 text-white text-xs"
                  style={{ backgroundColor: category.color }}
                >
                  <div className="uppercase tracking-[0.08em]">{category.name}</div>
                  <div className="opacity-80">{category.words.join(', ')}</div>
                </div>
              ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 mt-4 w-full">
          <div className="flex-1">
            <PowiazaniaShare puzzle={puzzle} guesses={guesses} />
          </div>
          <button
            className="flex-1 px-6 py-2 text-[11px] tracking-[0.08em] uppercase bg-black text-white hover:opacity-80 transition-opacity w-full dark:bg-white dark:text-black"
            onClick={onPlayAgain}
          >
            {t('playAgain')}
          </button>
        </div>

        <p className="mt-3 text-[10px] text-black/50 dark:text-white/50">
          {t('newPuzzleDaily')}
        </p>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
