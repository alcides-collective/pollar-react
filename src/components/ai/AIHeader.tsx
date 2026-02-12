import { ArrowLeft, PanelLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAIMessages, useAIStore, useAISidebarOpen } from '../../stores/aiStore';
import { trackAIConversationReset } from '../../lib/analytics';

interface AIHeaderProps {
  showSidebarToggle?: boolean;
  showBackButton?: boolean;
}

export function AIHeader({ showSidebarToggle = true, showBackButton = true }: AIHeaderProps) {
  const navigate = useNavigate();
  const messages = useAIMessages();
  const isSidebarOpen = useAISidebarOpen();
  const { resetConversation, toggleSidebar } = useAIStore();

  const handleNewChat = () => {
    trackAIConversationReset();
    resetConversation();
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <header className="flex items-center h-14 px-4 border-b border-divider dark:border-zinc-800 bg-background dark:bg-zinc-950 shrink-0">
      {/* Left side - back button and sidebar toggle */}
      <div className="flex items-center gap-1 w-32">
        {showBackButton && (
          <button
            onClick={handleBack}
            aria-label="Wróć"
            className="p-2 rounded-lg
                       text-content-subtle dark:text-zinc-400
                       hover:bg-surface dark:hover:bg-zinc-800
                       transition-colors duration-150"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        {showSidebarToggle && !isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            aria-label="Otwórz panel"
            className="p-2 rounded-lg
                       text-content-subtle dark:text-zinc-400
                       hover:bg-surface dark:hover:bg-zinc-800
                       transition-colors duration-150"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Center - Title */}
      <div className="flex-1 flex items-center justify-center gap-2">
        <svg
          className="w-4 h-4 text-content-faint dark:text-zinc-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
        </svg>
        <span className="text-sm font-medium text-content dark:text-zinc-400">
          Pollar
        </span>
      </div>

      {/* Right side - New chat */}
      <div className="flex items-center justify-end gap-2 w-32">
        {messages.length > 0 && (
          <button
            onClick={handleNewChat}
            title="Nowa rozmowa"
            aria-label="Nowa rozmowa"
            className="p-2 rounded-lg
                       text-content-subtle dark:text-zinc-400
                       hover:bg-surface dark:hover:bg-zinc-800
                       transition-colors duration-150"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
}
