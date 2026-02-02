import { useAirQuality, useAirQualitySummary } from './useAirQuality';
import { useEnergy } from './useEnergy';
import { useHousingSummary } from './useHousing';
import { useCrime } from './useCrime';

/**
 * Hook aggregating data for the main /dane dashboard
 */
export function useDaneOverview() {
  const airQuality = useAirQuality();
  const airQualitySummary = useAirQualitySummary();
  const energy = useEnergy();
  const housing = useHousingSummary();
  const crime = useCrime();

  const loading = airQuality.loading || energy.loading || housing.loading || crime.loading;
  const error = airQuality.error || energy.error || housing.error || crime.error;

  return {
    airQuality: {
      nationalAverage: airQuality.nationalAverage,
      worstStations: airQuality.worstStations.slice(0, 5),
      bestStations: airQuality.bestStations.slice(0, 5),
      summary: airQualitySummary.summary,
      loading: airQuality.loading,
    },
    energy: {
      currentYear: energy.currentYear,
      energyMix: energy.energyMix,
      electricityPrice: energy.electricityPrice,
      comparison: energy.comparison,
      loading: energy.loading,
    },
    housing: {
      summary: housing.summary,
      loading: housing.loading,
    },
    crime: {
      summary: crime.summary,
      solvingRate: crime.solvingRate,
      totalCrimes: crime.totalCrimes,
      topRegions: crime.topRegions?.slice(0, 3) ?? [],
      loading: crime.loading,
    },
    loading,
    error,
  };
}
