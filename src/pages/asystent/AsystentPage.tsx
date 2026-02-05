import { useEffect } from 'react';
import { AIChat, AISidebar } from '../../components/ai';
import { FloatingLanguageSelector } from '../../components/FloatingLanguageSelector';

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
    <div className="h-dvh w-full overflow-hidden bg-white dark:bg-zinc-950 flex">
      {/* Language selector */}
      <FloatingLanguageSelector />

      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:block h-full">
        <AISidebar />
      </div>

      {/* Main chat area */}
      <div className="flex-1 h-full min-w-0">
        <AIChat variant="page" />
      </div>
    </div>
  );
}
