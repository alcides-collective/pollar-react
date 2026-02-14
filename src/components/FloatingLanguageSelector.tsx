import { useLocation, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage, type Language } from '../stores/languageStore';
import { useAuthStore } from '../stores/authStore';
import { updateUserLanguagePreference } from '../services/userService';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'pl', label: 'Polski' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
];

export function FloatingLanguageSelector() {
  const language = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  const handleLanguageChange = (newLang: Language) => {
    // Get current path without language prefix
    const currentPath = location.pathname.replace(/^\/(en|de)/, '') || '/';
    // Build new path with new language prefix
    const newPrefix = newLang !== 'pl' ? `/${newLang}` : '';
    const newPath = newPrefix + currentPath + location.search;
    // Only navigate - let LanguageRouteHandler sync the store from URL
    navigate(newPath);
    // Persist to Firestore for cross-device sync
    const user = useAuthStore.getState().user;
    if (user) {
      updateUserLanguagePreference(user.uid, newLang).catch(() => {});
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger className="h-10 flex items-center gap-2 text-sm bg-background/90 backdrop-blur-sm text-content hover:bg-background rounded-full px-4 shadow-lg border border-divider hover:border-divider transition-all outline-none">
          <i className="ri-global-line text-base" />
          <span>{currentLang.code.toUpperCase()}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          {LANGUAGES.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center gap-2 cursor-pointer ${language === lang.code ? 'bg-surface text-content-heading font-medium' : ''}`}
            >
              <span>{lang.label}</span>
              {language === lang.code && (
                <i className="ri-check-line ml-auto" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
