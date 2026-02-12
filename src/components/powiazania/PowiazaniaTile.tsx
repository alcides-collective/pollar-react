import { cn } from '@/lib/utils';
import type { PowiazaniaWord } from '@/types/powiazania';
import './powiazania.css';

interface PowiazaniaTileProps {
  word: PowiazaniaWord;
  animateSuccess?: boolean;
  successColor?: string;
  animateExit?: boolean;
  exitDelay?: number;
  pushDown?: boolean;
  onClick: () => void;
}

export function PowiazaniaTile({
  word,
  animateSuccess = false,
  successColor = '',
  animateExit = false,
  exitDelay = 0,
  pushDown = false,
  onClick,
}: PowiazaniaTileProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'p-1 overflow-hidden',
        'flex items-center justify-center text-center',
        'text-[11px] sm:text-xs uppercase tracking-[0.05em] leading-tight',
        'border transition-all duration-150',
        word.isSelected
          ? 'bg-black text-white border-transparent dark:bg-white dark:text-black'
          : 'bg-white text-black border-black/10 hover:border-black dark:bg-white/10 dark:text-white dark:border-white/10 dark:hover:border-white',
        animateSuccess && 'success-pulse',
        animateExit && 'tile-exiting',
        pushDown && 'tile-pushing-down'
      )}
      style={{
        ...(animateSuccess ? { '--category-color': successColor } as React.CSSProperties : {}),
        ...(animateExit ? { animationDelay: `${exitDelay}ms` } : {}),
      }}
      disabled={word.isSolved}
    >
      <span className="line-clamp-2 break-words">{word.text}</span>
    </button>
  );
}
