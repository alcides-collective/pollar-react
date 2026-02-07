import useSWR from 'swr';
import { API_BASE } from '../config/api';

export interface CityWeather {
	temperature: number | null;
	weatherCode: number | null;
}

export interface WeatherResponse {
	data: {
		updatedAt: string | null;
		cities: Record<string, CityWeather>;
	};
}

async function fetchWeather(url: string): Promise<WeatherResponse['data'] | null> {
	const response = await fetch(url);

	if (!response.ok) {
		if (response.status === 503) return null;
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const json: WeatherResponse = await response.json();
	return json.data;
}

export function useWeather() {
	const url = `${API_BASE}/weather`;

	const { data, error, isLoading, mutate } = useSWR(url, fetchWeather, {
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
		dedupingInterval: 60_000,
		refreshInterval: 900_000, // 15 min auto-refresh
	});

	return {
		weather: data ?? null,
		loading: isLoading,
		error: error ?? null,
		refresh: mutate,
	};
}
