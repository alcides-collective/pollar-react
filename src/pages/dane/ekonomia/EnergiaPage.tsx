import { useTranslation } from 'react-i18next';
import { DaneHeader, DaneSourceFooter, StatsGrid } from '@/components/dane';
import { EnergyMixChart, ProductionChart, ComparisonChart } from '@/components/dane/charts';
import { useEnergy } from '@/hooks/useEnergy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function EnergiaPage() {
  const { t } = useTranslation('dane');
  const { summary, energyMix, balance, comparison, electricityPrice, timeSeries, loading, error } = useEnergy();

  if (error) {
    return (
      <div>
        <DaneHeader title={t('energia.title')} subtitle={t('energia.subtitle')} icon="ri-flashlight-line" />
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{t('common.error')}: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <DaneHeader
        title={t('energia.title')}
        subtitle={t('energia.subtitle')}
        icon="ri-flashlight-line"
        lastUpdate={summary?.lastUpdate}
      />

      {/* Energy Mix */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
              <i className="ri-donut-chart-line text-primary" />
              {t('energia.energyMix')}
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
                  title={`${t('energia.coal')}: ${energyMix.solidFuels.toFixed(1)}%`}
                />
                <div
                  className="bg-blue-500 transition-all"
                  style={{ width: `${energyMix.gas}%` }}
                  title={`${t('energia.gas')}: ${energyMix.gas.toFixed(1)}%`}
                />
                <div
                  className="bg-green-500 transition-all"
                  style={{ width: `${energyMix.renewables}%` }}
                  title={`${t('energia.renewables')}: ${energyMix.renewables.toFixed(1)}%`}
                />
                <div
                  className="bg-amber-500 transition-all"
                  style={{ width: `${energyMix.liquidFuels}%` }}
                  title={`${t('energia.liquidFuels')}: ${energyMix.liquidFuels.toFixed(1)}%`}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gray-600" />
                  <span>{t('energia.coal')}: {energyMix.solidFuels.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>{t('energia.gas')}: {energyMix.gas.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  <span>{t('energia.renewables')}: {energyMix.renewables.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>{t('energia.fuels')}: {energyMix.liquidFuels.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">{t('common.noData')}</p>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <StatsGrid
        stats={[
          {
            label: t('energia.production'),
            value: balance?.production ? `${(balance.production / 1000).toFixed(1)}` : '-',
            unit: 'TWh',
          },
          {
            label: t('energia.import'),
            value: balance?.import ? `${(balance.import / 1000).toFixed(1)}` : '-',
            unit: 'TWh',
          },
          {
            label: t('energia.export'),
            value: balance?.export ? `${(balance.export / 1000).toFixed(1)}` : '-',
            unit: 'TWh',
          },
          {
            label: t('energia.householdPrice'),
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
              {t('energia.polandVsEU')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ComparisonChart
              data={[
                {
                  label: t('energia.renewablesShare'),
                  poland: comparison.poland.renewablesShare,
                  eu: comparison.eu.renewablesShare,
                  unit: '%',
                },
                {
                  label: t('energia.co2PerCapita'),
                  poland: comparison.poland.co2PerCapita,
                  eu: comparison.eu.co2PerCapita ?? 0,
                  unit: 't',
                },
                ...(comparison.poland.energyDependency !== undefined
                  ? [
                      {
                        label: t('energia.energyDependency'),
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
                {t('energia.mixEvolution')}
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
                {t('energia.energyProduction')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProductionChart
                data={timeSeries.production.slice(-10)}
                title={t('energia.energyProductionGWh')}
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
