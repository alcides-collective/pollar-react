import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAIRemainingQueries, useAILoading } from '../../stores/aiStore';

interface AIInputProps {
  onSend: (message: string) => void;
  autoFocus?: boolean;
}

export function AIInput({ onSend, autoFocus = false }: AIInputProps) {
  const { t } = useTranslation('ai');
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isLoading = useAILoading();
  const remainingQueries = useAIRemainingQueries();

  // In dev mode, ignore rate limits
  const isDisabled = isLoading || (!import.meta.env.DEV && remainingQueries <= 0);
  const canSend = input.trim() && !isDisabled;

  // Auto focus on mount
  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = useCallback(() => {
    if (!canSend) return;
    onSend(input.trim());
    setInput('');
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input, canSend, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="px-4 py-4 pb-[max(16px,env(safe-area-inset-bottom))]">
      {/* Input container */}
      <div className="relative flex items-end gap-2 p-3 pr-2
                      bg-zinc-100 dark:bg-zinc-900
                      border border-zinc-200 dark:border-zinc-800
                      rounded-2xl shadow-sm
                      focus-within:border-zinc-300 dark:focus-within:border-zinc-700
                      transition-colors duration-150">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          placeholder="Zapytaj o wydarzenia..."
          rows={1}
          className="flex-1 resize-none bg-transparent text-base text-zinc-800 dark:text-zinc-200
                     placeholder:text-zinc-400 dark:placeholder:text-zinc-500
                     focus:outline-none disabled:opacity-50
                     py-1 px-1 min-h-[28px] max-h-[200px] leading-relaxed"
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Wyslij"
          className={`
            flex items-center justify-center w-9 h-9 rounded-xl shrink-0
            transition-all duration-150 active:scale-95
            ${canSend
              ? 'bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 hover:bg-black dark:hover:bg-white'
              : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 cursor-not-allowed'
            }
          `}
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>

      {/* Legal disclaimer and rate limit */}
      <p className="mt-2 text-[11px] text-zinc-400 dark:text-zinc-500 text-center">
        {t('input.disclaimer')}
        {!import.meta.env.DEV && ` · ${t('input.remaining', { count: remainingQueries })}`}
      </p>
    </div>
  );
}
