import { useState } from 'react';
import type { PowiazaniaPuzzle, PowiazaniaGuess } from '@/types/powiazania';

interface PowiazaniaShareProps {
  puzzle: PowiazaniaPuzzle | null;
  guesses: PowiazaniaGuess[];
}

const EMOJI_MAP: Record<number, string> = {
  1: '\uD83D\uDFE9', // green
  2: '\uD83D\uDFE6', // blue
  3: '\uD83D\uDFE7', // orange
  4: '\uD83D\uDFE5', // red
};

export function PowiazaniaShare({ puzzle, guesses }: PowiazaniaShareProps) {
  const [copied, setCopied] = useState(false);

  function generateShareText(): string {
    if (!puzzle) return '';

    const lines: string[] = [`Powiązania ${puzzle.date}`, ''];

    guesses.forEach((guess) => {
      if (guess.isCorrect && guess.categoryIndex !== null) {
        const difficulty = puzzle.categories[guess.categoryIndex].difficulty;
        lines.push(EMOJI_MAP[difficulty].repeat(4));
      } else {
        const emojiLine = guess.words
          .map((word) => {
            const cat = puzzle.categories.find((c) => c.words.includes(word));
            return cat ? EMOJI_MAP[cat.difficulty] : '\u2B1C';
          })
          .join('');
        lines.push(emojiLine);
      }
    });

    lines.push('');
    lines.push('pollar.pl/powiazania');

    return lines.join('\n');
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  async function handleShare() {
    const text = generateShareText();

    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // User cancelled or share failed, fall back to clipboard
      }
    }

    await copyToClipboard(text);
  }

  return (
    <button
      className="w-full px-4 py-2 text-[11px] tracking-[0.08em] uppercase border border-black/10 hover:bg-black hover:text-white transition-colors dark:border-white/10 dark:text-white dark:hover:bg-white dark:hover:text-black"
      onClick={handleShare}
    >
      {copied ? 'Skopiowano!' : 'Udostępnij'}
    </button>
  );
}
