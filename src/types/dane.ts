/**
 * Types for dane.gov.pl data
 */

// ============ Air Quality ============

export interface AirQualityStation {
  id: number;
  stationName: string;
  gegrLat: string;
  gegrLon: string;
  city: {
    id: number;
    name: string;
    commune: {
      communeName: string;
      districtName: string;
      provinceName: string;
    };
  };
}

export interface AirQualityIndex {
  id: number;
  stCalcDate: string;
  stIndexLevel?: {
    id: number;
    indexLevelName: string;
  };
  stSourceDataDate: string;
  so2IndexLevel?: { id: number; indexLevelName: string };
  no2IndexLevel?: { id: number; indexLevelName: string };
  pm10IndexLevel?: { id: number; indexLevelName: string };
  pm25IndexLevel?: { id: number; indexLevelName: string };
  o3IndexLevel?: { id: number; indexLevelName: string };
}

export interface IndexInfo {
  color: string;
  label: string;
  level: number;
}

export interface AirQualityData {
  station: AirQualityStation;
  index: AirQualityIndex | null;
  indexInfo: IndexInfo;
}

export interface AirQualitySummary {
  province: string;
  stationCount: number;
  avgIndexLevel: number;
  avgIndexName?: string;
  indexInfo: IndexInfo;
}

// ============ Names ============

export interface NameEntry {
  name: string;
  count: number;
  rank: number;
  gender: 'M' | 'K';
  year: number;
  type: 'first' | 'second';
}

export interface SurnameEntry {
  name: string;
  totalCount: number;
  maleCount: number;
  femaleCount: number;
  rank: number;
}

export interface NamesDataset {
  id: string;
  title: string;
  description: string;
  format: string;
  modified: string;
  fileUrl: string;
}

// ============ Energy ============

export interface EnergyDataset {
  id: string;
  title: string;
  format: string;
  modified: string;
  fileUrl: string;
}

export interface EnergyMix {
  solidFuels: number;  // Węgiel
  gas: number;         // Gaz
  renewables: number;  // OZE
  liquidFuels: number; // Paliwa ciekłe
}

export interface EnergyBalance {
  production: number;
  import: number;
  export: number;
  consumption: number;
}

export interface EnergyMixTimeSeries {
  year: number;
  solidFuels: number;
  gas: number;
  renewables: number;
}

export interface EnergyProductionTimeSeries {
  year: number;
  value: number;
}

export interface ElectricityPrice {
  householdPrice: number;
  industrialPrice?: number;
  year?: number;
}

export interface EnergyComparison {
  poland: {
    co2PerCapita: number;
    renewablesShare: number;
    energyDependency?: number;
    co2Emissions?: number;
  };
  eu: {
    co2PerCapita?: number;
    renewablesShare: number;
    energyDependency?: number;
    co2Emissions?: number;
  };
}

export interface EnergySummary {
  currentYear: number;
  energyMix: EnergyMix | null;
  balance: EnergyBalance | null;
  timeSeries: {
    mix: EnergyMixTimeSeries[];
    production: EnergyProductionTimeSeries[];
    prices?: { year: number; price: number }[];
  };
  dataEdition?: string;
  electricityPrice?: ElectricityPrice;
  comparison?: EnergyComparison;
  source: string;
  datasetId: number;
  lastUpdate: string;
}

// ============ Housing ============

export interface HousingDataset {
  id: string;
  title: string;
  modified: string;
  institution: string;
  formats?: string[];
  resourceCount?: number;
  datasetUrl?: string;
}

export interface HousingSummary {
  avgPricePerSqm: number;
  totalListings: number;
  byCity: {
    city: string;
    avgPrice: number;
    count: number;
  }[];
  lastUpdate: string;
}

// ============ Crime ============

export interface CrimeDataset {
  id: string;
  title: string;
  format: string;
  modified: string;
  fileUrl: string;
}

export interface CrimeCategoryStat {
  reported: number;
  detected?: number;
  detectionRate?: number;
}

export interface CrimeRegionStat {
  region: string;
  reported: number;
  detected?: number;
  detectionRate?: number;
}

export interface CrimeTimeSeriesPoint {
  year: number;
  reported: number;
  detected?: number;
  detectionRate?: number;
}

