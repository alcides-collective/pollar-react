import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage, useSetLanguage, type Language } from '../stores/languageStore';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'pl', label: 'Polski' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
];

export function FloatingLanguageSelector() {
  const language = useLanguage();
  const setLanguage = useSetLanguage();
  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <div className="fixed top-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger className="h-10 flex items-center gap-2 text-sm bg-white/90 backdrop-blur-sm text-zinc-700 hover:bg-white rounded-full px-4 shadow-lg border border-zinc-200 hover:border-zinc-300 transition-all outline-none">
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
              onClick={() => setLanguage(lang.code)}
              className={`flex items-center gap-2 cursor-pointer ${language === lang.code ? 'bg-zinc-100 text-zinc-900 font-medium' : ''}`}
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
