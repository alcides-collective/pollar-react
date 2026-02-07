export interface WmoInfo {
	icon: string;
	label: string;
}

/**
 * WMO Weather interpretation codes (WW)
 * https://open-meteo.com/en/docs#weathervariables
 */
const WMO_CODES: Record<number, WmoInfo> = {
	0: { icon: 'ri-sun-line', label: 'Bezchmurnie' },
	1: { icon: 'ri-sun-cloudy-line', label: 'Przeważnie bezchmurnie' },
	2: { icon: 'ri-sun-cloudy-line', label: 'Częściowe zachmurzenie' },
	3: { icon: 'ri-cloudy-2-line', label: 'Pochmurno' },
	45: { icon: 'ri-mist-line', label: 'Mgła' },
	48: { icon: 'ri-mist-line', label: 'Szadź' },
	51: { icon: 'ri-drizzle-line', label: 'Mżawka słaba' },
	53: { icon: 'ri-drizzle-line', label: 'Mżawka umiarkowana' },
	55: { icon: 'ri-drizzle-line', label: 'Mżawka gęsta' },
	56: { icon: 'ri-rainy-line', label: 'Marznąca mżawka słaba' },
	57: { icon: 'ri-rainy-line', label: 'Marznąca mżawka gęsta' },
	61: { icon: 'ri-rainy-line', label: 'Deszcz słaby' },
	63: { icon: 'ri-rainy-line', label: 'Deszcz umiarkowany' },
	65: { icon: 'ri-heavy-showers-line', label: 'Deszcz silny' },
	66: { icon: 'ri-rainy-line', label: 'Marznący deszcz słaby' },
	67: { icon: 'ri-heavy-showers-line', label: 'Marznący deszcz silny' },
	71: { icon: 'ri-snowy-line', label: 'Śnieg słaby' },
	73: { icon: 'ri-snowy-line', label: 'Śnieg umiarkowany' },
	75: { icon: 'ri-snowy-line', label: 'Śnieg silny' },
	77: { icon: 'ri-snowy-line', label: 'Ziarna śniegu' },
	80: { icon: 'ri-showers-line', label: 'Przelotny deszcz słaby' },
	81: { icon: 'ri-showers-line', label: 'Przelotny deszcz umiarkowany' },
	82: { icon: 'ri-heavy-showers-line', label: 'Przelotny deszcz silny' },
	85: { icon: 'ri-snowy-line', label: 'Przelotny śnieg słaby' },
	86: { icon: 'ri-snowy-line', label: 'Przelotny śnieg silny' },
	95: { icon: 'ri-thunderstorms-line', label: 'Burza' },
	96: { icon: 'ri-thunderstorms-line', label: 'Burza z gradem słabym' },
	99: { icon: 'ri-thunderstorms-line', label: 'Burza z gradem silnym' },
};

const UNKNOWN_WMO: WmoInfo = { icon: 'ri-question-line', label: 'Brak danych' };

export function getWmoInfo(code: number | null): WmoInfo {
	if (code === null) return UNKNOWN_WMO;
	return WMO_CODES[code] ?? UNKNOWN_WMO;
}

export function getTemperatureColor(temp: number | null): string {
	if (temp === null) return '#a1a1aa'; // zinc-400
	if (temp < 0) return '#3b82f6';     // blue-500
	if (temp < 10) return '#06b6d4';    // cyan-500
	if (temp < 20) return '#22c55e';    // green-500
	if (temp < 30) return '#f97316';    // orange-500
	return '#ef4444';                   // red-500
}

export function formatTemperature(temp: number | null): string {
	if (temp === null) return '—';
	return `${Math.round(temp)}°C`;
}

/** Coordinates for 16 voivodeship cities (matching backend) */
export const CITY_COORDINATES: Record<string, { lat: number; lon: number }> = {
	'Warszawa': { lat: 52.23, lon: 21.01 },
	'Kraków': { lat: 50.06, lon: 19.94 },
	'Wrocław': { lat: 51.11, lon: 17.04 },
	'Poznań': { lat: 52.41, lon: 16.93 },
	'Gdańsk': { lat: 54.35, lon: 18.65 },
	'Łódź': { lat: 51.76, lon: 19.46 },
	'Katowice': { lat: 50.26, lon: 19.02 },
	'Szczecin': { lat: 53.43, lon: 14.53 },
	'Lublin': { lat: 51.25, lon: 22.57 },
	'Bydgoszcz': { lat: 53.12, lon: 18.01 },
	'Białystok': { lat: 53.13, lon: 23.16 },
	'Kielce': { lat: 50.87, lon: 20.63 },
	'Olsztyn': { lat: 53.78, lon: 20.49 },
	'Rzeszów': { lat: 50.04, lon: 22.00 },
	'Opole': { lat: 50.67, lon: 17.93 },
	'Gorzów Wielkopolski': { lat: 52.73, lon: 15.23 },
};
