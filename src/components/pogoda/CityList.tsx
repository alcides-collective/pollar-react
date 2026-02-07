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
		<div className="divide-y divide-divider-subtle">
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
							'hover:bg-surface',
							isSelected && 'bg-surface'
						)}
					>
						<span className="text-sm font-medium text-content-heading">{cityName}</span>
						<div className="flex items-center gap-2">
							<i className={`${wmo.icon} text-base`} title={wmo.label} />
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
