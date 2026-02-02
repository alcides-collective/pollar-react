export interface PowiazaniaCategory {
  name: string;
  words: string[];
  difficulty: 1 | 2 | 3 | 4;
  color: string;
}

export interface PowiazaniaPuzzle {
  id: string;
  date: string;
  categories: PowiazaniaCategory[];
  reasoning?: string | null;
}

export interface PowiazaniaWord {
  id: string;
  text: string;
  categoryIndex: number;
  isSelected: boolean;
  isSolved: boolean;
}

export interface PowiazaniaGuess {
  words: string[];
  isCorrect: boolean;
  categoryIndex: number | null;
  isOneAway: boolean;
}

export type GameStatus = 'playing' | 'won' | 'lost';

export interface PowiazaniaGameState {
  puzzle: PowiazaniaPuzzle | null;
  words: PowiazaniaWord[];
  selectedWords: string[];
  solvedCategories: number[];
  guesses: PowiazaniaGuess[];
  mistakes: number;
  maxMistakes: number;
  status: GameStatus;
  hintUsed: boolean;
  hintCategoryIndex: number | null;
  isLoading: boolean;
  isMock: boolean;
}

export const DIFFICULTY_COLORS: Record<1 | 2 | 3 | 4, string> = {
  1: '#1abc9c', // Teal - easiest
  2: '#3498db', // Blue
  3: '#f39c12', // Orange
  4: '#e74c3c', // Red - hardest
};

export const mockPuzzle: PowiazaniaPuzzle = {
  id: 'puzzle-mock',
  date: new Date().toISOString().split('T')[0],
  categories: [
    {
      name: 'Polskie tańce narodowe',
      words: ['Polonez', 'Mazur', 'Krakowiak', 'Kujawiak'],
      difficulty: 1,
      color: DIFFICULTY_COLORS[1],
    },
    {
      name: 'Modele samochodów',
      words: ['Mustang', 'Garbus', 'Puma', 'Impala'],
      difficulty: 2,
      color: DIFFICULTY_COLORS[2],
    },
    {
      name: 'Figury szachowe',
      words: ['Goniec', 'Skoczek', 'Wieża', 'Hetman'],
      difficulty: 3,
      color: DIFFICULTY_COLORS[3],
    },
    {
      name: '_____ MORSKI/A (stworzenia)',
      words: ['Świnka', 'Gwiazda', 'Krowa', 'Konik'],
      difficulty: 4,
      color: DIFFICULTY_COLORS[4],
    },
  ],
};
