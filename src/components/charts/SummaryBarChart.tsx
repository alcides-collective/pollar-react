import { useEffect, useRef, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';
import { CHART_COLORS } from '../../utils/chartUtils';
import { useIsDarkMode } from '@/stores/themeStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

export interface BarChartData {
  id: string;
  title: string;
  unit: string;
  items: { label: string; value: number }[];
}

interface SummaryBarChartProps {
  data: BarChartData;
}

export function SummaryBarChart({ data }: SummaryBarChartProps) {
  const chartRef = useRef<ChartJS<'bar'>>(null);
  const isDark = useIsDarkMode();

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const { chartData, options, chartHeight } = useMemo(() => {
    const labels = data.items.map((d) => d.label);
    const values = data.items.map((d) => d.value);

    // Colors (theme-aware)
    const barColors = isDark ? CHART_COLORS.bar.dark : CHART_COLORS.bar.light;
    const gridColor = isDark ? CHART_COLORS.grid.dark : CHART_COLORS.grid.light;
    const tickColor = isDark ? CHART_COLORS.tick.dark : CHART_COLORS.tick.light;

    // Calculate smart min/max - don't always start from 0
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue;
    // If all values are the same, use 20% of the value as padding (or 1 if value is 0)
    const padding = range > 0 ? range * 0.1 : Math.max(Math.abs(maxValue) * 0.2, 1);

    // Determine bounds based on data sign
    const allPositive = minValue >= 0;
    const allNegative = maxValue <= 0;

    // Calculate smart bounds
    let smartMin = Math.floor(minValue - padding);
    let smartMax = Math.ceil(maxValue + padding);

    if (allPositive) {
      smartMin = Math.max(0, smartMin);
    } else if (allNegative) {
      smartMax = Math.min(0, smartMax);
    }

    const chartData = {
      labels,
      datasets: [{
        data: values,
        backgroundColor: labels.map((_, i) => barColors[i % barColors.length]),
        borderWidth: 0,
        borderRadius: 2,
      }],
    };

    const options: ChartOptions<'bar'> = {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      indexAxis: 'y', // Horizontal bars
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
        datalabels: {
          anchor: (context) => {
            const value = context.dataset.data[context.dataIndex] as number;
            return value >= 0 ? 'end' : 'start';
          },
          align: (context) => {
            const value = context.dataset.data[context.dataIndex] as number;
            return value >= 0 ? 'end' : 'start';
          },
          color: tickColor,
          font: { size: 11, weight: 'bold' },
          formatter: (value: number) => {
            // Format number
            let formatted: string;
            if (Math.abs(value) >= 1000000) {
              formatted = (value / 1000000).toFixed(1) + 'M';
            } else if (Math.abs(value) >= 1000) {
              formatted = (value / 1000).toFixed(1) + 'k';
            } else if (Number.isInteger(value)) {
              formatted = value.toString();
            } else {
              formatted = value.toFixed(2);
            }
            // Add unit if not "liczba"
            const displayUnit = data.unit.toLowerCase() === 'liczba' ? '' : ` ${data.unit}`;
            return `${formatted}${displayUnit}`;
          },
        },
      },
      scales: {
        x: {
          min: smartMin - (minValue < 0 ? padding * 0.5 : 0), // Extra space for negative labels
          max: smartMax + (maxValue >= 0 ? padding * 0.5 : 0), // Extra space for positive labels
          grid: { color: gridColor },
          title: data.unit && data.unit.toLowerCase() !== 'liczba' ? {
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
        y: {
          grid: { display: false },
          ticks: {
            color: tickColor,
            font: { size: 11 },
          },
        },
      },
    };

    // Dynamic height based on number of items (more compact for few items)
    const chartHeight = Math.max(150, labels.length <= 3 ? labels.length * 50 + 40 : labels.length * 40 + 40);

    return { chartData, options, chartHeight };
  }, [data, isDark]);

  return (
    <div className="chart-box">
      <span className="chart-label">WYKRES</span>
      <div className="chart-title">{data.title}</div>
      <div style={{ height: chartHeight }} className="p-3">
        <Bar ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
}
