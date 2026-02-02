import { useEffect, useRef } from 'react';
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
  type TooltipItem,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
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
    // Cleanup on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const chartData = {
    labels: data.items.map((d) => d.label),
    datasets: [
      {
        label: data.unit,
        data: data.items.map((d) => d.value),
        borderColor: '#e23c0f',
        backgroundColor: 'rgba(226, 60, 15, 0.1)',
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#e23c0f',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
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
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            const value = context.parsed?.y ?? 0;
            return `${value} ${data.unit}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: '#e5e7eb',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
          callback: (value: number | string) => {
            return `${value} ${data.unit}`;
          },
        },
      },
    },
  };

  return (
    <div className="line-chart-box my-4">
      <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#e23c0f] mb-1">
        WYKRES
      </span>
      <div className="text-sm font-medium text-zinc-900 mb-3">{data.title}</div>
      <div className="h-[200px] bg-zinc-50 rounded-lg p-3">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
}
