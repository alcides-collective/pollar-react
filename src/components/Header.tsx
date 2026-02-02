import { useEvents } from '../hooks/useEvents';
import { useCategory } from '../context/CategoryContext';
import { useMemo, useState, useRef, useEffect } from 'react';
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
  const { selectedCategory, setSelectedCategory } = useCategory();
  const [showMore, setShowMore] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const visibleCategories = allCategories.slice(0, 7);
  const hiddenCategories = allCategories.slice(7);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMore(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-black sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4 border-b border-zinc-800">
          <div className="flex items-center gap-10">
            <img
              src={logoImg}
              alt="Pollar"
              className="h-5 invert"
            />
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
        <nav className="flex items-center justify-between py-3 gap-4">
          <div
            className="flex items-center gap-6 lg:gap-8 overflow-x-auto scrollbar-hide -mx-6 px-6"
            role="region"
            aria-label="Kategorie"
            tabIndex={0}
          >
            <button
              onClick={() => setSelectedCategory(null)}
              className={`text-sm whitespace-nowrap transition-colors ${
                selectedCategory === null
                  ? 'text-white font-medium'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              Wszystkie
            </button>
            {visibleCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'text-white font-medium'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
            {hiddenCategories.length > 0 && (
              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  onClick={() => setShowMore(!showMore)}
                  className="text-sm text-zinc-300 hover:text-white transition-colors flex items-center gap-1 whitespace-nowrap"
                >
                  Więcej
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-3 w-3 transition-transform ${showMore ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showMore && (
                  <div className="absolute top-full left-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl py-2 min-w-[200px] z-50">
                    {hiddenCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowMore(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                          selectedCategory === category
                            ? 'text-white bg-zinc-800'
                            : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="text-sm text-zinc-400 shrink-0 hidden sm:block">
            Narzędzia
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </nav>
      </div>
    </header>
  );
}
