export interface WmoInfo {
	icon: string;
	label: string;
}

/**
 * WMO Weather interpretation codes (WW)
 * https://open-meteo.com/en/docs#weathervariables
 */
const WMO_CODES: Record<number, WmoInfo> = {
	0: { icon: '☀️', label: 'Bezchmurnie' },
	1: { icon: '🌤️', label: 'Przeważnie bezchmurnie' },
	2: { icon: '⛅', label: 'Częściowe zachmurzenie' },
	3: { icon: '☁️', label: 'Pochmurno' },
	45: { icon: '🌫️', label: 'Mgła' },
	48: { icon: '🌫️', label: 'Szadź' },
	51: { icon: '🌦️', label: 'Mżawka słaba' },
	53: { icon: '🌦️', label: 'Mżawka umiarkowana' },
	55: { icon: '🌦️', label: 'Mżawka gęsta' },
	56: { icon: '🌧️', label: 'Marznąca mżawka słaba' },
	57: { icon: '🌧️', label: 'Marznąca mżawka gęsta' },
	61: { icon: '🌧️', label: 'Deszcz słaby' },
	63: { icon: '🌧️', label: 'Deszcz umiarkowany' },
	65: { icon: '🌧️', label: 'Deszcz silny' },
	66: { icon: '🌧️', label: 'Marznący deszcz słaby' },
	67: { icon: '🌧️', label: 'Marznący deszcz silny' },
	71: { icon: '🌨️', label: 'Śnieg słaby' },
	73: { icon: '🌨️', label: 'Śnieg umiarkowany' },
	75: { icon: '🌨️', label: 'Śnieg silny' },
	77: { icon: '🌨️', label: 'Ziarna śniegu' },
	80: { icon: '🌦️', label: 'Przelotny deszcz słaby' },
	81: { icon: '🌦️', label: 'Przelotny deszcz umiarkowany' },
	82: { icon: '🌦️', label: 'Przelotny deszcz silny' },
	85: { icon: '🌨️', label: 'Przelotny śnieg słaby' },
	86: { icon: '🌨️', label: 'Przelotny śnieg silny' },
	95: { icon: '⛈️', label: 'Burza' },
	96: { icon: '⛈️', label: 'Burza z gradem słabym' },
	99: { icon: '⛈️', label: 'Burza z gradem silnym' },
};

const UNKNOWN_WMO: WmoInfo = { icon: '❓', label: 'Brak danych' };

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
