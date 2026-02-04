import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

type NavItem = { href: string; labelKey: string };
type NavGroup = { labelKey: string; items: NavItem[] };
type NavEntry = NavItem | NavGroup;

const navigationConfig: NavEntry[] = [
  { href: '/sejm', labelKey: 'overview' },
  {
    labelKey: 'people',
    items: [
      { href: '/sejm/poslowie', labelKey: 'mps' },
      { href: '/sejm/kluby', labelKey: 'clubs' },
    ],
  },
  {
    labelKey: 'work',
    items: [
      { href: '/sejm/posiedzenia', labelKey: 'proceedings' },
      { href: '/sejm/komisje', labelKey: 'committees' },
      { href: '/sejm/glosowania', labelKey: 'votings' },
      { href: '/sejm/transmisje', labelKey: 'videos' },
    ],
  },
  {
    labelKey: 'documents',
    items: [
      { href: '/sejm/druki', labelKey: 'prints' },
      { href: '/sejm/procesy', labelKey: 'legislation' },
      { href: '/sejm/interpelacje', labelKey: 'interpellations' },
      { href: '/sejm/zapytania', labelKey: 'questions' },
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
  const { t } = useTranslation('sejm');
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <>
      {/* Mobile: Horizontal scroll */}
      <nav className="lg:hidden flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {navigationConfig.map((entry) => {
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
                {t(`navigation.${item.labelKey}`)}
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
              {t(`navigation.${entry.labelKey}`)}
            </NavLink>
          );
        })}
      </nav>

      {/* Desktop: Vertical sidebar */}
      <nav className="hidden lg:flex flex-col gap-6">
        {navigationConfig.map((entry) => {
          if (isGroup(entry)) {
            return (
              <div key={entry.labelKey} className="flex flex-col gap-1">
                <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider px-2 mb-1">
                  {t(`navigation.${entry.labelKey}`)}
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
                    {t(`navigation.${item.labelKey}`)}
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
              {t(`navigation.${entry.labelKey}`)}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