export interface CrimeSummary {
  yearRange: string;
  latestYear: number;
  totalCrimes: number;
  solvingRate: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  currentYear?: number;
  summary?: {
    detectionRate: number;
    totalCrimes: number;
    changePercent: number;
    trend?: 'increasing' | 'decreasing' | 'stable';
  };
  categories?: {
    murder?: CrimeCategoryStat;
    robbery?: CrimeCategoryStat;
    theft?: CrimeCategoryStat;
    assault?: CrimeCategoryStat;
    [key: string]: CrimeCategoryStat | undefined;
  };
  topRegions?: CrimeRegionStat[];
  timeSeries?: {
    criminal?: CrimeTimeSeriesPoint[];
    economic?: CrimeTimeSeriesPoint[];
    [key: string]: CrimeTimeSeriesPoint[] | undefined;
  };
}

// ============ Transport ============

export interface TransportCategory {
  id: string;
  name: string;
  datasets: {
    id: number;
    name: string;
    source: string;
  }[];
}

// ============ Eurostat ============

export interface EurostatIndicatorValue {
  value: number | null;
  unit: string;
  period: string;
}

export interface EurostatPolandData {
  country: string;
  countryName: string;
  data: {
    gdp: EurostatIndicatorValue | null;
    inflation: EurostatIndicatorValue | null;
    unemployment: EurostatIndicatorValue | null;
    population: EurostatIndicatorValue | null;
  };
  source: string;
  lastUpdate: string;
}

export interface EurostatCompareCountry {
  code: string;
  name: string;
  value: number | null;
  period: string | null;
}

export interface EurostatCompareData {
  indicator: string;
  indicatorName: string;
  unit: string;
  countries: EurostatCompareCountry[];
  source: string;
  lastUpdate: string;
}

export interface EurostatTimeSeriesPoint {
  period?: string;
  year?: number;
  value: number;
}

export interface EurostatTimeSeriesData {
  indicator: string;
  indicatorName: string;
  description?: string;
  country: string;
  countryName: string;
  unit: string;
  data: EurostatTimeSeriesPoint[];
  source: string;
  lastUpdate: string;
}

// ============ Navigation ============

export interface DaneCategory {
  id: string;
  name: string;
  icon: string;
  path: string;
  subpages: {
    id: string;
    name: string;
    path: string;
  }[];
}

export const DANE_CATEGORIES: DaneCategory[] = [
  {
    id: 'srodowisko',
    name: 'Środowisko',
    icon: 'ri-earth-line',
    path: '/dane/srodowisko',
    subpages: [
      { id: 'powietrze', name: 'Jakość powietrza', path: '/dane/srodowisko/powietrze' },
    ],
  },
  {
    id: 'spoleczenstwo',
    name: 'Społeczeństwo',
    icon: 'ri-group-line',
    path: '/dane/spoleczenstwo',
    subpages: [
      { id: 'imiona', name: 'Imiona', path: '/dane/spoleczenstwo/imiona' },
      { id: 'nazwiska', name: 'Nazwiska', path: '/dane/spoleczenstwo/nazwiska' },
    ],
  },
  {
    id: 'ekonomia',
    name: 'Ekonomia',
    icon: 'ri-bar-chart-box-line',
    path: '/dane/ekonomia',
    subpages: [
      { id: 'eurostat', name: 'Eurostat', path: '/dane/ekonomia/eurostat' },
      { id: 'energia', name: 'Energia', path: '/dane/ekonomia/energia' },
      { id: 'mieszkania', name: 'Ceny mieszkań', path: '/dane/ekonomia/mieszkania' },
    ],
  },
  {
    id: 'transport',
    name: 'Transport',
    icon: 'ri-train-line',
    path: '/dane/transport',
    subpages: [
      { id: 'kolej', name: 'Kolej', path: '/dane/transport/kolej' },
      { id: 'porty', name: 'Porty', path: '/dane/transport/porty' },
    ],
  },
  {
    id: 'bezpieczenstwo',
    name: 'Bezpieczeństwo',
    icon: 'ri-shield-line',
    path: '/dane/bezpieczenstwo',
    subpages: [
      { id: 'przestepczosc', name: 'Przestępczość', path: '/dane/bezpieczenstwo/przestepczosc' },
    ],
  },
];
