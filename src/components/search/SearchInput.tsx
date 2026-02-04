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
          'absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500',
          isLoading && 'animate-pulse text-zinc-400'
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
          // Glass input style
          'bg-white/5 border-b border-white/10',
          'text-zinc-100',
          'placeholder:text-zinc-500',
          'focus:outline-none focus:bg-white/[0.07] focus:border-white/20',
          'transition-all duration-200'
        )}
      />

      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="size-5" />
        </button>
      )}
    </div>
  );
}
