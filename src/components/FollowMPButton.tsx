import { useState } from 'react';
import { useIsAuthenticated } from '@/stores/authStore';
import { useUserStore, useIsFollowingMP } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
      toast.success(
        isFollowing ? 'Przestano śledzić' : 'Zaczęto śledzić',
        {
          description: isFollowing
            ? `Nie śledzisz już posła ${mpName}`
            : `Śledzisz teraz posła ${mpName}`,
        }
      );
    } catch {
      toast.error('Błąd', {
        description: 'Nie udało się zaktualizować śledzonych posłów',
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
          Śledzisz
        </>
      ) : (
        <>
          <i className="ri-user-add-line mr-1.5" />
          Śledź
        </>
      )}
    </Button>
  );
}
