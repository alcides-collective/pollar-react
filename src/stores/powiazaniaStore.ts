import { create } from 'zustand';
import type {
  PowiazaniaPuzzle,
  PowiazaniaWord,
  PowiazaniaGuess,
  PowiazaniaGameState,
  GameStatus,
} from '@/types/powiazania';
import { mockPuzzle } from '@/types/powiazania';
import { API_BASE } from '@/config/api';

const STORAGE_KEY = 'pollar.powiazania';
const MAX_MISTAKES = 4;
const MAX_SELECTION = 4;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function initializeWords(puzzle: PowiazaniaPuzzle): PowiazaniaWord[] {
  const words: PowiazaniaWord[] = [];
  puzzle.categories.forEach((category, categoryIndex) => {
    category.words.forEach((word, wordIndex) => {
      words.push({
        id: `${categoryIndex}-${wordIndex}`,
        text: word,
        categoryIndex,
        isSelected: false,
        isSolved: false,
      });
    });
  });
  return words;
}

async function fetchPuzzleFromApi(): Promise<PowiazaniaPuzzle | null> {
  try {
    const response = await fetch(`${API_BASE}/powiazania/today`);
    if (!response.ok) {
      console.warn('Failed to fetch puzzle from API:', response.status);
      return null;
    }
    const puzzle = await response.json();
    return puzzle as PowiazaniaPuzzle;
  } catch (error) {
    console.warn('Error fetching puzzle from API:', error);
    return null;
  }
}

function saveState(state: PowiazaniaGameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save game state:', e);
  }
}

function loadState(): PowiazaniaGameState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as PowiazaniaGameState;
    }
  } catch (e) {
    console.warn('Failed to load game state:', e);
  }
  return null;
}

const initialState: PowiazaniaGameState = {
  puzzle: null,
  words: [],
  selectedWords: [],
  solvedCategories: [],
  guesses: [],
  mistakes: 0,
  maxMistakes: MAX_MISTAKES,
  status: 'playing',
  hintUsed: false,
  hintCategoryIndex: null,
  isLoading: true,
  isMock: false,
};

interface PowiazaniaStore extends PowiazaniaGameState {
  init: () => Promise<void>;
  toggleWord: (wordId: string) => void;
  submitGuess: () => PowiazaniaGuess | null;
  shuffle: () => void;
  deselectAll: () => void;
  useHint: () => void;
  reset: () => void;
}

