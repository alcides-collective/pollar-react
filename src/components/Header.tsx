import { Link } from 'react-router-dom';
import { useEvents } from '../stores/eventsStore';
import { useUIStore } from '../stores/uiStore';
import { useSearchStore } from '../stores/searchStore';
import { useAuthStore, useUser, useIsAuthenticated } from '../stores/authStore';
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

// Auth button component
function AuthButton() {
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const signOut = useAuthStore((s) => s.signOut);

  if (isAuthenticated && user) {
    const displayName = user.displayName || user.email || 'Uzytkownik';
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
            <Link to="/dashboard" className="w-full cursor-pointer">
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/profil" className="w-full cursor-pointer">
              Moj profil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/powiadomienia" className="w-full cursor-pointer">
              Powiadomienia
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
            Wyloguj się
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
            className="h-9 flex items-center text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg px-3 border border-zinc-700/50 hover:border-zinc-600 transition-colors"
          >
            Zaloguj się
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end" className="max-w-64">
          <p className="font-medium mb-1.5">Zaloguj się, aby uzyskać dostęp do:</p>
          <ul className="space-y-1 text-zinc-400">
            <li>• Śledzenia posłów i ich głosowań</li>
            <li>• Powiadomień o nowych wydarzeniach</li>
            <li>• Zapisywania artykułów</li>
            <li>• Personalizacji kategorii</li>
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
  const { events } = useEvents({ limit: 100, lang: 'pl' });
  const selectedCategory = useUIStore((state) => state.selectedCategory);
  const setSelectedCategory = useUIStore((state) => state.setSelectedCategory);
  const openSearch = useSearchStore((state) => state.openSearch);
  // const openProModal = useProStore((state) => state.openProModal);
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


  return (
    <>
    <motion.header
      ref={headerRef}
      className="bg-black fixed z-50 -top-3 -left-3 -right-3 pt-3 pl-3 pr-3"
      initial={false}
      animate={{ y: isVisible ? 0 : '-100%', opacity: isVisible ? 1 : 0, filter: isVisible ? 'blur(0px)' : 'blur(8px)' }}
      transition={{ type: 'spring', stiffness: isVisible ? 150 : 300, damping: isVisible ? 20 : 30 }}
    >
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4 border-b border-zinc-800">
          <div className="flex items-center gap-10">
            <Link to="/" onClick={() => setSelectedCategory(null)}>
              <img
                src={logoImg}
                alt="Pollar"
                className="h-5 w-auto invert"
                width={172}
                height={20}
              />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/polityka-prywatnosci"
              className="h-9 flex items-center text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg px-3 border border-zinc-700/50 hover:border-zinc-600 transition-colors"
            >
              Prywatność
            </Link>
            <AlertsBell />
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
              aria-label="Szukaj"
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
              onClick={() => setSelectedCategory(null)}
              className={`relative text-sm whitespace-nowrap transition-colors pb-3 ${
                selectedCategory === null
                  ? 'text-white font-medium'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              Wszystkie
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
                onClick={() => setSelectedCategory(category)}
                className={`relative text-sm whitespace-nowrap transition-colors pb-3 ${
                  selectedCategory === category
                    ? 'text-white font-medium'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                {category}
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
              <span className="hidden sm:inline">Narzędzia</span>
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
                <Link to="/brief" className="w-full flex items-center gap-2">
                  <i className="ri-newspaper-line" />
                  Daily Brief
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/asystent" className="w-full flex items-center gap-2">
                  <i className="ri-robot-2-line" />
                  AI Asystent
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/sejm" className="w-full flex items-center gap-2">
                  <i className="ri-government-line" />
                  Sejm
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/gielda" className="w-full flex items-center gap-2">
                  <i className="ri-line-chart-line" />
                  Giełda
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/mapa" className="w-full flex items-center gap-2">
                  <i className="ri-map-pin-line" />
                  Mapa wydarzeń
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dane" className="w-full flex items-center gap-2">
                  <i className="ri-database-2-line" />
                  Otwarte Dane
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/terminal" className="w-full flex items-center gap-2">
                  <i className="ri-terminal-line" />
                  Terminal
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/powiazania" className="w-full flex items-center gap-2">
                  <i className="ri-mind-map" />
                  Powiązania
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/archiwum" className="w-full flex items-center gap-2">
                  <i className="ri-archive-line" />
                  Archiwum
                </Link>
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
