import { LocalizedLink } from '@/components/LocalizedLink';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LiveBadge } from './LiveBadge';

interface DataPanelProps {
  title: string;
  icon?: string;
  href?: string;
  isLive?: boolean;
  source?: string;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function DataPanel({
  title,
  icon,
  href,
  isLive,
  source,
  loading,
  className,
  children,
}: DataPanelProps) {
  const content = (
    <Card
      className={cn(
        'group transition-all',
        href && 'hover:border-foreground/20 cursor-pointer',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {icon && <i className={cn(icon, 'text-lg text-zinc-500')} />}
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </CardTitle>
          {isLive && <LiveBadge />}
        </div>
        {href && (
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
          </div>
        ) : (
          children
        )}
      </CardContent>
      {source && (
        <CardFooter className="pt-0">
          <p className="text-xs text-muted-foreground">Źródło: {source}</p>
        </CardFooter>
      )}
    </Card>
  );

  if (href) {
    return <LocalizedLink to={href}>{content}</LocalizedLink>;
  }

  return content;
}

interface DataPanelStatProps {
  value: string | number;
  label: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function DataPanelStat({ value, label, color, size = 'md' }: DataPanelStatProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div>
      <p
        className={cn('font-bold', sizeClasses[size])}
        style={color ? { color } : undefined}
      >
        {value}
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
