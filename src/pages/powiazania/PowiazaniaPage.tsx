import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { usePowiazaniaStore } from '@/stores/powiazaniaStore';
import {
  PowiazaniaGrid,
  PowiazaniaCategoryRow,
  PowiazaniaControls,
  PowiazaniaLives,
  PowiazaniaModal,
} from '@/components/powiazania';
import '@/components/powiazania/powiazania.css';

export function PowiazaniaPage() {
  // Use individual selectors to avoid infinite loops
  const puzzle = usePowiazaniaStore((state) => state.puzzle);
  const words = usePowiazaniaStore((state) => state.words);
  const selectedWords = usePowiazaniaStore((state) => state.selectedWords);
  const solvedCategories = usePowiazaniaStore((state) => state.solvedCategories);
  const guesses = usePowiazaniaStore((state) => state.guesses);
  const mistakes = usePowiazaniaStore((state) => state.mistakes);
  const maxMistakes = usePowiazaniaStore((state) => state.maxMistakes);
  const status = usePowiazaniaStore((state) => state.status);
  const hintUsed = usePowiazaniaStore((state) => state.hintUsed);
  const hintCategoryIndex = usePowiazaniaStore((state) => state.hintCategoryIndex);
  const isLoading = usePowiazaniaStore((state) => state.isLoading);

  // Actions (stable references)
  const init = usePowiazaniaStore((state) => state.init);
  const toggleWord = usePowiazaniaStore((state) => state.toggleWord);
  const submitGuess = usePowiazaniaStore((state) => state.submitGuess);
  const useHint = usePowiazaniaStore((state) => state.useHint);
  const reset = usePowiazaniaStore((state) => state.reset);

  // Derived values
  const canSubmit = selectedWords.length === 4 && status === 'playing';
  const solvedCategoriesData = solvedCategories
    .map((idx) => ({
      category: puzzle?.categories[idx],
      index: idx,
    }))
    .sort((a, b) => (a.category?.difficulty ?? 0) - (b.category?.difficulty ?? 0));

  // Animation states
  const [shakeGrid, setShakeGrid] = useState(false);
  const [successAnimationWordIds, setSuccessAnimationWordIds] = useState<string[]>([]);
  const [successAnimationColor, setSuccessAnimationColor] = useState('');
  const [exitAnimationWordIds, setExitAnimationWordIds] = useState<string[]>([]);
  const [animatingWordIds, setAnimatingWordIds] = useState<string[]>([]);
  const [pushingDownTileIds, setPushingDownTileIds] = useState<string[]>([]);
  const [pushingDownCategoryIndices, setPushingDownCategoryIndices] = useState<number[]>([]);
  const [animatingCategoryIndex, setAnimatingCategoryIndex] = useState<number | null>(null);
  const [animatingCategoryIsRevealing, setAnimatingCategoryIsRevealing] = useState(false);
  const [animatingRowIndex, setAnimatingRowIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  // Initialize visibleSolvedCategories from store (lazy initial state)
  const [visibleSolvedCategories, setVisibleSolvedCategories] = useState<number[]>(() => {
    const initialSolved = usePowiazaniaStore.getState().solvedCategories;
    return [...initialSolved];
  });

  // Ref to track if init has been called
  const hasInitialized = useRef(false);

  // Initialize store on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      init();
    }
  }, [init]);

  const getRowIndexForWords = useCallback(
    (wordIds: string[]): number => {
      const allWords = words.filter((w) => !w.isSolved);
      const firstWordIndex = allWords.findIndex((w) => wordIds.includes(w.id));
      return Math.floor(firstWordIndex / 4);
    },
    [words]
  );

  const getTilesForPushDown = useCallback(
    (solvedWordIds: string[]): string[] => {
      const allWords = words.filter((w) => !w.isSolved);
      return allWords.filter((w) => !solvedWordIds.includes(w.id)).map((w) => w.id);
    },
    [words]
  );

  const getCategoriesThatNeedToPushDown = useCallback(
    (newCategoryIndex: number): number[] => {
      if (!puzzle) return [];
      const newDifficulty = puzzle.categories[newCategoryIndex].difficulty;
      return solvedCategories.filter((idx) => {
        const existingDifficulty = puzzle.categories[idx].difficulty;
        return existingDifficulty > newDifficulty;
      });
    },
    [puzzle, solvedCategories]
  );

  const handleSubmit = useCallback(() => {
    if (isAnimating) return;

    const currentSelectedWords = [...selectedWords];
    const rowIndex = getRowIndexForWords(currentSelectedWords);
    const tilesForPushDown = getTilesForPushDown(currentSelectedWords);

    const result = submitGuess();
    if (!result) return;

    if (result.isCorrect) {
      setIsAnimating(true);

      const categoryIndex = result.categoryIndex!;
      const category = puzzle?.categories[categoryIndex];
      const categoryColor = category?.color || '#000';

      setAnimatingRowIndex(rowIndex);
      setAnimatingWordIds(currentSelectedWords);

      // Phase 1: Success pulse (0-120ms)
      setSuccessAnimationWordIds(currentSelectedWords);
      setSuccessAnimationColor(categoryColor);

      // Phase 2: At 120ms
      setTimeout(() => {
        setSuccessAnimationWordIds([]);
        setExitAnimationWordIds(currentSelectedWords);
        setPushingDownTileIds(tilesForPushDown);
        setPushingDownCategoryIndices(getCategoriesThatNeedToPushDown(categoryIndex));
        setAnimatingCategoryIndex(categoryIndex);
        // Get fresh solved categories from store
        const freshSolvedCategories = usePowiazaniaStore.getState().solvedCategories;
        setVisibleSolvedCategories([...freshSolvedCategories]);

        // Trigger reveal animation after small delay
        setTimeout(() => {
          setAnimatingCategoryIsRevealing(true);
        }, 50);
      }, 120);

      // Phase 3: Cleanup at 570ms
      setTimeout(() => {
        setExitAnimationWordIds([]);
        setAnimatingWordIds([]);
        setPushingDownTileIds([]);
        setPushingDownCategoryIndices([]);
        setAnimatingCategoryIndex(null);
        setAnimatingCategoryIsRevealing(false);
        setAnimatingRowIndex(null);
        setIsAnimating(false);
      }, 570);

      return;
    } else if (result.isOneAway) {
      toast('Prawie! Jedno słowo od rozwiązania.', {
        position: 'top-center',
        duration: 2000,
        className: 'text-orange-500',
      });
      setShakeGrid(true);
      setTimeout(() => setShakeGrid(false), 500);
    } else {
      setShakeGrid(true);
      setTimeout(() => setShakeGrid(false), 500);
    }
  }, [
    isAnimating,
    selectedWords,
    puzzle,
    submitGuess,
    getRowIndexForWords,
    getTilesForPushDown,
    getCategoriesThatNeedToPushDown,
  ]);

  const filteredWords = words.filter(
    (w) => !w.isSolved || animatingWordIds.includes(w.id)
  );

  if (isLoading) {
    return (
      <div
        className="mx-auto px-4 py-6 flex flex-col max-w-[32rem] lg:max-w-[44rem] min-h-[calc(100vh-120px)] justify-center"
        style={{ '--pow-tile-gap': '0.5rem' } as React.CSSProperties}
      >
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-pulse text-black/40 text-sm tracking-[0.05em]">
            Ładowanie...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mx-auto px-4 py-6 flex flex-col max-w-[32rem] lg:max-w-[44rem] lg:px-8 lg:py-12 min-h-[calc(100vh-120px)] justify-center"
      style={
        {
          '--pow-tile-gap': '0.5rem',
          '--pow-tile-size': 'calc((min(100vw, 32rem) - 2rem - 3 * 0.5rem) / 4)',
        } as React.CSSProperties
      }
    >
      <div className="flex flex-col w-full">
        {/* Lives indicator */}
        <PowiazaniaLives mistakes={mistakes} maxMistakes={maxMistakes} />

        {/* Game area */}
        <div className="relative">
          {/* Solved categories */}
          {solvedCategoriesData.map(({ category, index }, i) => {
            if (!category || !visibleSolvedCategories.includes(index)) return null;
            return (
              <PowiazaniaCategoryRow
                key={category.name}
                category={category}
                isPositionedAbsolute={animatingCategoryIndex === index}
                isRevealing={animatingCategoryIndex === index && animatingCategoryIsRevealing}
                isPushingDown={pushingDownCategoryIndices.includes(index)}
                animatingRowIndex={animatingRowIndex}
                solvedCategoriesCount={i}
              />
            );
          })}

          {/* Game grid */}
          <div className={cn('relative z-[1]', shakeGrid && 'animate-shake')}>
            <PowiazaniaGrid
              words={filteredWords}
              successAnimationWordIds={successAnimationWordIds}
              successAnimationColor={successAnimationColor}
              exitAnimationWordIds={exitAnimationWordIds}
              pushingDownTileIds={pushingDownTileIds}
              onToggle={toggleWord}
            />
          </div>
        </div>

        {/* Controls */}
        <PowiazaniaControls
          canSubmit={canSubmit}
          hintUsed={hintUsed}
          gameStatus={status}
          onSubmit={handleSubmit}
          onHint={useHint}
        />

        {/* Hint display */}
        {hintUsed && hintCategoryIndex !== null && (
          <div className="text-center py-4 text-sm text-black/60">
            Kategoria:{' '}
            <span className="font-semibold">
              {puzzle?.categories[hintCategoryIndex].name}
            </span>
          </div>
        )}
      </div>

      {/* Game Over Modal */}
      {status !== 'playing' && (
        <PowiazaniaModal
          status={status}
          puzzle={puzzle}
          guesses={guesses}
          onPlayAgain={reset}
        />
      )}
    </div>
  );
}
