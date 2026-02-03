import { useEffect } from 'react';
import { AIChat } from '../../components/ai';

export function AsystentPage() {
  // Disable body scroll while on this page
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div className="h-dvh w-full overflow-hidden bg-white dark:bg-zinc-950">
      <AIChat variant="page" />
    </div>
  );
}
