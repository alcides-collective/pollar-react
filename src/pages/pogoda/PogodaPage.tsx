import { useRef, useState, useMemo } from 'react';
import { useWeather } from '@/hooks/useWeather';
import { DaneHeader } from '@/components/dane/DaneHeader';
import { StatsGrid } from '@/components/dane/StatsGrid';
import { DaneSourceFooter } from '@/components/dane/DaneSourceFooter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { WeatherMap, type WeatherMapHandle } from '@/components/pogoda/WeatherMap';
import { CityList } from '@/components/pogoda/CityList';
import { getTemperatureColor } from '@/lib/weather';

export function PogodaPage() {
	const { weather, loading } = useWeather();
	const mapRef = useRef<WeatherMapHandle>(null);
	const [selectedCity, setSelectedCity] = useState<string | null>(null);

	const stats = useMemo(() => {
		if (!weather) return [];

		const temps = Object.values(weather.cities)
			.map((c) => c.temperature)
			.filter((t): t is number => t !== null);

		if (temps.length === 0) return [];

		const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
		const max = Math.max(...temps);
		const min = Math.min(...temps);

		const warmestCity = Object.entries(weather.cities).find(
			([, c]) => c.temperature === max
		)?.[0];
		const coldestCity = Object.entries(weather.cities).find(
			([, c]) => c.temperature === min
		)?.[0];

		const updatedAt = weather.updatedAt
			? new Date(weather.updatedAt).toLocaleTimeString('pl-PL', {
					hour: '2-digit',
					minute: '2-digit',
				})
			: '—';

		return [
			{
				label: 'Średnia temperatura',
				value: `${avg.toFixed(1)}°C`,
				color: getTemperatureColor(avg),
			},
			{
				label: `Najcieplej — ${warmestCity ?? ''}`,
				value: `${max.toFixed(1)}°C`,
				color: getTemperatureColor(max),
			},
			{
				label: `Najzimniej — ${coldestCity ?? ''}`,
				value: `${min.toFixed(1)}°C`,
				color: getTemperatureColor(min),
			},
			{
				label: 'Aktualizacja',
				value: updatedAt,
			},
		];
	}, [weather]);

	const handleCityClick = (cityName: string) => {
		setSelectedCity(cityName);
		mapRef.current?.focusCity(cityName);
	};

	return (
		<div className="container mx-auto px-4 py-8 max-w-[1400px]">
			<DaneHeader
				title="Pogoda w Polsce"
				subtitle="Aktualne warunki pogodowe w miastach wojewódzkich"
				icon="ri-cloud-line"
				isLive
			/>

			<StatsGrid
				stats={stats}
				columns={4}
				loading={loading}
				className="mb-6"
				cardClassName="border-zinc-200 py-3 gap-0"
			contentClassName="pt-0"
			/>

			{loading ? (
				<Card className="border-zinc-200 py-0 gap-0">
					<CardContent className="p-0">
						<div className="grid lg:grid-cols-[1fr_320px]">
							<Skeleton className="h-[500px] rounded-l-lg rounded-r-none" />
							<div className="p-4 space-y-3">
								{Array.from({ length: 16 }).map((_, i) => (
									<Skeleton key={i} className="h-8 w-full" />
								))}
							</div>
						</div>
					</CardContent>
				</Card>
			) : weather ? (
				<Card className="overflow-hidden mb-6 border-zinc-200 py-0 gap-0">
					<CardHeader className="px-4 py-3">
						<CardTitle className="text-sm font-medium">
							Mapa i lista miast
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0">
						<div className="grid lg:grid-cols-[1fr_320px] min-h-[500px]">
							{/* Map */}
							<div className="p-2 pt-0">
								<WeatherMap
									ref={mapRef}
									cities={weather.cities}
								/>
							</div>

							{/* City list */}
							<div className="border-t lg:border-t-0 lg:border-l border-zinc-200">
								<CityList
									cities={weather.cities}
									onCityClick={handleCityClick}
									selectedCity={selectedCity}
								/>
							</div>
						</div>
					</CardContent>
				</Card>
			) : (
				<Card className="mb-6 border-zinc-200 py-4 gap-0">
					<CardContent className="py-12 text-center text-muted-foreground">
						Dane pogodowe są tymczasowo niedostępne.
					</CardContent>
				</Card>
			)}

			<DaneSourceFooter
				source="Open-Meteo"
				sourceUrl="https://open-meteo.com"
			/>
		</div>
	);
}
