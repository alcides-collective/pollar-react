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

  const handleChange = (value: ThemePreference) => {
    setPreference(value);
    if (user) {
      updateUserThemePreference(user.uid, value).catch(console.error);
    }
  };

  const isHeader = variant === 'header';

  return (
    <div
      className={cn(
        'flex items-center rounded-lg p-0.5',
        isHeader
          ? 'h-9 bg-zinc-800 border border-zinc-700/50'
          : 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700'
      )}
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleChange(opt.value)}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors',
            preference === opt.value
              ? isHeader
                ? 'bg-zinc-700 text-white'
                : 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
              : isHeader
                ? 'text-zinc-400 hover:text-zinc-200'
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
