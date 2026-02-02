import { DaneHeader, DaneSourceFooter, StatsGrid } from '@/components/dane';
import { EnergyMixChart, ProductionChart, ComparisonChart } from '@/components/dane/charts';
import { useEnergy } from '@/hooks/useEnergy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function EnergiaPage() {
  const { summary, energyMix, balance, comparison, electricityPrice, timeSeries, loading, error } = useEnergy();

  if (error) {
    return (
      <div>
        <DaneHeader title="Energia" subtitle="Dane o energetyce w Polsce" icon="ri-flashlight-line" />
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Błąd: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <DaneHeader
        title="Energia"
        subtitle="Dane o energetyce w Polsce"
        icon="ri-flashlight-line"
        lastUpdate={summary?.lastUpdate}
      />

      {/* Energy Mix */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
              <i className="ri-donut-chart-line text-primary" />
              Mix energetyczny
            </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : energyMix ? (
            <div className="space-y-4">
              <div className="flex h-8 rounded-full overflow-hidden">
                <div
                  className="bg-gray-600 transition-all"
                  style={{ width: `${energyMix.solidFuels}%` }}
                  title={`Węgiel: ${energyMix.solidFuels.toFixed(1)}%`}
                />
                <div
                  className="bg-blue-500 transition-all"
                  style={{ width: `${energyMix.gas}%` }}
                  title={`Gaz: ${energyMix.gas.toFixed(1)}%`}
                />
                <div
                  className="bg-green-500 transition-all"
                  style={{ width: `${energyMix.renewables}%` }}
                  title={`OZE: ${energyMix.renewables.toFixed(1)}%`}
                />
                <div
                  className="bg-amber-500 transition-all"
                  style={{ width: `${energyMix.liquidFuels}%` }}
                  title={`Paliwa płynne: ${energyMix.liquidFuels.toFixed(1)}%`}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gray-600" />
                  <span>Węgiel: {energyMix.solidFuels.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Gaz: {energyMix.gas.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  <span>OZE: {energyMix.renewables.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>Paliwa: {energyMix.liquidFuels.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Brak danych</p>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <StatsGrid
        stats={[
          {
            label: 'Produkcja',
            value: balance?.production ? `${(balance.production / 1000).toFixed(1)}` : '-',
            unit: 'TWh',
          },
          {
            label: 'Import',
            value: balance?.import ? `${(balance.import / 1000).toFixed(1)}` : '-',
            unit: 'TWh',
          },
          {
            label: 'Eksport',
            value: balance?.export ? `${(balance.export / 1000).toFixed(1)}` : '-',
            unit: 'TWh',
          },
          {
            label: 'Cena (gosp. dom.)',
            value: electricityPrice?.householdPrice ?? '-',
            unit: 'zł/MWh',
          },
        ]}
        columns={4}
        loading={loading}
        className="mb-6"
      />

      {/* Comparison with EU - Chart */}
      {comparison && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <i className="ri-bar-chart-horizontal-line text-primary" />
              Polska vs Unia Europejska
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ComparisonChart
              data={[
                {
                  label: 'Udział OZE',
                  poland: comparison.poland.renewablesShare,
                  eu: comparison.eu.renewablesShare,
                  unit: '%',
                },
                {
                  label: 'CO₂ na mieszkańca',
                  poland: comparison.poland.co2PerCapita,
                  eu: comparison.eu.co2PerCapita ?? 0,
                  unit: 't',
                },
                ...(comparison.poland.energyDependency !== undefined
                  ? [
                      {
                        label: 'Zależność energetyczna',
                        poland: comparison.poland.energyDependency,
                        eu: comparison.eu.energyDependency ?? 0,
                        unit: '%',
                      },
                    ]
                  : []),
              ]}
            />
          </CardContent>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Energy Mix Chart */}
        {timeSeries?.mix && timeSeries.mix.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <i className="ri-pie-chart-line text-primary" />
                Ewolucja miksu energetycznego
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnergyMixChart data={timeSeries.mix.slice(-10)} />
            </CardContent>
          </Card>
        )}

        {/* Production Chart */}
        {timeSeries?.production && timeSeries.production.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <i className="ri-line-chart-line text-primary" />
                Produkcja energii
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProductionChart
                data={timeSeries.production.slice(-10)}
                title="Produkcja energii (GWh)"
                color="#3b82f6"
              />
            </CardContent>
          </Card>
        )}
      </div>

      <DaneSourceFooter
        source="dane.gov.pl"
        sourceUrl="https://dane.gov.pl/pl/dataset/1199"
      />
    </div>
  );
}
