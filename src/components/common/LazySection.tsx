import { ReactNode } from 'react';
import { useLazyLoad } from '../../hooks/useLazyLoad';
import { Skeleton } from '../ui/skeleton';

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  height?: string;
  rootMargin?: string;
}

export function LazySection({
  children,
  fallback,
  height = '200px',
  rootMargin = '200px'
}: LazySectionProps) {
  const { ref, isVisible } = useLazyLoad({ rootMargin });

  return (
    <div ref={ref}>
      {isVisible ? children : (
        fallback ?? <Skeleton className="w-full" style={{ height }} />
      )}
    </div>
  );
}
