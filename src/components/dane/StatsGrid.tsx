import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StatItem {
  label: string;
  value: string | number;
  unit?: string;
  change?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  color?: string;
}

interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  loading?: boolean;
  className?: string;
  cardClassName?: string;
}

export function StatsGrid({
  stats,
  columns = 4,
  loading,
  className,
  cardClassName,
}: StatsGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  if (loading) {
    return (
      <div className={cn('grid gap-4', gridCols[columns], className)}>
        {Array.from({ length: columns }).map((_, i) => (
          <Card key={i} className={cardClassName}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {stats.map((stat, index) => (
        <Card key={index} className={cardClassName}>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-1">
              <span
                className="text-2xl font-bold"
                style={stat.color ? { color: stat.color } : undefined}
              >
                {stat.value}
              </span>
              {stat.unit && (
                <span className="text-sm text-muted-foreground">{stat.unit}</span>
              )}
            </div>
            {stat.change && (
              <p
                className={cn(
                  'text-xs mt-1',
                  stat.change.direction === 'up' && 'text-green-600',
                  stat.change.direction === 'down' && 'text-red-600',
                  stat.change.direction === 'neutral' && 'text-muted-foreground'
                )}
              >
                {stat.change.direction === 'up' && '↑'}
                {stat.change.direction === 'down' && '↓'}
                {stat.change.direction === 'neutral' && '→'}
                {' '}
                {Math.abs(stat.change.value)}%
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
