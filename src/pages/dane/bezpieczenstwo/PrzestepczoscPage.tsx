import { DaneHeader, DaneSourceFooter, StatsGrid } from '@/components/dane';
import { CrimeBarChart, DetectionChart, CrimeCategoriesChart } from '@/components/dane/charts';
import { useCrime } from '@/hooks/useCrime';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  murder: { label: 'Zabójstwa', color: '#dc2626', icon: 'ri-skull-line' },
  robbery: { label: 'Rozboje', color: '#ea580c', icon: 'ri-hand-coin-line' },
  theft: { label: 'Kradzieże', color: '#ca8a04', icon: 'ri-home-office-line' },
  assault: { label: 'Pobicia', color: '#16a34a', icon: 'ri-body-scan-line' },
};

export function PrzestepczoscPage() {
  const {
    yearRange,
    totalCrimes,
    solvingRate,
    trend,
    categories,
    topRegions,
    timeSeries,
    loading,
    error,
  } = useCrime();

  if (error) {
    return (
      <div>
        <DaneHeader title="Przestępczość" subtitle="Statystyki policyjne" icon="ri-shield-line" />
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Błąd: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const trendText = trend === 'increasing' ? 'Wzrost' : trend === 'decreasing' ? 'Spadek' : 'Stabilnie';

  return (
    <div>
      <DaneHeader
        title="Przestępczość"
        subtitle={`Statystyki policyjne ${yearRange ?? ''}`}
        icon="ri-shield-line"
      />

      {/* Key Stats */}
      <StatsGrid
        stats={[
          {
            label: 'Wykrywalność',
            value: `${solvingRate.toFixed(1)}%`,
            color: solvingRate > 50 ? '#22c55e' : '#ef4444',
          },
          {
            label: 'Przestępstwa',
            value: totalCrimes.toLocaleString(),
          },
          {
            label: 'Trend',
            value: trendText,
            color: trend === 'increasing' ? '#ef4444' : trend === 'decreasing' ? '#22c55e' : undefined,
          },
        ]}
        columns={3}
        loading={loading}
        className="mb-6"
      />

      {/* Categories */}
      {categories && Object.keys(categories).length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <i className="ri-folder-line text-primary" />
              Kategorie przestępstw
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-48" />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(categories).map(([key, stat]) => {
                  if (!stat) return null;
                  const config = CATEGORY_CONFIG[key] ?? {
                    label: key,
                    color: '#6b7280',
                    icon: 'ri-question-line',
                  };

                  return (
                    <div
                      key={key}
                      className="p-4 rounded-lg border-l-4"
                      style={{ borderLeftColor: config.color }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <i className={`${config.icon} text-lg`} style={{ color: config.color }} />
                        <h4 className="font-medium">{config.label}</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Zgłoszone</span>
                          <span className="font-semibold">{stat.reported?.toLocaleString() ?? '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Wykryte</span>
                          <span className="font-semibold">{stat.detected?.toLocaleString() ?? '-'}</span>
                        </div>
                        {stat.detectionRate !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Wykrywalność</span>
                            <span className="font-semibold" style={{ color: config.color }}>
                              {stat.detectionRate.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Top Regions */}
      {topRegions && topRegions.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <i className="ri-map-pin-line text-primary" />
              Według województw
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-48" />
            ) : (
              <div className="divide-y">
                {topRegions.map((region, index) => (
                  <div key={region.region} className="flex justify-between items-center py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground w-6">
                        {index + 1}
                      </span>
                      <span className="font-medium">{region.region}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{region.reported.toLocaleString()}</p>
                      {region.detectionRate !== undefined && (
                        <p className="text-sm text-muted-foreground">
                          Wykrywalność: {region.detectionRate.toFixed(1)}%
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Charts Grid */}
      {timeSeries?.criminal && timeSeries.criminal.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <i className="ri-bar-chart-line text-primary" />
                Przestępstwa zgłoszone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CrimeBarChart data={timeSeries.criminal.slice(-10)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <i className="ri-line-chart-line text-primary" />
                Wykrywalność (%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DetectionChart data={timeSeries.criminal.slice(-10)} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Categories Bar Chart */}
      {categories && Object.keys(categories).length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <i className="ri-bar-chart-horizontal-line text-primary" />
              Porównanie kategorii
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CrimeCategoriesChart
              data={Object.entries(categories)
                .filter(([, stat]) => stat?.reported)
                .map(([key, stat]) => ({
                  label: CATEGORY_CONFIG[key]?.label ?? key,
                  value: stat!.reported!,
                  color: CATEGORY_CONFIG[key]?.color ?? '#6b7280',
                }))}
            />
          </CardContent>
        </Card>
      )}

      <DaneSourceFooter
        source="Policja / dane.gov.pl"
        sourceUrl="https://dane.gov.pl/pl/dataset/3290"
      />
    </div>
  );
}
