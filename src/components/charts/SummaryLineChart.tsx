import { useEffect, useRef, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
  type TooltipItem,
  type Tick,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Line } from 'react-chartjs-2';
import {
  detectDateScale,
  parseLabelsToTimestamps,
  calculateYBounds,
  formatChartNumber,
  CHART_COLORS,
  POLISH_MONTHS_SHORT,
  type DateScale,
} from '../../utils/chartUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
);

export interface LineChartData {
  id: string;
  title: string;
  unit: string;
  items: { label: string; value: number }[];
}

interface SummaryLineChartProps {
  data: LineChartData;
}

export function SummaryLineChart({ data }: SummaryLineChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  // Parse data and detect date scale
  const { chartData, options } = useMemo(() => {
    const rawLabels = data.items.map((d) => d.label);
    const values = data.items.map((d) => d.value);
    const dateScale = detectDateScale(rawLabels);

    // Colors (light mode - TODO: add dark mode support)
    const colors = CHART_COLORS.line.light;
    const gridColor = CHART_COLORS.grid.light;
    const tickColor = CHART_COLORS.tick.light;

    // Calculate smart Y bounds
    const { yMin, yMax } = calculateYBounds(values);

    // Check if data spans multiple years (for label formatting)
    let spansMultipleYears = false;
    let isMixedFormat = false;

    if (dateScale) {
      const hasTimeFormats = rawLabels.some(l => l.includes('T'));
      const hasDateOnlyFormats = rawLabels.some(l => !l.includes('T') && /^\d{4}-\d{2}-\d{2}$/.test(l.trim()));
      isMixedFormat = hasTimeFormats && hasDateOnlyFormats;

      const timestamps = parseLabelsToTimestamps(rawLabels, dateScale);
      const minYear = new Date(Math.min(...timestamps)).getFullYear();
      const maxYear = new Date(Math.max(...timestamps)).getFullYear();
      spansMultipleYears = minYear !== maxYear;

      // Time-proportional chart with linear X axis
      const minTs = Math.min(...timestamps);
      const maxTs = Math.max(...timestamps);
      const dataPoints = timestamps.map((ts, i) => ({ x: ts, y: values[i] }));

      const chartData = {
        datasets: [{
          data: dataPoints,
          borderColor: colors.border,
          borderWidth: 3,
          fill: false,
          tension: 0.1,
          pointRadius: 5,
          pointBackgroundColor: colors.point,
          pointBorderColor: colors.pointBorder,
          pointBorderWidth: 2,
        }],
      };

      const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          datalabels: {
            anchor: 'end',
            align: 'top',
            offset: 4,
            color: tickColor,
            font: { size: 10, weight: 'bold' },
            formatter: (value: { y: number }) => formatChartNumber(value.y),
          },
        },
        scales: {
          x: {
            type: 'linear',
            min: minTs,
            max: maxTs,
            grid: { color: gridColor },
            afterBuildTicks: function(axis) {
              // Smart tick generation with ghost ticks for gaps
              const timeSpan = maxTs - minTs;
              const dayMs = 24 * 60 * 60 * 1000;
              const spanDays = timeSpan / dayMs;

              if (spanDays > 365 && dateScale === 'year') {
                // Year scale - show ALL years as ghost ticks
                const startYear = new Date(minTs).getFullYear();
                const endYear = new Date(maxTs).getFullYear();
                const allYearTicks: number[] = [];
                for (let year = startYear; year <= endYear; year++) {
                  allYearTicks.push(new Date(year, 6, 1, 12, 0, 0).getTime());
                }
                axis.ticks = allYearTicks.map(ts => ({ value: ts })) as Tick[];
              } else if (spanDays > 60 && (dateScale === 'month' || dateScale === 'day')) {
                // Month scale - show all months
                const monthTicks: number[] = [];
                const startDate = new Date(minTs);
                const endDate = new Date(maxTs);
                let current = new Date(startDate.getFullYear(), startDate.getMonth(), 15, 12, 0, 0);
                while (current.getTime() <= endDate.getTime()) {
                  monthTicks.push(current.getTime());
                  current = new Date(current.getFullYear(), current.getMonth() + 1, 15, 12, 0, 0);
                }
                axis.ticks = monthTicks.map(ts => ({ value: ts })) as Tick[];
              } else {
                // Small range - show ticks at data points
                axis.ticks = timestamps.map(ts => ({ value: ts })) as Tick[];
              }
            },
            ticks: {
              color: tickColor,
              font: { size: 11 },
              callback: function(value: number | string) {
                const numValue = typeof value === 'string' ? parseFloat(value) : value;
                const date = new Date(numValue);
                const shortYear = `'${String(date.getFullYear()).slice(-2)}`;
                const hours = date.getHours();
                const minutes = date.getMinutes();
                const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                const dateStr = `${date.getDate()} ${POLISH_MONTHS_SHORT[date.getMonth()]}`;
                const dateYearStr = `${dateStr} ${shortYear}`;

                // Check if this tick corresponds to an actual data point
                const tolerance = 24 * 60 * 60 * 1000; // 1 day tolerance
                const isDataPoint = timestamps.some(ts => Math.abs(ts - numValue) < tolerance);

                if (dateScale === 'year') {
                  return isDataPoint ? `${date.getFullYear()}` : '';
                } else if (dateScale === 'day') {
                  return spansMultipleYears ? dateYearStr : dateStr;
                } else if (dateScale === 'month') {
                  if (!isDataPoint) return '';
                  return spansMultipleYears
                    ? `${POLISH_MONTHS_SHORT[date.getMonth()]} ${shortYear}`
                    : POLISH_MONTHS_SHORT[date.getMonth()];
                } else {
                  // minute/hour scale
                  const isEndOfDay = hours === 23 && minutes === 59;
                  if (isMixedFormat) {
                    if (isEndOfDay) {
                      return spansMultipleYears ? dateYearStr : dateStr;
                    } else {
                      return spansMultipleYears ? `${dateYearStr} ${timeStr}` : `${dateStr} ${timeStr}`;
                    }
                  } else {
                    if (spansMultipleYears) {
                      return `${dateYearStr} ${timeStr}`;
                    }
                    return timeStr;
                  }
                }
              },
            },
          },
          y: {
            min: yMin,
            max: yMax,
            grid: { color: gridColor },
            title: data.unit ? {
              display: true,
              text: `[${data.unit}]`,
              color: tickColor,
              font: { size: 11 },
            } : undefined,
            ticks: {
              color: tickColor,
              font: { size: 11 },
            },
          },
        },
      };

      return { chartData, options };
    } else {
      // Non-date labels: use category scale (original behavior)
      const chartData = {
        labels: rawLabels,
        datasets: [{
          data: values,
          borderColor: colors.border,
          borderWidth: 3,
          fill: false,
          tension: 0.1,
          pointRadius: 5,
          pointBackgroundColor: colors.point,
          pointBorderColor: colors.pointBorder,
          pointBorderWidth: 2,
        }],
      };

      const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          datalabels: {
            anchor: 'end',
            align: 'top',
            offset: 4,
            color: tickColor,
            font: { size: 10, weight: 'bold' },
            formatter: (value: number) => formatChartNumber(value),
          },
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: {
              color: tickColor,
              font: { size: 11 },
            },
          },
          y: {
            min: yMin,
            max: yMax,
            grid: { color: gridColor },
            title: data.unit ? {
              display: true,
              text: `[${data.unit}]`,
              color: tickColor,
              font: { size: 11 },
            } : undefined,
            ticks: {
              color: tickColor,
              font: { size: 11 },
            },
          },
        },
      };

      return { chartData, options };
    }
  }, [data]);

  return (
    <div className="chart-box">
      <span className="chart-label">WYKRES</span>
      <div className="chart-title">{data.title}</div>
      <div className="h-[200px] p-3">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
}
