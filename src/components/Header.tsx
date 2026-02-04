import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEvents } from '../stores/eventsStore';
import { useUIStore } from '../stores/uiStore';
import { useSearchStore } from '../stores/searchStore';
import { useAuthStore, useUser, useIsAuthenticated } from '../stores/authStore';
import { useLanguage, useSetLanguage, type Language } from '../stores/languageStore';
import { LocalizedLink } from './LocalizedLink';
// import { useProStore } from '../stores/proStore';
import { useMemo, useState, useEffect, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SearchModal } from '@/components/search';
import { AlertsBell } from '@/components/AlertsBell';
import logoImg from '../assets/logo.png';

// Language config
const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'pl', label: 'Polski' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
];

// Language selector component
function LanguageSelector() {
  const language = useLanguage();
  const setLanguage = useSetLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  const handleLanguageChange = (newLang: Language) => {
    // Get current path without language prefix
    const currentPath = location.pathname.replace(/^\/(en|de)/, '') || '/';
    // Build new path with new language prefix
    const newPrefix = newLang !== 'pl' ? `/${newLang}` : '';
    const newPath = newPrefix + currentPath;
    // Navigate and update store
    navigate(newPath);
    setLanguage(newLang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="h-9 flex items-center gap-1.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg px-3 border border-zinc-700/50 hover:border-zinc-600 transition-colors outline-none">
        <i className="ri-global-line text-base" />
        <span className="hidden sm:inline">{currentLang.code.toUpperCase()}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`flex items-center gap-2 cursor-pointer ${language === lang.code ? 'bg-zinc-800 text-white' : ''}`}
          >
            <span>{lang.label}</span>
            {language === lang.code && (
              <i className="ri-check-line ml-auto" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Auth button component
function AuthButton() {
  const { t } = useTranslation('common');
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const signOut = useAuthStore((s) => s.signOut);

  if (isAuthenticated && user) {
    const displayName = user.displayName || user.email || t('user.defaultName');
    const initials = displayName.charAt(0).toUpperCase();

    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="group h-9 flex items-center overflow-hidden rounded-lg border border-zinc-700/50 hover:border-zinc-600 transition-colors outline-none">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="h-full aspect-square object-cover"
            />
          ) : (
            <div className="h-full aspect-square bg-zinc-600 flex items-center justify-center text-sm font-medium text-white">
              {initials}
            </div>
          )}
          <span className="hidden sm:flex items-center text-sm text-zinc-300 group-hover:text-white h-full px-3 max-w-[120px] truncate bg-gradient-to-r from-zinc-800 to-zinc-800/50 group-hover:from-zinc-700 group-hover:to-zinc-700/50 transition-colors">
            {displayName}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <LocalizedLink to="/dashboard" className="w-full cursor-pointer">
              {t('user.dashboard')}
            </LocalizedLink>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <LocalizedLink to="/profil" className="w-full cursor-pointer">
              {t('user.myProfile')}
            </LocalizedLink>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <LocalizedLink to="/powiadomienia" className="w-full cursor-pointer">
              {t('user.notifications')}
            </LocalizedLink>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
            {t('user.logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => openAuthModal('login')}
            className="h-9 flex items-center justify-center text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg px-2 sm:px-3 border border-zinc-700/50 hover:border-zinc-600 transition-colors"
          >
            <i className="ri-user-line text-lg sm:hidden" />
            <span className="hidden sm:inline">{t('auth:login.title')}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end" className="max-w-64">
          <p className="font-medium mb-1.5">{t('loginPrompt.title')}</p>
          <ul className="space-y-1 text-zinc-400">
            <li>• {t('loginPrompt.feature1')}</li>
            <li>• {t('loginPrompt.feature2')}</li>
            <li>• {t('loginPrompt.feature3')}</li>
            <li>• {t('loginPrompt.feature4')}</li>
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Static category order (main categories first)
const CATEGORY_ORDER = [
  'Świat',
  'Gospodarka',
  'Społeczeństwo',
  'Polityka',
  'Sport',
  'Kultura',
  'Przestępczość',
  'Styl Życia',
  'Pogoda i Środowisko',
  'Nauka i Technologia',
];

export function Header() {
  const { t } = useTranslation('common');
  const language = useLanguage();
  const { events } = useEvents({ limit: 100, lang: language });
  const selectedCategory = useUIStore((state) => state.selectedCategory);
  const setSelectedCategory = useUIStore((state) => state.setSelectedCategory);
  const openSearch = useSearchStore((state) => state.openSearch);
  // const openProModal = useProStore((state) => state.openProModal);
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);

  // Measure header height
  useLayoutEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 10;

      if (Math.abs(currentScrollY - lastScrollY.current) < scrollThreshold) {
        return;
      }

      if (currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const allCategories = useMemo(() => {
    const uniqueCategories = new Set(events.map(e => e.category).filter(Boolean));
    const categories = Array.from(uniqueCategories);
    return categories.sort((a, b) => {
      const indexA = CATEGORY_ORDER.indexOf(a);
      const indexB = CATEGORY_ORDER.indexOf(b);
      // Unknown categories go to the end
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });
  }, [events]);

  // Handle category selection - navigate to home if not already there
  const handleCategoryClick = (category: string | null) => {
    setSelectedCategory(category);
    // Get path without language prefix to check if we're on home
    const pathWithoutLang = location.pathname.replace(/^\/(en|de)/, '') || '/';
    if (pathWithoutLang !== '/') {
      // Navigate to localized home
      const prefix = language !== 'pl' ? `/${language}` : '';
      navigate(prefix + '/');
    }
  };

  return (
    <>
    <motion.header
      ref={headerRef}
      className="bg-black fixed z-50 -top-3 -left-3 -right-3 pt-3 pl-3 pr-3 overflow-hidden"
      initial={false}
      animate={{ y: isVisible ? 0 : '-100%', opacity: isVisible ? 1 : 0, filter: isVisible ? 'blur(0px)' : 'blur(8px)' }}
      transition={{ type: 'spring', stiffness: isVisible ? 150 : 300, damping: isVisible ? 20 : 30 }}
    >
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Top bar */}
        <div className="relative flex items-center justify-between py-4 border-b border-zinc-800">
          {/* Border Glow Trail */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none overflow-hidden">
            <motion.div
              className="absolute h-full w-[300%]"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, transparent 20%, rgba(255,255,255,0.08) 35%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.08) 65%, transparent 80%, transparent 100%)',
              }}
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                x: {
                  duration: 3,
                  ease: 'linear',
                  repeat: Infinity,
                  repeatDelay: 0,
                },
              }}
            />
          </div>
          <div className="flex items-center gap-10">
            <LocalizedLink to="/" onClick={() => handleCategoryClick(null)}>
              <img
                src={logoImg}
                alt="Pollar"
                className="h-5 w-auto invert"
                width={172}
                height={20}
              />
            </LocalizedLink>
          </div>
          <div className="flex items-center gap-3">
            <LocalizedLink
              to="/polityka-prywatnosci"
              className="h-9 flex items-center text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg px-3 border border-zinc-700/50 hover:border-zinc-600 transition-colors"
            >
              {t('nav.privacy')}
            </LocalizedLink>
            <AlertsBell />
            <LanguageSelector />
            <AuthButton />
            {/* <button
              onClick={openProModal}
              className="text-sm text-white bg-amber-500/10 hover:bg-amber-500/20 rounded-lg px-3 py-1.5 border border-amber-500/30 hover:border-amber-500/50 transition-colors"
            >
              Pollar Pro
            </button> */}
            <button
              onClick={openSearch}
              className="h-9 w-9 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg border border-zinc-700/50 hover:border-zinc-600 transition-colors"
              aria-label={t('nav.search')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center justify-between pt-3">
          <div
            className="flex-1 min-w-0 flex items-center gap-6 lg:gap-8 overflow-x-auto scrollbar-hide -mx-6 px-6 pr-16 [mask-image:linear-gradient(to_right,black_0,black_calc(100%-6rem),transparent_100%)]"
            role="region"
            aria-label="Kategorie"
            tabIndex={0}
          >
            <button
              onClick={() => handleCategoryClick(null)}
              className={`relative text-sm whitespace-nowrap transition-colors pb-3 ${
                selectedCategory === null
                  ? 'text-white font-medium'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              {t('nav.all')}
              <AnimatePresence>
                {selectedCategory === null && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>
            </button>
            {allCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`relative text-sm whitespace-nowrap transition-colors pb-3 ${
                  selectedCategory === category
                    ? 'text-white font-medium'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                {t(`categories.${category}`, category)}
                <AnimatePresence>
                  {selectedCategory === category && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>
              </button>
            ))}
          </div>
          <div className="bg-black pl-2 shrink-0 relative z-10">
            <DropdownMenu>
              <DropdownMenuTrigger className="text-sm text-zinc-400 hover:text-white flex items-center gap-1 transition-colors outline-none pb-3">
              <span className="hidden sm:inline">{t('nav.discover')}</span>
              {/* Mobile: hamburger icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Desktop: dropdown arrow */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <LocalizedLink to="/brief" className="w-full flex items-center gap-2">
                  <i className="ri-newspaper-line" />
                  {t('nav.dailyBrief')}
                </LocalizedLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <LocalizedLink to="/asystent" className="w-full flex items-center gap-2">
                  <i className="ri-robot-2-line" />
                  {t('nav.aiAssistant')}
                </LocalizedLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <LocalizedLink to="/sejm" className="w-full flex items-center gap-2">
                  <i className="ri-government-line" />
                  {t('nav.sejm')}
                </LocalizedLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <LocalizedLink to="/gielda" className="w-full flex items-center gap-2">
                  <i className="ri-line-chart-line" />
                  {t('nav.stockExchange')}
                </LocalizedLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <LocalizedLink to="/mapa" className="w-full flex items-center gap-2">
                  <i className="ri-map-pin-line" />
                  {t('nav.eventMap')}
                </LocalizedLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <LocalizedLink to="/dane" className="w-full flex items-center gap-2">
                  <i className="ri-database-2-line" />
                  {t('nav.openData')}
                </LocalizedLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <LocalizedLink to="/graf" className="w-full flex items-center gap-2">
                  <i className="ri-share-circle-line" />
                  {t('nav.connectionGraph')}
                </LocalizedLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <LocalizedLink to="/terminal" className="w-full flex items-center gap-2">
                  <i className="ri-terminal-line" />
                  {t('nav.terminal')}
                </LocalizedLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <LocalizedLink to="/powiazania" className="w-full flex items-center gap-2">
                  <i className="ri-mind-map" />
                  {t('nav.connections')}
                </LocalizedLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <LocalizedLink to="/archiwum" className="w-full flex items-center gap-2">
                  <i className="ri-archive-line" />
                  {t('nav.archive')}
                </LocalizedLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <LocalizedLink to="/info" className="w-full flex items-center gap-2">
                  <i className="ri-information-line" />
                  {t('nav.about')}
                </LocalizedLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </div>
    </motion.header>
    {/* Spacer for fixed header */}
    <div style={{ height: headerHeight }} />

    {/* Search Modal */}
    <SearchModal />
    </>
  );
}
