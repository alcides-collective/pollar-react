import { useState, useMemo } from 'react';
import { cn } from '../../lib/utils';
import type { HistoricalDataPoint } from '../../types/gielda';

interface AreaChartProps {
  data: HistoricalDataPoint[];
  height?: number;
  showLabels?: boolean;
  showPoints?: boolean;
  className?: string;
}

interface DataPoint {
  x: number;
  y: number;
  value: number;
  date: string;
}

export function AreaChart({
  data = [],
  height = 192,
  showLabels = true,
  showPoints = true,
  className,
}: AreaChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const padding = { top: 10, right: 0, bottom: 0, left: 0 };

  const chartData = useMemo(() => {
    if (data.length === 0) return null;

    const chartHeight = height - padding.top - padding.bottom;
    const prices = data.map(d => d.close);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    const isUptrend = data.length > 1 ? data[data.length - 1].close >= data[0].close : true;

    const stepX = 100 / (data.length - 1 || 1);

    const dataPoints: DataPoint[] = data.map((point, i) => ({
      x: i * stepX,
      y: chartHeight - ((point.close - minPrice) / priceRange) * chartHeight + padding.top,
      value: point.close,
      date: point.date,
    }));

    const linePath = data
      .map((point, i) => {
        const x = i * stepX;
        const y = chartHeight - ((point.close - minPrice) / priceRange) * chartHeight + padding.top;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    const fullHeight = chartHeight + padding.top;
    const areaPath = linePath + ` L 100 ${fullHeight} L 0 ${fullHeight} Z`;

    return { dataPoints, linePath, areaPath, isUptrend };
  }, [data, height]);

  const handlePointHover = (point: DataPoint, event: React.MouseEvent) => {
    setHoveredPoint(point);
    const rect = (event.currentTarget as HTMLElement).parentElement?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({
        x: (point.x / 100) * rect.width,
        y: (point.y / height) * rect.height,
      });
    }
  };

  if (!chartData || data.length === 0) {
    return (
      <div className={cn('text-center py-12 text-black/40 dark:text-white/40', className)}>
        Brak danych historycznych
      </div>
    );
  }

  const { dataPoints, linePath, areaPath, isUptrend } = chartData;
  const strokeColor = isUptrend ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';

  return (
    <div className={cn('w-full', className)}>
      <div className="relative w-full" style={{ height }}>
        <svg
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
          className="w-full h-full block"
        >
          <defs>
            <linearGradient id="gradientUp" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="gradientDown" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(239, 68, 68)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="rgb(239, 68, 68)" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          <path
            d={areaPath}
            fill={`url(#${isUptrend ? 'gradientUp' : 'gradientDown'})`}
            className="transition-opacity duration-200 hover:opacity-80"
          />

          <path
            d={linePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
            className="stroke-linecap-round stroke-linejoin-round"
          />
        </svg>

        {showPoints && (
          <div className="absolute inset-0 pointer-events-none">
            {dataPoints.map((point, i) => (
              <div
                key={i}
                className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group"
                style={{ left: `${point.x}%`, top: `${(point.y / height) * 100}%` }}
                onMouseEnter={(e) => handlePointHover(point, e)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <div
                  className={cn(
                    'absolute top-1/2 left-1/2 w-1 h-1 rounded-full -translate-x-1/2 -translate-y-1/2',
                    'opacity-50 transition-all duration-150 group-hover:opacity-100 group-hover:w-1.5 group-hover:h-1.5',
                    isUptrend ? 'bg-green-500' : 'bg-red-500'
                  )}
                />
              </div>
            ))}

            {hoveredPoint && (
              <div
                className="absolute z-10 pointer-events-none animate-in fade-in duration-150"
                style={{
                  left: tooltipPos.x,
                  top: tooltipPos.y,
                  transform: 'translate(-50%, -120%)',
                }}
              >
                <div className="bg-zinc-900/70 backdrop-blur-xl backdrop-saturate-150 rounded-xl px-3 py-2.5 flex flex-col items-center gap-0.5 border border-white/10 ring-1 ring-white/5 shadow-xl shadow-black/30">
                  <span
                    className={cn(
                      'font-mono text-sm font-semibold',
                      isUptrend ? 'text-green-400' : 'text-red-400'
                    )}
                  >
                    {hoveredPoint.value.toLocaleString('pl-PL', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span className="text-[10px] text-zinc-400">{hoveredPoint.date}</span>
                </div>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-l-6 border-r-6 border-t-6 border-transparent border-t-zinc-900/70" />
              </div>
            )}
          </div>
        )}
      </div>

      {showLabels && data.length > 0 && (
        <div className="flex justify-between mt-2 text-xs text-black/40 dark:text-white/40 font-mono">
          <span>{data[0]?.date}</span>
          <span>{data[data.length - 1]?.date}</span>
        </div>
      )}
    </div>
  );
}
