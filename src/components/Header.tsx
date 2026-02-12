import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEvents } from '../stores/eventsStore';
import { useUIStore } from '../stores/uiStore';
import { useSearchStore } from '../stores/searchStore';
import { useAuthStore, useUser, useIsAuthenticated } from '../stores/authStore';
import { useLanguage, type Language } from '../stores/languageStore';
import { LocalizedLink } from './LocalizedLink';
// import { useProStore } from '../stores/proStore';
import { useMemo, useState, useEffect, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
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
import { ThemeToggle } from '@/components/ThemeToggle';
import { useThemePreference, useSetThemePreference } from '@/stores/themeStore';
import { updateUserThemePreference, updateUserSelectedCountries } from '@/services/userService';
import {
  useAlertsStore,
  useTotalUnreadCount,
  useCombinedAlerts,
  type CombinedAlert,
} from '@/stores/alertsStore';
import { useTranslatedEventTitles } from '@/hooks/useTranslatedEventTitles';
import type { ThemePreference } from '@/types/auth';
import { getCategorySlug } from '../utils/categorySlug';
import { COUNTRY_KEYS, COUNTRY_FLAG_CODES, COUNTRY_SEGMENT, buildCountrySlugsParam, translatePath } from '../utils/countrySlug';
import { useRouteLanguage } from '../hooks/useRouteLanguage';
import { useSelectedCountries } from '../stores/uiStore';
import logoImg from '../assets/logo-white.png';

// Language config
const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'pl', label: 'Polski' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
];

// Language selector component
function LanguageSelector() {
  const { t } = useTranslation('common');
  const language = useRouteLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  const handleLanguageChange = (newLang: Language) => {
    const currentPath = location.pathname.replace(/^\/(en|de)/, '') || '/';
    const translatedPath = translatePath(currentPath, language, newLang);
    const newPrefix = newLang !== 'pl' ? `/${newLang}` : '';
    const newPath = newPrefix + translatedPath + location.search;
    navigate(newPath);
  };

  return (
    <TooltipProvider>
    <DropdownMenu>
      <Tooltip>
      <TooltipTrigger asChild>
      <DropdownMenuTrigger className="h-9 flex items-center gap-1.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg px-3 border border-zinc-700/50 hover:border-zinc-600 transition-colors outline-none">
        <i className="ri-global-line text-base" />
        <span className="hidden sm:inline">{currentLang.code.toUpperCase()}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </DropdownMenuTrigger>
      </TooltipTrigger>
      <TooltipContent side="bottom">{t('nav.languageTooltip')}</TooltipContent>
      </Tooltip>
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
    </TooltipProvider>
  );
}

