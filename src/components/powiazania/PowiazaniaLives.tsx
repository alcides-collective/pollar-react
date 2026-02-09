import { cn } from '@/lib/utils';

interface PowiazaniaLivesProps {
  mistakes: number;
  maxMistakes: number;
}

export function PowiazaniaLives({ mistakes, maxMistakes }: PowiazaniaLivesProps) {
  const remaining = maxMistakes - mistakes;

  return (
    <div className="mb-4 w-full">
      <div className="flex gap-2 w-full">
        {Array.from({ length: maxMistakes }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-2.5 flex-1 border transition-colors',
              i < remaining
                ? 'bg-black border-transparent dark:bg-white'
                : 'bg-black/10 border-black/10 dark:bg-white/10 dark:border-white/10'
            )}
          />
        ))}
      </div>
    </div>
  );
}
