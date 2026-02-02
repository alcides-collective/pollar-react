/**
 * API client for dane.gov.pl endpoints
 */

const API_BASE = (import.meta.env.VITE_API_BASE || 'https://pollar.up.railway.app/api') + '/dane';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const daneApi = {
  // Overview
  getOverview: () => fetchJson<any>('/'),

  // Air Quality
  airQuality: {
    getStations: () => fetchJson<any>('/powietrze/stations'),
    getStation: (id: number) => fetchJson<any>(`/powietrze/stations/${id}`),
    getAll: () => fetchJson<any>('/powietrze/all'),
    getSummary: () => fetchJson<any>('/powietrze/summary'),
  },

  // Names
  names: {
    getDatasets: () => fetchJson<any>('/imiona'),
    getRanking: (year?: number, gender?: 'M' | 'K', limit = 50) => {
      const params = new URLSearchParams();
      if (year) params.set('year', year.toString());
      if (gender) params.set('gender', gender);
      params.set('limit', limit.toString());
      return fetchJson<any>(`/imiona/ranking?${params}`);
    },
  },

  // Surnames
  surnames: {
    getDatasets: () => fetchJson<any>('/nazwiska'),
    getRanking: (gender?: 'M' | 'K', limit = 50) => {
      const params = new URLSearchParams();
      if (gender) params.set('gender', gender);
      params.set('limit', limit.toString());
      return fetchJson<any>(`/nazwiska/ranking?${params}`);
    },
  },

  // Energy
  energy: {
    getDatasets: () => fetchJson<any>('/energia'),
    getSummary: () => fetchJson<any>('/energia/summary'),
  },

  // Housing
  housing: {
    getDatasets: () => fetchJson<any>('/mieszkania'),
    getSummary: () => fetchJson<any>('/mieszkania/summary'),
  },

  // Crime
  crime: {
    getDatasets: () => fetchJson<any>('/przestepczosc'),
    getSummary: () => fetchJson<any>('/przestepczosc/summary'),
  },

  // Transport
  transport: {
    getOverview: () => fetchJson<any>('/transport'),
    getRailway: () => fetchJson<any>('/transport/kolej'),
    getPorts: () => fetchJson<any>('/transport/porty'),
  },

  // Eurostat
  eurostat: {
    getOverview: () => fetchJson<any>('/eurostat'),
    getPoland: () => fetchJson<any>('/eurostat/poland'),
    compare: (countries: string[], indicator: string) => {
      const params = new URLSearchParams();
      params.set('countries', countries.join(','));
      params.set('indicator', indicator);
      return fetchJson<any>(`/eurostat/compare?${params}`);
    },
    getGdp: (country = 'PL') => fetchJson<any>(`/eurostat/gdp?country=${country}`),
    getInflation: (country = 'PL') => fetchJson<any>(`/eurostat/inflation?country=${country}`),
    getUnemployment: (country = 'PL') => fetchJson<any>(`/eurostat/unemployment?country=${country}`),
    getPopulation: (country = 'PL') => fetchJson<any>(`/eurostat/population?country=${country}`),
    getSociety: () => fetchJson<any>('/eurostat/society'),
  },
};

export { API_BASE };
