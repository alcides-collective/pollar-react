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
      <SearchX className="size-12 mx-auto text-content mb-3" />

      <p className="text-content-faint">
        {t('noResults')} <span className="font-medium text-content-faint">"{query}"</span>
      </p>

      {suggestions.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-content-subtle mb-2">
            {t('didYouMean')}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSuggestionSelect(suggestion)}
                className="px-3 py-1.5 text-sm rounded-lg bg-white/10 text-content-faint hover:bg-white/15 hover:text-white border border-white/5 hover:border-white/10 transition-all duration-150"
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
