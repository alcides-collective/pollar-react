import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DANE_CATEGORIES } from '@/types/dane';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface DaneNavProps {
  mobile?: boolean;
}

export function DaneNav({ mobile }: DaneNavProps) {
  const location = useLocation();

  if (mobile) {
    return (
      <div className="flex gap-2 pb-4">
        <Link to="/dane">
          <Button
            variant={location.pathname === '/dane' ? 'default' : 'outline'}
            size="sm"
          >
            Dashboard
          </Button>
        </Link>
        {DANE_CATEGORIES.map((category) => (
          <DropdownMenu key={category.id}>
            <DropdownMenuTrigger asChild>
              <Button
                variant={location.pathname.includes(category.id) ? 'default' : 'outline'}
                size="sm"
                className="gap-1"
              >
                <i className={category.icon} />
                <span className="hidden sm:inline">{category.name}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {category.subpages.map((subpage) => (
                <DropdownMenuItem key={subpage.id} asChild>
                  <Link to={subpage.path}>{subpage.name}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>
    );
  }

  return (
    <nav className="space-y-6">
      <Link
        to="/dane"
        className={cn(
          'block px-3 py-2 rounded-md text-sm font-medium transition-colors',
          location.pathname === '/dane'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        Dashboard
      </Link>

      {DANE_CATEGORIES.map((category) => (
        <div key={category.id}>
          <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
            <i className={category.icon} />
            {category.name}
          </h3>
          <div className="space-y-1">
            {category.subpages.map((subpage) => (
              <Link
                key={subpage.id}
                to={subpage.path}
                className={cn(
                  'block px-3 py-2 rounded-md text-sm transition-colors',
                  location.pathname === subpage.path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {subpage.name}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
