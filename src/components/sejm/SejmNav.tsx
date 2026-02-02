import { NavLink, useLocation } from 'react-router-dom';

type NavItem = { href: string; label: string };
type NavGroup = { label: string; items: NavItem[] };
type NavEntry = NavItem | NavGroup;

const navigation: NavEntry[] = [
  { href: '/sejm', label: 'Przegląd' },
  {
    label: 'Osoby',
    items: [
      { href: '/sejm/poslowie', label: 'Posłowie' },
      { href: '/sejm/kluby', label: 'Kluby' },
    ],
  },
  {
    label: 'Prace',
    items: [
      { href: '/sejm/posiedzenia', label: 'Posiedzenia' },
      { href: '/sejm/komisje', label: 'Komisje' },
      { href: '/sejm/glosowania', label: 'Głosowania' },
      { href: '/sejm/transmisje', label: 'Transmisje' },
    ],
  },
  {
    label: 'Dokumenty',
    items: [
      { href: '/sejm/druki', label: 'Druki' },
      { href: '/sejm/procesy', label: 'Legislacja' },
      { href: '/sejm/interpelacje', label: 'Interpelacje' },
      { href: '/sejm/zapytania', label: 'Zapytania' },
    ],
  },
];

function isGroup(entry: NavEntry): entry is NavGroup {
  return 'items' in entry;
}

function isActiveLink(href: string, pathname: string): boolean {
  if (href === '/sejm') {
    return pathname === '/sejm';
  }
  return pathname.startsWith(href);
}

export function SejmNav() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <>
      {/* Mobile: Horizontal scroll */}
      <nav className="lg:hidden flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {navigation.map((entry) => {
          if (isGroup(entry)) {
            return entry.items.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={`shrink-0 px-3 py-1.5 rounded text-xs uppercase tracking-wide border transition-colors ${
                  isActiveLink(item.href, pathname)
                    ? 'bg-black text-white border-transparent'
                    : 'text-zinc-600 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {item.label}
              </NavLink>
            ));
          }
          return (
            <NavLink
              key={entry.href}
              to={entry.href}
              className={`shrink-0 px-3 py-1.5 rounded text-xs uppercase tracking-wide border transition-colors ${
                isActiveLink(entry.href, pathname)
                  ? 'bg-black text-white border-transparent'
                  : 'text-zinc-600 border-zinc-200 hover:border-zinc-300'
              }`}
            >
              {entry.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Desktop: Vertical sidebar */}
      <nav className="hidden lg:flex flex-col gap-6">
        {navigation.map((entry) => {
          if (isGroup(entry)) {
            return (
              <div key={entry.label} className="flex flex-col gap-1">
                <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider px-2 mb-1">
                  {entry.label}
                </div>
                {entry.items.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={`px-3 py-2 rounded-md text-sm transition-colors ${
                      isActiveLink(item.href, pathname)
                        ? 'bg-zinc-100 text-zinc-900 font-medium'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            );
          }
          return (
            <NavLink
              key={entry.href}
              to={entry.href}
              className={`px-3 py-2 rounded-md text-sm font-medium border-b border-zinc-100 pb-3 mb-2 transition-colors ${
                isActiveLink(entry.href, pathname)
                  ? 'text-zinc-900'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {entry.label}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
