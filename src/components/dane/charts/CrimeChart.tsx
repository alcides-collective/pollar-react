import { useTranslation } from 'react-i18next';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import type { CrimeTimeSeriesPoint } from '@/types/dane';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CrimeBarChartProps {
  data: CrimeTimeSeriesPoint[];
  title?: string;
}

export function CrimeBarChart({ data, title }: CrimeBarChartProps) {
  const { t } = useTranslation('dane');

  const chartData = {
    labels: data.map((d) => d.year.toString()),
    datasets: [
      {
        label: t('charts.crime.reported'),
        data: data.map((d) => d.reported),
        backgroundColor: '#ef4444',
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
        text: title ?? t('charts.crime.crimesTitle'),
      },
    },
  };

  return (
    <div className="h-[280px]">
      <Bar data={chartData} options={options} />
    </div>
  );
}

interface DetectionChartProps {
  data: CrimeTimeSeriesPoint[];
  title?: string;
}

export function DetectionChart({ data, title }: DetectionChartProps) {
  const { t } = useTranslation('dane');

  const chartData = {
    labels: data.map((d) => d.year.toString()),
    datasets: [
      {
        label: t('charts.crime.detection'),
        data: data.map((d) => d.detectionRate ?? 0),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
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
        text: title ?? t('charts.crime.detectionTitle'),
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <div className="h-[280px]">
      <Line data={chartData} options={options} />
    </div>
  );
}

interface CategoryData {
  label: string;
  value: number;
  color: string;
}

interface CrimeCategoriesChartProps {
  data: CategoryData[];
  title?: string;
}

export function CrimeCategoriesChart({ data, title }: CrimeCategoriesChartProps) {
  const { t } = useTranslation('dane');

  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: t('charts.crime.count'),
        data: data.map((d) => d.value),
        backgroundColor: data.map((d) => d.color),
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title ?? t('charts.crime.categoriesTitle'),
      },
    },
  };

  return (
    <div className="h-[200px]">
      <Bar data={chartData} options={options} />
    </div>
  );
}
