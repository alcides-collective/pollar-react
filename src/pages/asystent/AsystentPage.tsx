import { useEffect } from 'react';
import { AIChat, AISidebar } from '../../components/ai';
import { FloatingLanguageSelector } from '../../components/FloatingLanguageSelector';
import { useUser } from '../../stores/authStore';
import { useOnboardingStore } from '../../stores/onboardingStore';

export function AsystentPage() {
  const user = useUser();

  // Disable body scroll while on this page
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Mark onboarding checklist item as completed
  useEffect(() => {
    if (user) useOnboardingStore.getState().markChecklistItem('ai_companion');
  }, [user]);

  return (
    <div className="h-dvh w-full overflow-hidden bg-background dark:bg-zinc-950 flex">
      {/* Language selector */}
      <FloatingLanguageSelector />

      {/* Sidebar - overlay on mobile, inline on desktop */}
      <AISidebar />

      {/* Main chat area */}
      <div className="flex-1 h-full min-w-0">
        <AIChat variant="page" />
      </div>
    </div>
  );
}
