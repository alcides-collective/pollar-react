import { cn } from '@/lib/utils';
import { LiveBadge } from './LiveBadge';

interface DaneHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  isLive?: boolean;
  lastUpdate?: string;
  className?: string;
}

export function DaneHeader({
  title,
  subtitle,
  icon,
  isLive,
  lastUpdate,
  className,
}: DaneHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      <div className="flex items-center gap-3 mb-2">
        {icon && <i className={cn(icon, 'text-2xl text-content')} />}
        <h1 className="text-2xl font-bold">{title}</h1>
        {isLive && <LiveBadge />}
      </div>
      {subtitle && (
        <p className="text-muted-foreground">{subtitle}</p>
      )}
      {lastUpdate && (
        <p className="text-xs text-muted-foreground mt-1">
          Ostatnia aktualizacja: {lastUpdate}
        </p>
      )}
    </div>
  );
}
