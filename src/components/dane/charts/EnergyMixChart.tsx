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
import type { EnergyMixTimeSeries } from '@/types/dane';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface EnergyMixChartProps {
  data: EnergyMixTimeSeries[];
}

export function EnergyMixChart({ data }: EnergyMixChartProps) {
  const chartData = {
    labels: data.map((d) => d.year.toString()),
    datasets: [
      {
        label: 'Węgiel',
        data: data.map((d) => d.solidFuels),
        backgroundColor: '#374151',
        stack: 'stack0',
      },
      {
        label: 'Gaz',
        data: data.map((d) => d.gas),
        backgroundColor: '#3b82f6',
        stack: 'stack0',
      },
      {
        label: 'OZE',
        data: data.map((d) => d.renewables),
        backgroundColor: '#22c55e',
        stack: 'stack0',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Mix energetyczny (%)',
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        max: 100,
      },
    },
  };

  return (
    <div className="h-[280px]">
      <Bar data={chartData} options={options} />
    </div>
  );
}
