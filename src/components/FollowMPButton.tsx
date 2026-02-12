import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsAuthenticated } from '@/stores/authStore';
import { useUserStore, useIsFollowingMP } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { trackMPFollowToggle } from '@/lib/analytics';

interface FollowMPButtonProps {
  mpId: number;
  mpName: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function FollowMPButton({
  mpId,
  mpName,
  variant = 'outline',
  size = 'sm',
  className,
}: FollowMPButtonProps) {
  const { t } = useTranslation('actions');
  const isAuthenticated = useIsAuthenticated();
  const isFollowing = useIsFollowingMP(mpId);
  const toggleFollowMP = useUserStore((s) => s.toggleFollowMP);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    setIsLoading(true);
    try {
      await toggleFollowMP(mpId);
      trackMPFollowToggle({ mp_id: mpId, mp_name: mpName, action: isFollowing ? 'unfollow' : 'follow' });
      toast.success(
        isFollowing ? t('follow.stopped') : t('follow.started'),
        {
          description: isFollowing
            ? t('follow.stoppedMessage', { name: mpName })
            : t('follow.startedMessage', { name: mpName }),
        }
      );
    } catch {
      toast.error(t('follow.error'), {
        description: t('follow.errorMessage'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? 'default' : variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <span className="animate-pulse">...</span>
      ) : isFollowing ? (
        <>
          <i className="ri-user-follow-fill mr-1.5" />
          {t('follow.following')}
        </>
      ) : (
        <>
          <i className="ri-user-add-line mr-1.5" />
          {t('follow.follow')}
        </>
      )}
    </Button>
  );
}
