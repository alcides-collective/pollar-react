import { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';
import { useAIRemainingQueries, useAILoading } from '../../stores/aiStore';
import { formatRemainingQueries } from '../../utils/ai-helpers';

interface AIInputProps {
  onSend: (message: string) => void;
  autoFocus?: boolean;
}

export function AIInput({ onSend, autoFocus = false }: AIInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isLoading = useAILoading();
  const remainingQueries = useAIRemainingQueries();

  const isDisabled = isLoading || remainingQueries <= 0;
  const canSend = input.trim() && !isDisabled;

  // Auto focus on mount
  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const handleSend = useCallback(() => {
    if (!canSend) return;
    onSend(input.trim());
    setInput('');
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
    <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
      <div className="flex items-center gap-3 mb-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          placeholder="Zadaj pytanie o wydarzenia..."
          className="flex-1 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3
                     text-base bg-transparent text-zinc-800 dark:text-zinc-200
                     placeholder:text-zinc-400 dark:placeholder:text-zinc-500
                     focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500
                     disabled:opacity-50 transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Wyslij"
          className="flex items-center justify-center w-11 h-11 rounded-xl
                     bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900
                     hover:bg-black dark:hover:bg-white
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-all duration-150 active:scale-95"
        >
          <Send className="w-[18px] h-[18px]" />
        </button>
      </div>
      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center">
        {formatRemainingQueries(remainingQueries)}
      </p>
    </div>
  );
}
