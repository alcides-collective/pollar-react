import { Link } from 'react-router-dom';
import { useEvents } from '../stores/eventsStore';
import { useUIStore } from '../stores/uiStore';
import { useMemo, useState, useEffect, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import logoImg from '../assets/logo.png';

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
      className="bg-black fixed top-0 left-0 right-0 z-50"
      initial={false}
      animate={{ y: isVisible ? 0 : '-100%' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4 border-b border-zinc-800">
          <div className="flex items-center gap-10">
            <Link to="/" onClick={() => setSelectedCategory(null)}>
              <img
                src={logoImg}
                alt="Pollar"
                className="h-5 invert"
              />
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-zinc-300 hover:text-white transition-colors">
              Zaloguj się
            </a>
            <button className="border border-zinc-500 hover:border-white text-white text-sm px-5 py-2 rounded transition-colors">
              Subskrybuj
            </button>
            <button className="text-zinc-300 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-start justify-between pt-3 gap-4">
          <div
            className="flex items-center gap-6 lg:gap-8 overflow-x-auto scrollbar-hide -mx-6 px-6"
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
          <DropdownMenu>
            <DropdownMenuTrigger className="text-sm text-zinc-400 hover:text-white shrink-0 hidden sm:flex items-center gap-1 transition-colors outline-none">
              Narzędzia
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Link to="/brief" className="w-full">Daily Brief</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/sejm" className="w-full">Sejm</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/mapa" className="w-full">Mapa wydarzeń</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/dane" className="w-full">Otwarte Dane</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="w-full">Archiwum</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </motion.header>
    {/* Spacer for fixed header */}
    <div style={{ height: headerHeight }} />
    </>
  );
}
