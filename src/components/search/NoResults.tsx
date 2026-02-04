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
      <SearchX className="size-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />

      <p className="text-zinc-600 dark:text-zinc-400">
        {t('noResults')} <span className="font-medium">"{query}"</span>
      </p>

      {suggestions.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-2">
            {t('didYouMean')}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSuggestionSelect(suggestion)}
                className="px-3 py-1.5 text-sm rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
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
