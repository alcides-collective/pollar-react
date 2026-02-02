import { Link } from 'react-router-dom';
import { useEvents } from '../context/EventsContext';
import { useCategory } from '../context/CategoryContext';
import { useMemo } from 'react';
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
    <header className="bg-black sticky top-0 z-50">
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
                  ? 'text-white font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-white after:rounded-full'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              Wszystkie
            </button>
            {allCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`relative text-sm whitespace-nowrap transition-colors pb-3 ${
                  selectedCategory === category
                    ? 'text-white font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-white after:rounded-full'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
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
