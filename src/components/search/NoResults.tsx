import { useTranslation } from 'react-i18next';
import { SearchX } from 'lucide-react';

interface NoResultsProps {
  query: string;
  suggestions: string[];
  onSuggestionSelect: (suggestion: string) => void;
}

export function NoResults({ query, suggestions, onSuggestionSelect }: NoResultsProps) {
  const { t } = useTranslation('search');

  return (
    <div className="py-8 text-center">
      <SearchX className="size-12 mx-auto text-zinc-600 mb-3" />

      <p className="text-zinc-400">
        {t('noResults')} <span className="font-medium text-zinc-300">"{query}"</span>
      </p>

      {suggestions.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-zinc-500 mb-2">
            {t('didYouMean')}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSuggestionSelect(suggestion)}
                className="px-3 py-1.5 text-sm rounded-lg bg-white/10 text-zinc-300 hover:bg-white/15 hover:text-white border border-white/5 hover:border-white/10 transition-all duration-150"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