// Country filter component
function CountryFilter() {
  const { t } = useTranslation('common');
  const language = useRouteLanguage();
  const navigate = useNavigate();
  const selectedCountries = useSelectedCountries();
  const selectedCategory = useUIStore((state) => state.selectedCategory);
  const toggleCountry = useUIStore((state) => state.toggleSelectedCountry);
  const clearCountries = useUIStore((state) => state.clearSelectedCountries);
  const user = useUser();

  const handleToggle = (country: string) => {
    // Compute next state
    const next = selectedCountries.includes(country)
      ? selectedCountries.filter(c => c !== country)
      : [...selectedCountries, country];

    toggleCountry(country);

    // Persist to Firestore for logged-in users
    if (user) {
      updateUserSelectedCountries(user.uid, next).catch(console.error);
    }

    // Build URL
    const prefix = language !== 'pl' ? `/${language}` : '';
    if (next.length === 0) {
      // No countries selected — go to category or home
      if (selectedCategory) {
        navigate(prefix + '/' + getCategorySlug(selectedCategory, language));
      } else {
        navigate(prefix + '/');
      }
    } else {
      const countrySlugs = buildCountrySlugsParam(next, language);
      const seg = COUNTRY_SEGMENT[language];
      if (selectedCategory) {
        navigate(prefix + '/' + getCategorySlug(selectedCategory, language) + '/' + seg + '/' + countrySlugs);
      } else {
        navigate(prefix + '/' + seg + '/' + countrySlugs);
      }
    }
  };

  const handleClear = () => {
    clearCountries();
    // Persist to Firestore for logged-in users
    if (user) {
      updateUserSelectedCountries(user.uid, []).catch(console.error);
    }
    const prefix = language !== 'pl' ? `/${language}` : '';
    if (selectedCategory) {
      navigate(prefix + '/' + getCategorySlug(selectedCategory, language));
    } else {
      navigate(prefix + '/');
    }
  };

  const count = selectedCountries.length;

  return (
    <TooltipProvider>
    <DropdownMenu>
      <Tooltip>
      <TooltipTrigger asChild>
      <DropdownMenuTrigger className={`h-9 flex items-center gap-1.5 text-sm rounded-lg border transition-colors outline-none ${
        count > 0
          ? 'text-white bg-zinc-700 border-zinc-600'
          : 'text-zinc-300 hover:text-white hover:bg-zinc-800 border-zinc-700/50 hover:border-zinc-600'
      } w-9 justify-center sm:w-auto sm:px-3`}>
        <i className="ri-map-pin-line text-base" />
        <span className="hidden sm:inline">{t('nav.countries')}</span>
        {count > 0 && (
          <span className="bg-white text-black text-[10px] font-bold rounded-full h-4 min-w-4 hidden sm:flex items-center justify-center px-1">
            {count}
          </span>
        )}
      </DropdownMenuTrigger>
      </TooltipTrigger>
      <TooltipContent side="bottom">{t('nav.countriesTooltip')}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{t('nav.countries')}</DropdownMenuLabel>
        <p className="px-2 pb-2 text-[11px] text-zinc-500 leading-tight">{t('nav.countriesHint')}</p>
        {COUNTRY_KEYS.map((country) => {
          const isSelected = selectedCountries.includes(country);
          return (
            <DropdownMenuItem
              key={country}
              onClick={(e) => {
                e.preventDefault();
                handleToggle(country);
              }}
              className={`flex items-center gap-2 cursor-pointer ${isSelected ? 'bg-zinc-800 text-white' : ''}`}
            >
              <span className={`fi fi-${COUNTRY_FLAG_CODES[country]} rounded-sm`} />
              <span className="flex-1">{t(`countries.${country}`, country)}</span>
              {isSelected && <i className="ri-check-line" />}
            </DropdownMenuItem>
          );
        })}
        {count > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                handleClear();
              }}
              className="text-zinc-400 cursor-pointer"
            >
              {t('nav.clearCountries')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
    </TooltipProvider>
  );
}

// Theme options for mobile settings
const THEME_OPTIONS: { value: ThemePreference; icon: string; labelKey: string }[] = [
  { value: 'light', icon: 'ri-sun-line', labelKey: 'theme.light' },
  { value: 'dark', icon: 'ri-moon-line', labelKey: 'theme.dark' },
  { value: 'system', icon: 'ri-computer-line', labelKey: 'theme.system' },
];

