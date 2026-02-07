import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface ShareButtonProps {
  url?: string;
  title: string;
  text?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ShareButton({
  url,
  title,
  text,
  className = '',
  size = 'md',
}: ShareButtonProps) {
  const { t } = useTranslation('actions');
  const [isSharing, setIsSharing] = useState(false);

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

  const handleShare = async () => {
    setIsSharing(true);
    const shareUrl = url || window.location.href;

    // Try Web Share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
        setIsSharing(false);
        return;
      } catch (err) {
        // User cancelled or share failed - fall back to clipboard
        if ((err as Error).name === 'AbortError') {
          setIsSharing(false);
          return;
        }
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t('share.linkCopied'));
    } catch {
      toast.error(t('share.failedToCopy'));
    }
    setIsSharing(false);
  };

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-colors duration-200 bg-background/90 text-content hover:bg-surface hover:text-content-heading border border-divider disabled:opacity-50 ${className}`}
      aria-label={t('share.share')}
    >
      <i className={`ri-share-line ${iconSizes[size]}`} />
    </button>
  );
}
