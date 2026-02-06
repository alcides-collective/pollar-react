import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LocalizedNavLink } from '../LocalizedLink';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

const navIcons: Record<string, string> = {
  overview: 'ri-dashboard-line',
  mps: 'ri-user-line',
  clubs: 'ri-team-line',
  proceedings: 'ri-calendar-event-line',
  committees: 'ri-group-line',
  votings: 'ri-hand-coin-line',
  videos: 'ri-live-line',
  prints: 'ri-file-text-line',
  legislation: 'ri-scales-3-line',
  interpellations: 'ri-question-answer-line',
  questions: 'ri-questionnaire-line',
};

function isActiveLink(href: string, pathname: string): boolean {
  // Remove language prefix for comparison
  const pathWithoutLang = pathname.replace(/^\/(en|de)/, '') || '/';
  if (href === '/sejm') {
    return pathWithoutLang === '/sejm';
  }
  return pathWithoutLang.startsWith(href);
}

function getActiveLabel(
  pathname: string,
  t: (key: string) => string,
): { label: string; icon: string } {
  for (const entry of navigationConfig) {
    if (isGroup(entry)) {
      for (const item of entry.items) {
        if (isActiveLink(item.href, pathname)) {
          return {
            label: t(`navigation.${item.labelKey}`),
            icon: navIcons[item.labelKey] || 'ri-menu-line',
          };
        }
      }
    } else if (isActiveLink(entry.href, pathname)) {
      return {
        label: t(`navigation.${entry.labelKey}`),
        icon: navIcons[entry.labelKey] || 'ri-menu-line',
      };
    }
  }
  return { label: t('navigation.overview'), icon: navIcons.overview };
}

export function SejmNav() {
  const { t } = useTranslation('sejm');
  const location = useLocation();
  const pathname = location.pathname;
  const active = getActiveLabel(pathname, t);

  return (
    <>
      {/* Mobile: Dropdown menu */}
      <div className="lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full h-10 flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 text-sm shadow-xs hover:bg-zinc-50 transition-colors outline-none">
            <span className="flex items-center gap-2">
              <i className={`${active.icon} text-base text-zinc-500`} />
              <span className="font-medium">{active.label}</span>
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[calc(100vw-2rem)]">
            {navigationConfig.map((entry, idx) => {
              if (isGroup(entry)) {
                return (
                  <DropdownMenuGroup key={entry.labelKey}>
                    {idx > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuLabel>{t(`navigation.${entry.labelKey}`)}</DropdownMenuLabel>
                    {entry.items.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <LocalizedNavLink to={item.href} className="w-full flex items-center gap-2">
                          <i className={navIcons[item.labelKey] || 'ri-file-line'} />
                          {t(`navigation.${item.labelKey}`)}
                          {isActiveLink(item.href, pathname) && <i className="ri-check-line ml-auto" />}
                        </LocalizedNavLink>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                );
              }
              return (
                <DropdownMenuItem key={entry.href} asChild>
                  <LocalizedNavLink to={entry.href} className="w-full flex items-center gap-2">
                    <i className={navIcons[entry.labelKey] || 'ri-file-line'} />
                    <span className="font-medium">{t(`navigation.${entry.labelKey}`)}</span>
                    {isActiveLink(entry.href, pathname) && <i className="ri-check-line ml-auto" />}
                  </LocalizedNavLink>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
                  <LocalizedNavLink
                    key={item.href}
                    to={item.href}
                    className={`px-3 py-2 rounded-md text-sm transition-colors ${
                      isActiveLink(item.href, pathname)
                        ? 'bg-zinc-100 text-zinc-900 font-medium'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                  >
                    {t(`navigation.${item.labelKey}`)}
                  </LocalizedNavLink>
                ))}
              </div>
            );
          }
          return (
            <LocalizedNavLink
              key={entry.href}
              to={entry.href}
              className={`px-3 py-2 rounded-md text-sm font-medium border-b border-zinc-100 pb-3 mb-2 transition-colors ${
                isActiveLink(entry.href, pathname)
                  ? 'text-zinc-900'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {t(`navigation.${entry.labelKey}`)}
            </LocalizedNavLink>
          );
        })}
      </nav>
    </>
  );
}