// Mobile-only combined settings (language + theme)
function MobileSettingsMenu() {
  const { t } = useTranslation('common');
  const language = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const preference = useThemePreference();
  const setPreference = useSetThemePreference();
  const user = useUser();

  const handleLanguageChange = (newLang: Language) => {
    const currentPath = location.pathname.replace(/^\/(en|de)/, '') || '/';
    const translatedPath = translatePath(currentPath, language, newLang);
    const newPrefix = newLang !== 'pl' ? `/${newLang}` : '';
    const newPath = newPrefix + translatedPath + location.search;
    navigate(newPath);
  };

  const handleThemeChange = (value: ThemePreference) => {
    setPreference(value);
    if (user) {
      updateUserThemePreference(user.uid, value).catch(console.error);
    }
  };

  return (
    <div className="sm:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger className="h-9 w-9 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg border border-zinc-700/50 hover:border-zinc-600 transition-colors outline-none">
          <i className="ri-settings-3-line text-lg" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel>{t('nav.language', 'Język')}</DropdownMenuLabel>
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
          </DropdownMenuGroup>

          {isAuthenticated && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>{t('nav.theme', 'Motyw')}</DropdownMenuLabel>
                {THEME_OPTIONS.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    onClick={() => handleThemeChange(opt.value)}
                    className={`flex items-center gap-2 cursor-pointer ${preference === opt.value ? 'bg-zinc-800 text-white' : ''}`}
                  >
                    <i className={opt.icon} />
                    <span>{t(opt.labelKey)}</span>
                    {preference === opt.value && (
                      <i className="ri-check-line ml-auto" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Mobile-only combined user menu (profile + alerts)
function MobileUserMenu() {
  const { t } = useTranslation('common');
  const { t: tNotif } = useTranslation('notifications');
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const signOut = useAuthStore((s) => s.signOut);
  const totalUnreadCount = useTotalUnreadCount();
  const combinedAlerts = useCombinedAlerts();
  const [isOpen, setIsOpen] = useState(false);

  const categoryEventIds = useMemo(() => {
    return combinedAlerts
      .filter((a): a is CombinedAlert & { alertType: 'category' } => a.alertType === 'category')
      .slice(0, 5)
      .map(a => a.eventId);
  }, [combinedAlerts]);

  const { titles: translatedTitles } = useTranslatedEventTitles(categoryEventIds);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && isAuthenticated) {
      useAlertsStore.getState().fetchAllAlerts();
    }
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.preventDefault();
    useAlertsStore.getState().markAllAlertsAsRead();
  };

  const formatVote = (vote: string): { text: string; color: string } => {
    switch (vote) {
      case 'yes': return { text: tNotif('voting.for'), color: 'text-green-400' };
      case 'no': return { text: tNotif('voting.against'), color: 'text-red-400' };
      case 'abstain': return { text: tNotif('voting.abstained'), color: 'text-amber-400' };
      case 'absent': return { text: tNotif('voting.absent'), color: 'text-content-subtle' };
      case 'present': return { text: tNotif('voting.present'), color: 'text-blue-400' };
      default: return { text: vote, color: 'text-content-faint' };
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="sm:hidden">
        <button
          onClick={() => openAuthModal('login')}
          className="h-9 w-9 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg border border-zinc-700/50 hover:border-zinc-600 transition-colors"
        >
          <i className="ri-user-line text-lg" />
        </button>
      </div>
    );
  }

  const displayName = user?.displayName || user?.email || t('user.defaultName');
  const initials = displayName.charAt(0).toUpperCase();
  const displayAlerts = combinedAlerts.slice(0, 5);

  return (
    <div className="sm:hidden">
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger className="relative h-9 flex items-center justify-center rounded-lg border border-zinc-700/50 hover:border-zinc-600 transition-colors outline-none">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="h-full aspect-square object-cover rounded-[7px]" />
          ) : (
            <div className="h-full aspect-square bg-zinc-600 flex items-center justify-center text-sm font-medium text-white rounded-[7px]">
              {initials}
            </div>
          )}
          {totalUnreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
            </span>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          {/* Profile */}
          <DropdownMenuLabel className="text-zinc-400 truncate">{displayName}</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <LocalizedLink to="/profil" className="w-full cursor-pointer flex items-center gap-2">
              <i className="ri-user-line" />
              {t('user.myProfile')}
            </LocalizedLink>
          </DropdownMenuItem>

          {/* Alerts */}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-zinc-400 !pb-0">{tNotif('title')}</DropdownMenuLabel>
          {totalUnreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="w-full text-left px-2 pt-0.5 pb-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {tNotif('markAsRead')}
            </button>
          )}

          {displayAlerts.length === 0 ? (
            <div className="px-2 py-3 text-center">
              <p className="text-xs text-zinc-500">{tNotif('noNew')}</p>
            </div>
          ) : (
            displayAlerts.map((alert) => {
              if (alert.alertType === 'voting') {
                const voteInfo = formatVote(alert.vote);
                return (
                  <DropdownMenuItem
                    key={`voting-${alert.id}`}
                    asChild
                    className={`py-2 cursor-pointer ${!alert.read ? 'bg-blue-500/20' : ''}`}
                    onClick={() => useAlertsStore.getState().markVotingAlertAsRead(alert.id)}
                  >
                    <LocalizedLink to={`/sejm/glosowania/${alert.sitting}/${alert.votingNumber}`}>
                      <div className="flex items-start gap-1.5 w-full">
                        <p className="text-xs text-zinc-400 line-clamp-2 flex-1">
                          <span className="inline-flex items-baseline gap-1 mr-1 text-xs font-medium">
                            <span className="text-white">{alert.mpName}</span>
                            <span className={voteInfo.color}>{voteInfo.text}</span>
                          </span>
                          {alert.votingTitle}
                        </p>
                        {!alert.read && (
                          <span className="shrink-0 h-1.5 w-1.5 bg-blue-400 rounded-full mt-1" />
                        )}
                      </div>
                    </LocalizedLink>
                  </DropdownMenuItem>
                );
              } else {
                const categoryKey = alert.category
                  ?.toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/ł/g, 'l');
                const categoryLabel = tNotif(`categoryLabels.${categoryKey}`, alert.category);
                const displayTitle = translatedTitles[alert.eventId]?.title || alert.eventTitle;
                return (
                  <DropdownMenuItem
                    key={`category-${alert.id}`}
                    asChild
                    className={`py-2 cursor-pointer ${!alert.read ? 'bg-blue-500/20' : ''}`}
                    onClick={() => useAlertsStore.getState().markCategoryAlertAsRead(alert.id)}
                  >
                    <LocalizedLink to={`/event/${alert.eventId}`}>
                      <div className="flex items-start gap-1.5 w-full">
                        <p className="text-xs text-zinc-300 line-clamp-2 flex-1">
                          <span className="inline text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded font-medium mr-1">
                            {categoryLabel}
                          </span>
                          {displayTitle}
                        </p>
                        {!alert.read && (
                          <span className="shrink-0 h-1.5 w-1.5 bg-blue-400 rounded-full mt-1" />
                        )}
                      </div>
                    </LocalizedLink>
                  </DropdownMenuItem>
                );
              }
            })
          )}

          <DropdownMenuItem asChild>
            <LocalizedLink to="/powiadomienia" className="w-full cursor-pointer flex items-center gap-2 text-zinc-400">
              <i className="ri-notification-line" />
              {tNotif('viewAll')}
            </LocalizedLink>
          </DropdownMenuItem>

          {/* Logout */}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer flex items-center gap-2">
            <i className="ri-logout-box-line" />
            {t('user.logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
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
            <li>• {t('loginPrompt.feature5')}</li>
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
  const language = useRouteLanguage();
  const { events } = useEvents({ limit: 100, lang: language });
  const selectedCategory = useUIStore((state) => state.selectedCategory);
  const openSearch = useSearchStore((state) => state.openSearch);
  const isAuthenticated = useIsAuthenticated();
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

  // Use static category list so buttons render immediately (no waiting for events API).
  // Append any extra categories from events that aren't in the static list.
  const allCategories = useMemo(() => {
    const extraFromEvents = events
      .map(e => e.category)
      .filter(c => Boolean(c) && c !== 'Uncategorized' && !CATEGORY_ORDER.includes(c));
    return [...CATEGORY_ORDER, ...Array.from(new Set(extraFromEvents))];
  }, [events]);

  const pathWithoutLang = location.pathname.replace(/^\/(en|de)/, '') || '/';

  const clearCountries = useUIStore((state) => state.clearSelectedCountries);
  const user = useUser();

  // Handle category selection - navigate to category URL (preserving country filter)
  const handleCategoryClick = (category: string | null) => {
    const prefix = language !== 'pl' ? `/${language}` : '';
    if (category) {
      const slug = getCategorySlug(category, language);
      const countries = useUIStore.getState().selectedCountries;
      if (countries.length > 0) {
        const seg = COUNTRY_SEGMENT[language];
        const countrySlugs = buildCountrySlugsParam(countries, language);
        navigate(prefix + '/' + slug + '/' + seg + '/' + countrySlugs);
      } else {
        navigate(prefix + '/' + slug);
      }
    } else {
      clearCountries(); // Clear persisted countries when going to "All"
      if (user) updateUserSelectedCountries(user.uid, []).catch(console.error);
      navigate(prefix + '/');
    }
    // Scroll to top when changing category
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
    <motion.header
      ref={headerRef}
      className="bg-black dark:bg-zinc-900 fixed z-50 -top-3 -left-3 -right-3 pt-3 pl-3 pr-3 overflow-hidden"
      initial={false}
      animate={{ y: isVisible ? 0 : '-100%', opacity: isVisible ? 1 : 0, filter: isVisible ? 'blur(0px)' : 'blur(8px)' }}
      transition={{ type: 'spring', stiffness: isVisible ? 150 : 300, damping: isVisible ? 20 : 30 }}
    >
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Top bar */}
        <div className="relative flex items-center justify-between py-4 border-b border-zinc-800 dark:border-zinc-700">
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
                className="h-6 w-auto"
                width={172}
                height={20}
              />
            </LocalizedLink>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <LocalizedLink
                    to="/polityka-prywatnosci"
                    className="h-9 flex items-center text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg px-3 border border-zinc-700/50 hover:border-zinc-600 transition-colors"
                  >
                    {t('nav.privacy')}
                  </LocalizedLink>
                </TooltipTrigger>
                <TooltipContent side="bottom">{t('nav.privacyTooltip')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="hidden sm:contents"><AlertsBell /></div>
            {isAuthenticated && <div className="hidden sm:contents"><ThemeToggle variant="header" /></div>}
            <div className="hidden sm:contents"><LanguageSelector /></div>
            <CountryFilter />
            <MobileSettingsMenu />
            <MobileUserMenu />
            <div className="hidden sm:block"><AuthButton /></div>
            {/* <button
              onClick={openProModal}
              className="text-sm text-white bg-amber-500/10 hover:bg-amber-500/20 rounded-lg px-3 py-1.5 border border-amber-500/30 hover:border-amber-500/50 transition-colors"
            >
              Pollar Pro
            </button> */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={openSearch}
                    className="h-9 w-9 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg border border-zinc-700/50 hover:border-zinc-600 transition-colors"
                    aria-label={t('nav.search')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{t('nav.searchTooltip')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
          <div className="bg-black dark:bg-zinc-900 pl-2 shrink-0 relative z-10">
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
              {/* Daily essentials */}
              <DropdownMenuGroup>
                <DropdownMenuLabel>{t('nav.sections.essentials')}</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <LocalizedLink to="/brief" className="w-full flex items-center gap-2">
                    <i className="ri-newspaper-line" />
                    {t('nav.dailyBrief')}
                    {pathWithoutLang.startsWith('/brief') && <i className="ri-check-line ml-auto" />}
                  </LocalizedLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <LocalizedLink to="/asystent" className="w-full flex items-center gap-2">
                    <i className="ri-robot-2-line" />
                    {t('nav.aiAssistant')}
                    {pathWithoutLang.startsWith('/asystent') && <i className="ri-check-line ml-auto" />}
                  </LocalizedLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <LocalizedLink to="/archiwum" className="w-full flex items-center gap-2">
                    <i className="ri-archive-line" />
                    {t('nav.archive')}
                    {pathWithoutLang.startsWith('/archiwum') && <i className="ri-check-line ml-auto" />}
                  </LocalizedLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <LocalizedLink to="/blog" className="w-full flex items-center gap-2">
                    <i className="ri-article-line" />
                    {t('nav.blog', 'Blog')}
                    {pathWithoutLang.startsWith('/blog') && <i className="ri-check-line ml-auto" />}
                  </LocalizedLink>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              {/* Data & analysis */}
              <DropdownMenuGroup>
                <DropdownMenuLabel>{t('nav.sections.data')}</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <LocalizedLink to="/sejm" className="w-full flex items-center gap-2">
                    <i className="ri-government-line" />
                    {t('nav.sejm')}
                    {pathWithoutLang.startsWith('/sejm') && <i className="ri-check-line ml-auto" />}
                  </LocalizedLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <LocalizedLink to="/gielda" className="w-full flex items-center gap-2">
                    <i className="ri-line-chart-line" />
                    {t('nav.stockExchange')}
                    {pathWithoutLang.startsWith('/gielda') && <i className="ri-check-line ml-auto" />}
                  </LocalizedLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <LocalizedLink to="/dane" className="w-full flex items-center gap-2">
                    <i className="ri-database-2-line" />
                    {t('nav.openData')}
                    {pathWithoutLang.startsWith('/dane') && <i className="ri-check-line ml-auto" />}
                  </LocalizedLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <LocalizedLink to="/pogoda" className="w-full flex items-center gap-2">
                    <i className="ri-cloud-line" />
                    {t('nav.weather', 'Pogoda')}
                    {pathWithoutLang.startsWith('/pogoda') && <i className="ri-check-line ml-auto" />}
                  </LocalizedLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <LocalizedLink to="/mapa" className="w-full flex items-center gap-2">
                    <i className="ri-map-pin-line" />
                    {t('nav.eventMap')}
                    {pathWithoutLang.startsWith('/mapa') && <i className="ri-check-line ml-auto" />}
                  </LocalizedLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <LocalizedLink to="/graf" className="w-full flex items-center gap-2">
                    <i className="ri-share-circle-line" />
                    {t('nav.connectionGraph')}
                    {pathWithoutLang.startsWith('/graf') && <i className="ri-check-line ml-auto" />}
                  </LocalizedLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <LocalizedLink to="/sources" className="w-full flex items-center gap-2">
                    <i className="ri-newspaper-line" />
                    {t('nav.sources')}
                    {pathWithoutLang.startsWith('/sources') && <i className="ri-check-line ml-auto" />}
                  </LocalizedLink>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              {/* Extras */}
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <LocalizedLink to="/powiazania" className="w-full flex items-center gap-2">
                    <i className="ri-gamepad-line" />
                    {t('nav.connections')}
                    {pathWithoutLang.startsWith('/powiazania') && <i className="ri-check-line ml-auto" />}
                  </LocalizedLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <LocalizedLink to="/terminal" className="w-full flex items-center gap-2">
                    <i className="ri-terminal-line" />
                    {t('nav.terminal')}
                    {pathWithoutLang.startsWith('/terminal') && <i className="ri-check-line ml-auto" />}
                  </LocalizedLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <LocalizedLink to="/info" className="w-full flex items-center gap-2">
                    <i className="ri-information-line" />
                    {t('nav.about')}
                    {pathWithoutLang.startsWith('/info') && <i className="ri-check-line ml-auto" />}
                  </LocalizedLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <LocalizedLink to="/kontakt" className="w-full flex items-center gap-2">
                    <i className="ri-mail-line" />
                    {t('nav.contact')}
                    {pathWithoutLang.startsWith('/kontakt') && <i className="ri-check-line ml-auto" />}
                  </LocalizedLink>
                </DropdownMenuItem>
              </DropdownMenuGroup>
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
