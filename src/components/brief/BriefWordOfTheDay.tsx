import type { WordOfTheDay } from '../../types/brief';
import { decodeHtmlEntities } from '../../utils/text';

interface BriefWordOfTheDayProps {
  word: WordOfTheDay;
}

export function BriefWordOfTheDay({ word }: BriefWordOfTheDayProps) {
  return (
    <div className="p-5 rounded-lg border border-zinc-200 bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
      <h2 className="text-sm text-zinc-500 mb-3 pb-2 border-b border-zinc-200 font-medium">
        Słowo dnia
      </h2>

      {/* Word + Etymology */}
      <div className="mb-4">
        <span className="text-2xl font-medium text-zinc-900">{word.word}</span>
        <span className="block text-sm italic text-zinc-500 mt-1">
          {decodeHtmlEntities(word.etymology)}
        </span>
      </div>

      {/* Definitions */}
      <div className="space-y-3">
        <div>
          <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
            Definicja
          </span>
          <p className="text-sm text-zinc-700 mt-1">
            {decodeHtmlEntities(word.encyclopedicDefinition)}
          </p>
        </div>
        <div className="opacity-70">
          <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
            Komentarz
          </span>
          <p className="text-sm text-zinc-700 mt-1">
            {decodeHtmlEntities(word.editorialDefinition)}
          </p>
        </div>
      </div>
    </div>
  );
}
