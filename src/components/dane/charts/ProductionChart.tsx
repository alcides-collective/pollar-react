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
import type { EnergyProductionTimeSeries } from '@/types/dane';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ProductionChartProps {
  data: EnergyProductionTimeSeries[];
  title?: string;
  color?: string;
  unit?: string;
}

export function ProductionChart({
  data,
  title,
  color = '#3b82f6',
  unit = 'GWh'
}: ProductionChartProps) {
  const { t } = useTranslation('dane');

  const chartData = {
    labels: data.map((d) => d.year.toString()),
    datasets: [
      {
        label: unit,
        data: data.map((d) => d.value),
        backgroundColor: color,
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
        text: title ?? t('charts.energy.productionTitle'),
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="h-[280px]">
      <Bar data={chartData} options={options} />
    </div>
  );
}
