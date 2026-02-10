import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useThemePreference, useSetThemePreference } from '@/stores/themeStore';
import { useUser } from '@/stores/authStore';
import { updateUserThemePreference } from '@/services/userService';
import { cn } from '@/lib/utils';
import type { ThemePreference } from '@/types/auth';

const OPTIONS: { value: ThemePreference; icon: string; labelKey: string }[] = [
  { value: 'light', icon: 'ri-sun-line', labelKey: 'theme.light' },
  { value: 'dark', icon: 'ri-moon-line', labelKey: 'theme.dark' },
  { value: 'system', icon: 'ri-computer-line', labelKey: 'theme.system' },
];

interface ThemeToggleProps {
  variant?: 'header' | 'profile';
}

export function ThemeToggle({ variant = 'header' }: ThemeToggleProps) {
  const { t } = useTranslation('common');
  const preference = useThemePreference();
  const setPreference = useSetThemePreference();
  const user = useUser();
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleChange = (value: ThemePreference) => {
    setPreference(value);
    if (user) {
      updateUserThemePreference(user.uid, value).catch(console.error);
    }
  };

  // Close on tap outside (for touch / iPad)
  useEffect(() => {
    if (!isExpanded) return;
    const handleOutside = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('pointerdown', handleOutside);
    return () => document.removeEventListener('pointerdown', handleOutside);
  }, [isExpanded]);

  const isHeader = variant === 'header';

  if (isHeader) {
    return (
      <div
        ref={containerRef}
        className="flex items-center rounded-lg p-[3px] bg-zinc-800 border border-zinc-700/50"
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') setIsExpanded(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') setIsExpanded(false);
        }}
      >
        {OPTIONS.map((opt) => {
          const isActive = preference === opt.value;
          const show = isExpanded || isActive;

          return (
            <div
              key={opt.value}
              className="grid transition-[grid-template-columns] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{ gridTemplateColumns: show ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden min-w-0">
                <button
                  onClick={() => {
                    if (!isExpanded) {
                      setIsExpanded(true);
                      return;
                    }
                    if (!isActive) {
                      handleChange(opt.value);
                    }
                    setIsExpanded(false);
                  }}
                  className={cn(
                    'flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs whitespace-nowrap transition-opacity duration-200',
                    show ? 'opacity-100' : 'opacity-0',
                    isActive
                      ? 'bg-zinc-700 text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  )}
                  title={t(opt.labelKey)}
                >
                  <i className={`${opt.icon} text-sm`} />
                  <span>{t(opt.labelKey)}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center rounded-lg p-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleChange(opt.value)}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors',
            preference === opt.value
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
          )}
          title={t(opt.labelKey)}
        >
          <i className={`${opt.icon} text-sm`} />
          <span className="hidden sm:inline">{t(opt.labelKey)}</span>
        </button>
      ))}
    </div>
  );
}
