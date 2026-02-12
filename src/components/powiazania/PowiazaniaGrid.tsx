import type { PowiazaniaWord } from '@/types/powiazania';
import { PowiazaniaTile } from './PowiazaniaTile';

interface PowiazaniaGridProps {
  words: PowiazaniaWord[];
  successAnimationWordIds: string[];
  successAnimationColor: string;
  exitAnimationWordIds: string[];
  pushingDownTileIds: string[];
  onToggle: (wordId: string) => void;
}

export function PowiazaniaGrid({
  words,
  successAnimationWordIds,
  successAnimationColor,
  exitAnimationWordIds,
  pushingDownTileIds,
  onToggle,
}: PowiazaniaGridProps) {
  function shouldAnimateSuccess(wordId: string): boolean {
    return successAnimationWordIds.includes(wordId);
  }

  function shouldAnimateExit(wordId: string): boolean {
    return exitAnimationWordIds.includes(wordId);
  }

  function getExitDelay(wordId: string): number {
    const index = exitAnimationWordIds.indexOf(wordId);
    return index >= 0 ? index * 30 : 0;
  }

  function shouldPushDown(wordId: string): boolean {
    return pushingDownTileIds.includes(wordId);
  }

  return (
    <div className="grid grid-cols-4 gap-2 mb-4" style={{ gridAutoRows: 'var(--pow-tile-size)' }}>
      {words.map((word) => (
        <PowiazaniaTile
          key={word.id}
          word={word}
          animateSuccess={shouldAnimateSuccess(word.id)}
          successColor={successAnimationColor}
          animateExit={shouldAnimateExit(word.id)}
          exitDelay={getExitDelay(word.id)}
          pushDown={shouldPushDown(word.id)}
          onClick={() => onToggle(word.id)}
        />
      ))}
    </div>
  );
}
