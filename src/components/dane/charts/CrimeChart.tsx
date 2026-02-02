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

export function CrimeBarChart({ data, title = 'Przestępstwa' }: CrimeBarChartProps) {
  const chartData = {
    labels: data.map((d) => d.year.toString()),
    datasets: [
      {
        label: 'Zgłoszone',
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
        text: title,
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

export function DetectionChart({ data, title = 'Wykrywalność (%)' }: DetectionChartProps) {
  const chartData = {
    labels: data.map((d) => d.year.toString()),
    datasets: [
      {
        label: 'Wykrywalność',
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
        text: title,
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

export function CrimeCategoriesChart({ data, title = 'Kategorie przestępstw' }: CrimeCategoriesChartProps) {
  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: 'Liczba',
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
        text: title,
      },
    },
  };

  return (
    <div className="h-[200px]">
      <Bar data={chartData} options={options} />
    </div>
  );
}
