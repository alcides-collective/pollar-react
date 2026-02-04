import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DaneHeader, DaneSourceFooter, StatsGrid, LiveBadge } from '@/components/dane';
import { AirQualityMap } from '@/components/dane/maps/AirQualityMap';
import { useAirQuality, useAirQualitySummary } from '@/hooks/useAirQuality';
import { useDaneStore } from '@/stores/daneStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { AirQualityData } from '@/types/dane';

const PROVINCES = [
  'dolnośląskie', 'kujawsko-pomorskie', 'lubelskie', 'lubuskie',
  'łódzkie', 'małopolskie', 'mazowieckie', 'opolskie',
  'podkarpackie', 'podlaskie', 'pomorskie', 'śląskie',
  'świętokrzyskie', 'warmińsko-mazurskie', 'wielkopolskie', 'zachodniopomorskie',
];

export function PowietrzePage() {
  const { t } = useTranslation('dane');
  const { stations, worstStations, bestStations, nationalAverage, loading, error, refresh } = useAirQuality();
  const { summary } = useAirQualitySummary();
  const { selectedProvince, setSelectedProvince } = useDaneStore();
  const [selectedStation, setSelectedStation] = useState<AirQualityData | null>(null);

  // Calculate filtered stats
  const filteredStats = useMemo(() => {
    if (!selectedProvince) return null;
    const filtered = stations.filter(
      (s) => s.station.city.commune.provinceName === selectedProvince
    );
    const valid = filtered.filter((s) => s.indexInfo.level >= 0);
    if (valid.length === 0) return null;

    const avgLevel = valid.reduce((sum, s) => sum + s.indexInfo.level, 0) / valid.length;
    return {
      stationCount: filtered.length,
      avgLevel: Math.round(avgLevel * 10) / 10,
    };
  }, [stations, selectedProvince]);

  if (error) {
    return (
      <div>
        <DaneHeader title={t('airQuality.title')} subtitle={t('airQuality.shortSubtitle')} icon="ri-cloud-line" isLive />
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{t('airQuality.error')}: {error.message}</p>
            <Button variant="outline" onClick={() => refresh()} className="mt-4">
              {t('airQuality.tryAgain')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <DaneHeader
        title={t('airQuality.title')}
        subtitle={t('airQuality.subtitle')}
        icon="ri-cloud-line"
        isLive
      />

      {/* Key Stats */}
      <StatsGrid
        stats={[
          {
            label: t('airQuality.nationalAverage'),
            value: nationalAverage?.level.toFixed(1) ?? '-',
            color: '#3b82f6',
          },
          {
            label: t('airQuality.measurementStations'),
            value: stations.length,
          },
          {
            label: selectedProvince ? t('airQuality.stationsIn', { province: selectedProvince }) : t('airQuality.selectProvince'),
            value: filteredStats?.stationCount ?? '-',
          },
        ]}
        columns={3}
        loading={loading}
        className="mb-6"
      />

      {/* Province Filter */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{t('airQuality.filterByProvince')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedProvince === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedProvince(null)}
            >
              {t('airQuality.allPoland')}
            </Button>
            {PROVINCES.map((province) => (
              <Button
                key={province}
                variant={selectedProvince === province ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedProvince(province)}
              >
                {province}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">{t('airQuality.stationMap')}</CardTitle>
          <div className="flex items-center gap-2">
            <LiveBadge />
            <Button variant="ghost" size="sm" onClick={() => refresh()}>
              {t('airQuality.refresh')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <Skeleton className="h-[400px] w-full rounded-none" />
          ) : (
            <AirQualityMap
              stations={stations}
              selectedProvince={selectedProvince}
              onStationClick={setSelectedStation}
              className="h-[400px] rounded-b-lg"
            />
          )}
        </CardContent>
      </Card>

      {/* Selected Station Details */}
      {selectedStation && (
        <Card className="mb-6 border-primary">
          <CardHeader>
            <CardTitle className="text-lg">{selectedStation.station.stationName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('airQuality.location')}</p>
                <p className="font-medium">
                  {selectedStation.station.city.name}, {selectedStation.station.city.commune.provinceName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('airQuality.status')}</p>
                <span
                  className="inline-block px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: selectedStation.indexInfo.color + '20',
                    color: selectedStation.indexInfo.color,
                  }}
                >
                  {selectedStation.indexInfo.label}
                </span>
              </div>
              {selectedStation.index && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('airQuality.measurementDate')}</p>
                    <p className="font-medium">
                      {new Date(selectedStation.index.stCalcDate).toLocaleString('pl-PL')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('airQuality.coordinates')}</p>
                    <p className="font-mono text-sm">
                      {selectedStation.station.gegrLat}, {selectedStation.station.gegrLon}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rankings */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Worst Stations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-red-600">{t('airQuality.worstQuality')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : (
              <div className="divide-y">
                {worstStations.slice(0, 10).map((station, index) => (
                  <div
                    key={station.station.id}
                    className="flex justify-between items-center py-2 cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded"
                    onClick={() => setSelectedStation(station)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-muted-foreground w-5">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{station.station.city.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {station.station.stationName}
                        </p>
                      </div>
                    </div>
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: station.indexInfo.color + '20',
                        color: station.indexInfo.color,
                      }}
                    >
                      {station.indexInfo.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Best Stations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-green-600">{t('airQuality.bestQuality')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : (
              <div className="divide-y">
                {bestStations.slice(0, 10).map((station, index) => (
                  <div
                    key={station.station.id}
                    className="flex justify-between items-center py-2 cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded"
                    onClick={() => setSelectedStation(station)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-muted-foreground w-5">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{station.station.city.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {station.station.stationName}
                        </p>
                      </div>
                    </div>
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: station.indexInfo.color + '20',
                        color: station.indexInfo.color,
                      }}
                    >
                      {station.indexInfo.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Province Summary */}
      {summary.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">{t('airQuality.provinceSummary')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
              {summary.map((item) => (
                <div
                  key={item.province}
                  className="p-3 rounded-lg border cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setSelectedProvince(item.province)}
                >
                  <p className="font-medium text-sm">{item.province}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-muted-foreground">
                      {t('airQuality.stationsCount', { count: item.stationCount })}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: item.indexInfo.color + '20',
                        color: item.indexInfo.color,
                      }}
                    >
                      {item.indexInfo.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <DaneSourceFooter
        source={t('airQuality.source')}
        sourceUrl="https://powietrze.gios.gov.pl"
      />
    </div>
  );
}
