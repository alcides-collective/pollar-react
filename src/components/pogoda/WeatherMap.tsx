import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { CityWeather } from '@/hooks/useWeather';
import { getWmoInfo, getTemperatureColor, formatTemperature, CITY_COORDINATES } from '@/lib/weather';

mapboxgl.accessToken = 'pk.eyJ1IjoiamFrdWJkdWRlayIsImEiOiJjbWRyMWx1Z3EwOTR6MmtzYjJvYzJncmZhIn0.5Fn6PxkRaqVkEwJLhP-8_Q';

export interface WeatherMapHandle {
	focusCity: (cityName: string) => void;
}

interface WeatherMapProps {
	cities: Record<string, CityWeather>;
}

export const WeatherMap = forwardRef<WeatherMapHandle, WeatherMapProps>(
	function WeatherMap({ cities }, ref) {
		const mapContainer = useRef<HTMLDivElement>(null);
		const map = useRef<mapboxgl.Map | null>(null);
		const markersRef = useRef<mapboxgl.Marker[]>([]);
		const popupRef = useRef<mapboxgl.Popup | null>(null);

		const openPopup = useCallback((cityName: string, coords: { lat: number; lon: number }, weather: CityWeather) => {
			if (!map.current) return;

			popupRef.current?.remove();

			const wmo = getWmoInfo(weather.weatherCode);
			const tempColor = getTemperatureColor(weather.temperature);

			const popup = new mapboxgl.Popup({ offset: 20, closeButton: true, maxWidth: '220px' })
				.setLngLat([coords.lon, coords.lat])
				.setHTML(`
					<div style="font-family: inherit; padding: 4px 0;">
						<div style="font-weight: 600; font-size: 14px; margin-bottom: 6px;">${cityName}</div>
						<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
							<span style="font-size: 24px;">${wmo.icon}</span>
							<span style="font-size: 22px; font-weight: 700; color: ${tempColor};">
								${formatTemperature(weather.temperature)}
							</span>
						</div>
						<div style="font-size: 12px; color: #71717a;">${wmo.label}</div>
					</div>
				`)
				.addTo(map.current);

			popupRef.current = popup;
		}, []);

		const focusCity = useCallback((cityName: string) => {
			const coords = CITY_COORDINATES[cityName];
			const weather = cities[cityName];
			if (!map.current || !coords || !weather) return;

			map.current.flyTo({
				center: [coords.lon, coords.lat],
				zoom: 8,
				duration: 800,
			});

			setTimeout(() => {
				openPopup(cityName, coords, weather);
			}, 400);
		}, [cities, openPopup]);

		useImperativeHandle(ref, () => ({ focusCity }), [focusCity]);

		// Initialize map
		useEffect(() => {
			if (map.current || !mapContainer.current) return;

			map.current = new mapboxgl.Map({
				container: mapContainer.current,
				style: 'mapbox://styles/mapbox/light-v11',
				center: [19.4, 52.0],
				zoom: 5.5,
				minZoom: 4,
				maxZoom: 12,
				attributionControl: false,
				interactive: true,
			});

			map.current.addControl(
				new mapboxgl.NavigationControl({ showCompass: false }),
				'top-right'
			);

			return () => {
				popupRef.current?.remove();
				markersRef.current.forEach((m) => m.remove());
				markersRef.current = [];
				map.current?.remove();
				map.current = null;
			};
		}, []);

		// Render markers when cities data changes
		useEffect(() => {
			if (!map.current) return;

			// Remove old markers
			markersRef.current.forEach((m) => m.remove());
			markersRef.current = [];

			Object.entries(cities).forEach(([cityName, weather]) => {
				const coords = CITY_COORDINATES[cityName];
				if (!coords) return;

				const wmo = getWmoInfo(weather.weatherCode);
				const color = getTemperatureColor(weather.temperature);
				const temp = formatTemperature(weather.temperature);

				// Custom marker DOM — outer wrapper for Mapbox positioning, inner for hover effect
				const el = document.createElement('div');
				const inner = document.createElement('div');
				inner.style.cssText = `
					display: flex;
					align-items: center;
					gap: 3px;
					background: white;
					border: 2px solid ${color};
					border-radius: 20px;
					padding: 2px 8px 2px 4px;
					font-size: 12px;
					font-weight: 600;
					color: ${color};
					cursor: pointer;
					box-shadow: 0 2px 6px rgba(0,0,0,0.15);
					white-space: nowrap;
					transition: transform 0.15s ease;
				`;
				inner.innerHTML = `<span style="font-size: 14px;">${wmo.icon}</span><span>${temp}</span>`;
				inner.addEventListener('mouseenter', () => { inner.style.transform = 'scale(1.1)'; });
				inner.addEventListener('mouseleave', () => { inner.style.transform = 'scale(1)'; });
				el.appendChild(inner);

				el.addEventListener('click', (e) => {
					e.stopPropagation();
					openPopup(cityName, coords, weather);
				});

				const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
					.setLngLat([coords.lon, coords.lat])
					.addTo(map.current!);

				markersRef.current.push(marker);
			});
		}, [cities, openPopup]);

		return (
			<div ref={mapContainer} className="w-full h-full min-h-[400px] rounded-lg" />
		);
	}
);
