import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';
import { LocalizedLink } from '../LocalizedLink';

type NavItem = { href: string; label: string };
type NavGroup = { label: string; items: NavItem[] };
type NavEntry = NavItem | NavGroup;

function useNavigation(): NavEntry[] {
  const { t } = useTranslation('gielda');
  return [
    { href: '/gielda', label: t('navigation.overview') },
    {
      label: t('navigation.markets'),
      items: [
        { href: '/gielda/akcje', label: t('navigation.stocks') },
        { href: '/gielda/indeksy', label: t('navigation.indices') },
      ],
    },
    { href: '/gielda/watchlist', label: t('navigation.watchlist') },
  ];
}

function isGroup(entry: NavEntry): entry is NavGroup {
  return 'items' in entry;
}

function isActiveLink(href: string, pathname: string): boolean {
  // Remove language prefix for comparison
  const pathWithoutLang = pathname.replace(/^\/(en|de)/, '') || '/';
  if (href === '/gielda') {
    return pathWithoutLang === '/gielda';
  }
  return pathWithoutLang.startsWith(href);
}

function isGroupActive(group: NavGroup, pathname: string): boolean {
  return group.items.some(item => isActiveLink(item.href, pathname));
}

function getActiveLabel(group: NavGroup, pathname: string): string | null {
  const active = group.items.find(item => isActiveLink(item.href, pathname));
  return active?.label || null;
}

interface GieldaNavProps {
  className?: string;
}

export function GieldaNav({ className }: GieldaNavProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const navigation = useNavigation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const justOpenedRef = useRef(false);

  const toggleDropdown = (label: string, event: React.MouseEvent) => {
    if (openDropdown === label) {
      setOpenDropdown(null);
    } else {
      const btn = event.currentTarget as HTMLElement;
      const rect = btn.getBoundingClientRect();
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - 168));
      setDropdownPosition({
        top: rect.bottom + 4,
        left,
      });
      setOpenDropdown(label);
      justOpenedRef.current = true;
      setTimeout(() => {
        justOpenedRef.current = false;
      }, 100);
    }
  };

  const closeDropdown = () => {
    if (!justOpenedRef.current) {
      setOpenDropdown(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (justOpenedRef.current) return;
      const target = event.target as HTMLElement;
      if (!target.closest('.nav-dropdown') && !target.closest('.dropdown-menu')) {
        closeDropdown();
      }
    };

    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const openGroup = openDropdown
    ? (navigation.find(e => isGroup(e) && e.label === openDropdown) as NavGroup | undefined)
    : null;

  return (
    <>
      {/* Mobile: Horizontal with dropdowns */}
      <nav className={cn('flex gap-2 lg:hidden overflow-x-auto scrollbar-hide pb-1', className)}>
        {navigation.map((entry, i) =>
          isGroup(entry) ? (
            <div key={i} className="nav-dropdown flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDropdown(entry.label, e);
                }}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] tracking-[0.05em] uppercase whitespace-nowrap transition-colors border min-w-[140px] justify-center',
                  isGroupActive(entry, pathname)
                    ? 'bg-black text-white dark:bg-white dark:text-black border-transparent'
                    : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white border-black/15 dark:border-white/15'
                )}
              >
                <span>
                  {isGroupActive(entry, pathname) ? getActiveLabel(entry, pathname) : entry.label}
                </span>
                <ChevronDown
                  className={cn(
                    'w-3 h-3 transition-transform',
                    openDropdown === entry.label && 'rotate-180'
                  )}
                />
              </button>
            </div>
          ) : (
            <LocalizedLink
              key={i}
              to={entry.href}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded text-[12px] tracking-[0.05em] uppercase whitespace-nowrap transition-colors border flex-shrink-0',
                isActiveLink(entry.href, pathname)
                  ? 'bg-black text-white dark:bg-white dark:text-black border-transparent'
                  : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white border-black/15 dark:border-white/15'
              )}
            >
              <span>{entry.label}</span>
            </LocalizedLink>
          )
        )}
      </nav>

      {/* Dropdown menu portal */}
      {openGroup && (
        <div
          className="dropdown-menu fixed py-1 bg-white dark:bg-neutral-900 rounded-sm shadow-lg border border-black/10 dark:border-white/10 min-w-[160px] z-[9999] animate-in fade-in slide-in-from-top-1 duration-150"
          style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
          onClick={(e) => e.stopPropagation()}
        >
          {openGroup.items.map((item, i) => (
            <LocalizedLink
              key={i}
              to={item.href}
              onClick={closeDropdown}
              className={cn(
                'block px-4 py-2 text-[12px] tracking-[0.05em] uppercase transition-colors',
                isActiveLink(item.href, pathname)
                  ? 'bg-black/5 dark:bg-white/5 text-black dark:text-white'
                  : 'text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
              )}
            >
              {item.label}
            </LocalizedLink>
          ))}
        </div>
      )}

      {/* Desktop: Vertical sidebar */}
      <nav className={cn('hidden lg:flex flex-col gap-6', className)}>
        {navigation.map((entry, i) =>
          isGroup(entry) ? (
            <div key={i} className="flex flex-col gap-1">
              <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-black/40 dark:text-white/40 px-2 mb-1">
                {entry.label}
              </div>
              <div className="flex flex-col gap-0.5">
                {entry.items.map((item, j) => (
                  <LocalizedLink
                    key={j}
                    to={item.href}
                    className={cn(
                      'block text-[13px] px-3 py-2 rounded-md transition-all duration-150',
                      isActiveLink(item.href, pathname)
                        ? 'text-black dark:text-white bg-black/5 dark:bg-white/8 font-medium'
                        : 'text-black/60 dark:text-white/60 hover:text-black/90 dark:hover:text-white/90 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
                    )}
                  >
                    {item.label}
                  </LocalizedLink>
                ))}
              </div>
            </div>
          ) : (
            <LocalizedLink
              key={i}
              to={entry.href}
              className={cn(
                'block text-[13px] font-medium px-0 py-2 border-b border-black/10 dark:border-white/10 transition-colors mb-2',
                isActiveLink(entry.href, pathname)
                  ? 'text-black dark:text-white'
                  : 'text-black/60 dark:text-white/60 hover:text-black/90 dark:hover:text-white/90'
              )}
            >
              {entry.label}
            </LocalizedLink>
          )
        )}
      </nav>
    </>
  );
}
