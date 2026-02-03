import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAIMessages, useAIStore } from '../../stores/aiStore';

interface AIHeaderProps {
  onBack?: () => void;
  showBackButton?: boolean;
}

export function AIHeader({ onBack, showBackButton = true }: AIHeaderProps) {
  const navigate = useNavigate();
  const messages = useAIMessages();
  const resetConversation = useAIStore((s) => s.resetConversation);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleNewChat = () => {
    resetConversation();
  };

  return (
    <header className="flex items-center gap-3 px-4 py-3 pt-[max(12px,env(safe-area-inset-top))] border-b border-zinc-200 dark:border-zinc-800 shrink-0">
      {showBackButton && (
        <button
          onClick={handleBack}
          aria-label="Wroc"
          className="flex items-center justify-center w-9 h-9
                     border border-zinc-200 dark:border-zinc-700 rounded-lg
                     text-zinc-500 dark:text-zinc-400
                     hover:border-zinc-300 dark:hover:border-zinc-600
                     hover:text-zinc-700 dark:hover:text-zinc-300
                     transition-all duration-150"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      <div className="flex-1 flex items-center gap-2">
        <svg
          className="w-4 h-4 text-zinc-500 dark:text-zinc-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
        </svg>
        <span className="font-sans text-[15px] font-medium text-zinc-700 dark:text-zinc-300">
          Asystent Pollar
        </span>
      </div>

      <div className="flex gap-2">
        {messages.length > 0 && (
          <button
            onClick={handleNewChat}
            title="Nowa rozmowa"
            aria-label="Nowa rozmowa"
            className="flex items-center justify-center w-9 h-9
                       border border-zinc-200 dark:border-zinc-700 rounded-lg
                       text-zinc-400 dark:text-zinc-500
                       hover:border-zinc-300 dark:hover:border-zinc-600
                       hover:text-zinc-600 dark:hover:text-zinc-400
                       transition-all duration-150"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}
