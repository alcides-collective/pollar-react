import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  isLoading?: boolean;
  autoFocus?: boolean;
}

export function SearchInput({
  value,
  onChange,
  onClear,
  isLoading,
  autoFocus = true,
}: SearchInputProps) {
  const { t } = useTranslation('search');

  return (
    <div className="relative">
      <Search
        className={cn(
          'absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400',
          isLoading && 'animate-pulse'
        )}
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('placeholder')}
        autoFocus={autoFocus}
        className={cn(
          'w-full pl-12 pr-12 py-4 text-lg',
          'bg-transparent border-b border-zinc-200 dark:border-zinc-700',
          'text-zinc-900 dark:text-zinc-100',
          'placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
          'focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500',
          'transition-colors'
        )}
      />

      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="size-5 text-zinc-400" />
        </button>
      )}
    </div>
  );
}
