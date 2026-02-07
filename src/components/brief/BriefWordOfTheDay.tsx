import type { WordOfTheDay } from '../../types/brief';
import { decodeHtmlEntities } from '../../utils/sanitize';

interface BriefWordOfTheDayProps {
  word: WordOfTheDay;
}

export function BriefWordOfTheDay({ word }: BriefWordOfTheDayProps) {
  return (
    <div className="p-5 rounded-lg border border-divider bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30">
      <h2 className="text-sm text-content-subtle mb-3 pb-2 border-b border-divider font-medium">
        Słowo dnia
      </h2>

      {/* Word + Etymology */}
      <div className="mb-4">
        <span className="text-2xl font-medium text-content-heading">{word.word}</span>
        <span className="block text-sm italic text-content-subtle mt-1">
          {decodeHtmlEntities(word.etymology)}
        </span>
      </div>

      {/* Definitions */}
      <div className="space-y-3">
        <div>
          <span className="text-xs uppercase tracking-wider text-content-faint font-semibold">
            Definicja
          </span>
          <p className="text-sm text-content mt-1">
            {decodeHtmlEntities(word.encyclopedicDefinition)}
          </p>
        </div>
        <div className="opacity-70">
          <span className="text-xs uppercase tracking-wider text-content-faint font-semibold">
            Komentarz
          </span>
          <p className="text-sm text-content mt-1">
            {decodeHtmlEntities(word.editorialDefinition)}
          </p>
        </div>
      </div>
    </div>
  );
}
