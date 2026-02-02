import { cn } from '@/lib/utils';
import type { PowiazaniaCategory } from '@/types/powiazania';
import './powiazania.css';

interface PowiazaniaCategoryRowProps {
  category: PowiazaniaCategory;
  isPositionedAbsolute?: boolean;
  isRevealing?: boolean;
  isPushingDown?: boolean;
  animatingRowIndex?: number | null;
  solvedCategoriesCount?: number;
}

export function PowiazaniaCategoryRow({
  category,
  isPositionedAbsolute = false,
  isRevealing = false,
  isPushingDown = false,
  solvedCategoriesCount = 0,
}: PowiazaniaCategoryRowProps) {
  const wrapperStyle: React.CSSProperties = isPositionedAbsolute
    ? {
        position: 'absolute',
        top: `calc(${solvedCategoriesCount} * (var(--pow-tile-size) + 0.5rem))`,
        left: 0,
        right: 0,
        zIndex: 999,
        willChange: 'transform',
        overflow: 'hidden',
        height: 'calc(var(--pow-tile-size, 4rem) + 0.5rem)',
        transformOrigin: 'top',
        transform: isRevealing ? undefined : 'scaleY(0)',
        pointerEvents: 'none',
        boxSizing: 'border-box',
      }
    : { position: 'relative', zIndex: 10 };

  return (
    <div
      className={cn(
        'pb-2',
        isRevealing && 'category-revealing',
        isPushingDown && 'category-pushing-down'
      )}
      style={wrapperStyle}
    >
      <div
        className={cn(
          'p-3 text-center flex flex-col justify-center box-border w-full',
          isRevealing && 'content-fade-in'
        )}
        style={{
          backgroundColor: category.color,
          color: 'white',
          height: 'var(--pow-tile-size, 4rem)',
          minHeight: 'var(--pow-tile-size, 4rem)',
          boxSizing: 'border-box',
        }}
      >
        <div className="text-xs uppercase tracking-widest mb-1 opacity-90">
          {category.name}
        </div>
        <div className="text-sm leading-tight">{category.words.join(', ')}</div>
      </div>
    </div>
  );
}
