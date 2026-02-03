import { useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore, useIsAuthenticated } from '@/stores/authStore';
import { useUserStore, useIsEventSaved } from '@/stores/userStore';

interface BookmarkButtonProps {
  eventId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function BookmarkButton({
  eventId,
  className = '',
  size = 'md',
  showLabel = false,
}: BookmarkButtonProps) {
  const isAuthenticated = useIsAuthenticated();
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const toggleSaveEvent = useUserStore((s) => s.toggleSaveEvent);
  const isSaved = useIsEventSaved(eventId);
  const [isLoading, setIsLoading] = useState(false);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const handleClick = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    setIsLoading(true);
    try {
      await toggleSaveEvent(eventId);
      toast.success(isSaved ? 'Event usunięty z zapisanych' : 'Event zapisany');
    } catch {
      toast.error('Nie udało się zapisać eventu');
    } finally {
      setIsLoading(false);
    }
  };

  if (showLabel) {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
          isSaved
            ? 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'
            : 'bg-white text-zinc-900 border-zinc-300 hover:border-zinc-400'
        } disabled:opacity-50 ${className}`}
      >
        {isSaved ? (
          <BookmarkFilledIcon className={iconSizes[size]} />
        ) : (
          <BookmarkIcon className={iconSizes[size]} />
        )}
        <span className="text-sm font-medium">
          {isSaved ? 'Zapisano' : 'Zapisz'}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-colors ${
        isSaved
          ? 'bg-zinc-900 text-white hover:bg-zinc-800'
          : 'bg-white/90 text-zinc-700 hover:bg-white border border-zinc-200'
      } disabled:opacity-50 ${className}`}
      aria-label={isSaved ? 'Usuń z zapisanych' : 'Zapisz event'}
    >
      {isSaved ? (
        <BookmarkFilledIcon className={iconSizes[size]} />
      ) : (
        <BookmarkIcon className={iconSizes[size]} />
      )}
    </button>
  );
}

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
      />
    </svg>
  );
}

function BookmarkFilledIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  );
}
