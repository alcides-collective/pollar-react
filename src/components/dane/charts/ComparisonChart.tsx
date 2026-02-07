import { useTranslation } from 'react-i18next';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useIsDarkMode } from '@/stores/themeStore';
import { CHART_COLORS } from '@/utils/chartUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ComparisonItem {
  label: string;
  poland: number;
  eu: number;
  unit: string;
}

interface ComparisonChartProps {
  data: ComparisonItem[];
  title?: string;
}

export function ComparisonChart({ data, title }: ComparisonChartProps) {
  const { t } = useTranslation('dane');
  const isDark = useIsDarkMode();
  const gridColor = isDark ? CHART_COLORS.grid.dark : CHART_COLORS.grid.light;
  const tickColor = isDark ? CHART_COLORS.tick.dark : CHART_COLORS.tick.light;

  const chartData = {
    labels: data.map((d) => `${d.label} (${d.unit})`),
    datasets: [
      {
        label: t('charts.comparison.poland'),
        data: data.map((d) => d.poland),
        backgroundColor: '#dc2626',
      },
      {
        label: t('charts.comparison.eu'),
        data: data.map((d) => d.eu),
        backgroundColor: '#2563eb',
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: tickColor },
      },
      title: {
        display: true,
        text: title ?? t('charts.comparison.title'),
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
      <Bar data={chartData} options={options} />
    </div>
  );
}
