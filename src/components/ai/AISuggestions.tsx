import { useAISuggestions, useAILoading, useAIRemainingQueries } from '../../stores/aiStore';

interface AISuggestionsProps {
  onSelect: (suggestion: string) => void;
  variant?: 'grid' | 'list';
}

export function AISuggestions({ onSelect, variant = 'grid' }: AISuggestionsProps) {
  const suggestions = useAISuggestions();
  const isLoading = useAILoading();
  const remainingQueries = useAIRemainingQueries();

  // In dev mode, ignore rate limits
  const isDisabled = isLoading || (!import.meta.env.DEV && remainingQueries <= 0);

  if (variant === 'list') {
    // Used for follow-ups
    return (
      <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50 animate-fade-in">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSelect(suggestion)}
            disabled={isDisabled}
            className="text-sm text-left text-zinc-600 dark:text-zinc-400
                       border border-zinc-200 dark:border-zinc-700 rounded-lg
                       px-4 py-3 leading-relaxed
                       hover:bg-zinc-50 dark:hover:bg-zinc-800/50
                       hover:border-zinc-300 dark:hover:border-zinc-600
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors duration-150"
          >
            {suggestion}
          </button>
        ))}
      </div>
    );
  }

  // Grid for empty state
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8">
      <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-2">
        {suggestions.map((suggestion, i) => (
          <button
            key={suggestion}
            onClick={() => onSelect(suggestion)}
            disabled={isDisabled}
            style={{ animationDelay: `${i * 50}ms` }}
            className="text-sm text-left text-zinc-600 dark:text-zinc-400
                       border border-zinc-200 dark:border-zinc-700 rounded-lg
                       px-4 py-3.5 leading-relaxed
                       hover:bg-zinc-50 dark:hover:bg-zinc-800/50
                       hover:border-zinc-300 dark:hover:border-zinc-600
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors duration-150
                       animate-fade-in opacity-0 [animation-fill-mode:forwards]"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
