import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { EurostatTimeSeriesPoint } from '@/types/dane';
import { useIsDarkMode } from '@/stores/themeStore';
import { CHART_COLORS } from '@/utils/chartUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface EurostatLineChartProps {
  data: EurostatTimeSeriesPoint[];
  title: string;
  color?: string;
  unit?: string;
}

export function EurostatLineChart({
  data,
  title,
  color = '#3b82f6',
  unit = ''
}: EurostatLineChartProps) {
  const isDark = useIsDarkMode();
  const gridColor = isDark ? CHART_COLORS.grid.dark : CHART_COLORS.grid.light;
  const tickColor = isDark ? CHART_COLORS.tick.dark : CHART_COLORS.tick.light;

  const chartData = {
    labels: data.map((d) => d.period ?? d.year?.toString() ?? ''),
    datasets: [
      {
        label: unit || title,
        data: data.map((d) => d.value),
        borderColor: color,
        backgroundColor: color,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        color: tickColor,
      },
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: tickColor },
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: tickColor },
      },
    },
  };

  return (
    <div className="h-[200px]">
      <Line data={chartData} options={options} />
    </div>
  );
}
