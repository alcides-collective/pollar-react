import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('actions');
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
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };

  const handleClick = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    setIsLoading(true);
    try {
      await toggleSaveEvent(eventId);
      toast.success(isSaved ? t('bookmark.removed') : t('bookmark.added'));
    } catch {
      toast.error(t('bookmark.failed'));
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
            ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/80'
            : 'bg-background text-content-heading border-divider hover:border-content-faint'
        } disabled:opacity-50 ${className}`}
      >
        <i className={`${isSaved ? 'ri-bookmark-fill' : 'ri-bookmark-line'} ${iconSizes[size]}`} />
        <span className="text-sm font-medium">
          {isSaved ? t('bookmark.saved') : t('bookmark.save')}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-colors duration-200 ${
        isSaved
          ? 'bg-primary text-primary-foreground hover:bg-primary/80'
          : 'bg-background/90 text-content hover:bg-surface hover:text-content-heading border border-divider'
      } disabled:opacity-50 ${className}`}
      aria-label={isSaved ? t('bookmark.ariaRemove') : t('bookmark.ariaSave')}
    >
      <i className={`${isSaved ? 'ri-bookmark-fill' : 'ri-bookmark-line'} ${iconSizes[size]}`} />
    </button>
  );
}
