import { cn } from '@/lib/utils';
import type { CityWeather } from '@/hooks/useWeather';
import { getWmoInfo, getTemperatureColor, formatTemperature } from '@/lib/weather';

interface CityListProps {
	cities: Record<string, CityWeather>;
	onCityClick?: (cityName: string) => void;
	selectedCity?: string | null;
}

export function CityList({ cities, onCityClick, selectedCity }: CityListProps) {
	const sortedCities = Object.entries(cities).sort(([a], [b]) => a.localeCompare(b, 'pl'));

	return (
		<div className="divide-y divide-zinc-100">
			{sortedCities.map(([cityName, weather]) => {
				const wmo = getWmoInfo(weather.weatherCode);
				const tempColor = getTemperatureColor(weather.temperature);
				const isSelected = selectedCity === cityName;

				return (
					<button
						key={cityName}
						onClick={() => onCityClick?.(cityName)}
						className={cn(
							'w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors',
							'hover:bg-zinc-50',
							isSelected && 'bg-zinc-100'
						)}
					>
						<span className="text-sm font-medium text-zinc-900">{cityName}</span>
						<div className="flex items-center gap-2">
							<span className="text-base" title={wmo.label}>{wmo.icon}</span>
							<span
								className="text-sm font-semibold tabular-nums min-w-[48px] text-right"
								style={{ color: tempColor }}
							>
								{formatTemperature(weather.temperature)}
							</span>
						</div>
					</button>
				);
			})}
		</div>
	);
}