export const usePowiazaniaStore = create<PowiazaniaStore>((set, get) => ({
  ...initialState,

  init: async () => {
    // Try to restore from localStorage
    const saved = loadState();
    if (saved) {
      const today = new Date().toISOString().split('T')[0];
      if (saved.puzzle?.date === today) {
        // Try to fetch fresh puzzle to ensure API wins over stale cache/mock
        try {
          const fresh = await fetchPuzzleFromApi();
          if (fresh && fresh.date === today) {
            const words = initializeWords(fresh);
            const newState: PowiazaniaGameState = {
              ...initialState,
              puzzle: fresh,
              words: shuffleArray(words),
              isLoading: false,
            };
            set(newState);
            saveState(newState);
            return;
          }
        } catch {
          console.warn('Failed to refresh puzzle from API, using cached puzzle');
        }
        set({ ...saved, isLoading: false });
        return;
      }
    }

    // Set loading state
    set({ isLoading: true });

    // Try to fetch from API first
    let puzzle = await fetchPuzzleFromApi();
    let isMock = false;

    // Fall back to mock data if API fails
    if (!puzzle) {
      console.log('Using mock puzzle data');
      puzzle = { ...mockPuzzle, date: new Date().toISOString().split('T')[0] };
      isMock = true;
    }

    const newState: PowiazaniaGameState = {
      ...initialState,
      puzzle,
      words: shuffleArray(initializeWords(puzzle)),
      isLoading: false,
      isMock,
    };
    set(newState);
    saveState(newState);
  },

  toggleWord: (wordId: string) => {
    const state = get();
    if (state.status !== 'playing') return;

    const word = state.words.find((w) => w.id === wordId);
    if (!word || word.isSolved) return;

    const isCurrentlySelected = state.selectedWords.includes(wordId);

    if (isCurrentlySelected) {
      const newState = {
        ...state,
        selectedWords: state.selectedWords.filter((id) => id !== wordId),
        words: state.words.map((w) =>
          w.id === wordId ? { ...w, isSelected: false } : w
        ),
      };
      set(newState);
      saveState(newState);
      return;
    }

    if (state.selectedWords.length >= MAX_SELECTION) {
      return;
    }

    const newState = {
      ...state,
      selectedWords: [...state.selectedWords, wordId],
      words: state.words.map((w) =>
        w.id === wordId ? { ...w, isSelected: true } : w
      ),
    };
    set(newState);
    saveState(newState);
  },

  submitGuess: () => {
    const state = get();
    if (state.status !== 'playing') return null;
    if (state.selectedWords.length !== MAX_SELECTION) return null;

    const selectedWordObjects = state.selectedWords
      .map((id) => state.words.find((w) => w.id === id)!)
      .filter(Boolean);

    // Check if all selected words belong to the same category
    const categoryIndices = selectedWordObjects.map((w) => w.categoryIndex);
    const uniqueCategories = [...new Set(categoryIndices)];

    const isCorrect = uniqueCategories.length === 1;
    const categoryIndex = isCorrect ? categoryIndices[0] : null;

    // Check for "one away" (3 out of 4 correct)
    let isOneAway = false;
    if (!isCorrect && state.puzzle) {
      for (let cat = 0; cat < state.puzzle.categories.length; cat++) {
        const matchCount = categoryIndices.filter((idx) => idx === cat).length;
        if (matchCount === 3) {
          isOneAway = true;
          break;
        }
      }
    }

    const guess: PowiazaniaGuess = {
      words: selectedWordObjects.map((w) => w.text),
      isCorrect,
      categoryIndex,
      isOneAway,
    };

    let newMistakes = state.mistakes;
    let newStatus: GameStatus = state.status;
    const newSolvedCategories = [...state.solvedCategories];
    let newWords = state.words;

    if (isCorrect) {
      newSolvedCategories.push(categoryIndex!);
      newWords = state.words.map((w) =>
        w.categoryIndex === categoryIndex
          ? { ...w, isSolved: true, isSelected: false }
          : { ...w, isSelected: false }
      );

      if (newSolvedCategories.length === state.puzzle!.categories.length) {
        newStatus = 'won';
      }
    } else {
      newMistakes += 1;
      newWords = state.words.map((w) => ({ ...w, isSelected: false }));

      if (newMistakes >= MAX_MISTAKES) {
        newStatus = 'lost';
      }
    }

    const newState = {
      ...state,
      guesses: [...state.guesses, guess],
      mistakes: newMistakes,
      status: newStatus,
      solvedCategories: newSolvedCategories,
      words: newWords,
      selectedWords: [],
    };
    set(newState);
    saveState(newState);

    return guess;
  },

  shuffle: () => {
    const state = get();
    const unsolvedWords = state.words.filter((w) => !w.isSolved);
    const solvedWords = state.words.filter((w) => w.isSolved);

    set({
      words: [...solvedWords, ...shuffleArray(unsolvedWords)],
    });
  },

  deselectAll: () => {
    const state = get();
    set({
      selectedWords: [],
      words: state.words.map((w) => ({ ...w, isSelected: false })),
    });
  },

  useHint: () => {
    const state = get();
    if (state.hintUsed || state.status !== 'playing' || !state.puzzle) return;

    // Find first unsolved category (by difficulty - easiest first)
    const unsolvedCategories = state.puzzle.categories
      .map((cat, idx) => ({ ...cat, index: idx }))
      .filter((cat) => !state.solvedCategories.includes(cat.index))
      .sort((a, b) => a.difficulty - b.difficulty);

    if (unsolvedCategories.length === 0) return;

    const newState = {
      ...state,
      hintUsed: true,
      hintCategoryIndex: unsolvedCategories[0].index,
    };
    set(newState);
    saveState(newState);
  },

  reset: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear game state:', e);
    }
    get().init();
  },
}));

