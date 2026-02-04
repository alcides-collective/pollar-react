import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DaneHeader, DaneSourceFooter, StatsGrid } from '@/components/dane';
import { EurostatLineChart } from '@/components/dane/charts';
import { useEurostatPoland, useEurostatCompare, useEurostatSociety, useEurostatTimeSeries } from '@/hooks/useEurostat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const COMPARE_COUNTRIES = ['PL', 'DE', 'CZ', 'SK', 'HU', 'AT'];

export function EurostatPage() {
  const { t } = useTranslation('dane');
  const [selectedIndicator, setSelectedIndicator] = useState('gdp');

  const COUNTRY_NAMES: Record<string, string> = {
    PL: t('eurostat.countries.PL'),
    DE: t('eurostat.countries.DE'),
    CZ: t('eurostat.countries.CZ'),
    SK: t('eurostat.countries.SK'),
    HU: t('eurostat.countries.HU'),
    AT: t('eurostat.countries.AT'),
  };

  const INDICATORS = [
    { id: 'gdp', name: t('eurostat.gdp'), unit: 'mln EUR' },
    { id: 'inflation', name: t('eurostat.inflation'), unit: '%' },
    { id: 'unemployment', name: t('eurostat.unemployment'), unit: '%' },
    { id: 'population', name: t('eurostat.population'), unit: 'mln' },
  ];

  const { data: polandData, loading: polandLoading, error: polandError } = useEurostatPoland();
  const { countries: compareData, loading: compareLoading } = useEurostatCompare({
    countries: COMPARE_COUNTRIES,
    indicator: selectedIndicator,
  });
  const { data: societyData, loading: societyLoading } = useEurostatSociety();
  const { timeSeries: inflationSeries } = useEurostatTimeSeries({ indicator: 'inflation' });
  const { timeSeries: unemploymentSeries } = useEurostatTimeSeries({ indicator: 'unemployment' });

  const loading = polandLoading;
  const error = polandError;

  if (error) {
    return (
      <div>
        <DaneHeader title={t('eurostat.title')} subtitle={t('eurostat.subtitleShort')} icon="ri-global-line" />
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
        title={t('eurostat.title')}
        subtitle={t('eurostat.subtitle')}
        icon="ri-global-line"
        lastUpdate={polandData?.lastUpdate}
      />

      {/* Poland Key Indicators */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
              <i className="ri-pie-chart-line text-primary" />
              {t('eurostat.polandKeyIndicators')}
            </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : polandData ? (
            <StatsGrid
              stats={[
                {
                  label: t('eurostat.gdp'),
                  value: polandData.data.gdp?.value
                    ? `${(polandData.data.gdp.value / 1000000).toFixed(0)} mld`
                    : '-',
                  unit: 'EUR',
                },
                {
                  label: t('eurostat.inflation'),
                  value: polandData.data.inflation?.value?.toFixed(1) ?? '-',
                  unit: '%',
                },
                {
                  label: t('eurostat.unemployment'),
                  value: polandData.data.unemployment?.value?.toFixed(1) ?? '-',
                  unit: '%',
                },
                {
                  label: t('eurostat.population'),
                  value: polandData.data.population?.value
                    ? `${(polandData.data.population.value / 1000000).toFixed(1)} mln`
                    : '-',
                },
              ]}
              columns={4}
            />
          ) : null}
        </CardContent>
      </Card>

      {/* Country Comparison */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
              <i className="ri-bar-chart-grouped-line text-primary" />
              {t('eurostat.countryComparison')}
            </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Indicator Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {INDICATORS.map((ind) => (
              <Button
                key={ind.id}
                variant={selectedIndicator === ind.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedIndicator(ind.id)}
              >
                {ind.name}
              </Button>
            ))}
          </div>

          {/* Comparison Table */}
          {compareLoading ? (
            <Skeleton className="h-48" />
          ) : compareData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">{t('eurostat.country')}</th>
                    <th className="text-right py-2">{t('eurostat.value')}</th>
                    <th className="text-right py-2">{t('eurostat.period')}</th>
                  </tr>
                </thead>
                <tbody>
                  {compareData
                    .filter((c) => c.value !== null)
                    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
                    .map((country) => (
                      <tr
                        key={country.code}
                        className={`border-b last:border-b-0 ${
                          country.code === 'PL' ? 'bg-primary/5 font-medium' : ''
                        }`}
                      >
                        <td className="py-2 flex items-center gap-2">
                          {country.code === 'PL' && (
                            <i className="ri-checkbox-circle-fill text-primary" />
                          )}
                          {COUNTRY_NAMES[country.code] || country.name}
                        </td>
                        <td className="text-right py-2">
                          {country.value?.toLocaleString() ?? '-'}
                        </td>
                        <td className="text-right py-2 text-muted-foreground">
                          {country.period ?? '-'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">{t('eurostat.noComparisonData')}</p>
          )}
        </CardContent>
      </Card>

      {/* Society Data */}
      {societyData && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <i className="ri-group-line text-primary" />
              {t('eurostat.socialIndicators')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {societyLoading ? (
              <Skeleton className="h-32" />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(societyData).map(([key, value]: [string, any]) => (
                  <div key={key} className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">{key}</p>
                    <p className="text-lg font-semibold">
                      {typeof value === 'number' ? value.toLocaleString() : value?.toString() ?? '-'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Time Series Charts */}
      {(inflationSeries.length > 0 || unemploymentSeries.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {inflationSeries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <i className="ri-line-chart-line text-primary" />
                  {t('eurostat.inflationPercent')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EurostatLineChart
                  data={inflationSeries}
                  title={t('eurostat.inflationInPoland')}
                  color="#ef4444"
                  unit="%"
                />
              </CardContent>
            </Card>
          )}
          {unemploymentSeries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <i className="ri-line-chart-line text-primary" />
                  {t('eurostat.unemploymentPercent')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EurostatLineChart
                  data={unemploymentSeries}
                  title={t('eurostat.unemploymentInPoland')}
                  color="#f59e0b"
                  unit="%"
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <DaneSourceFooter
        source="Eurostat"
        sourceUrl="https://ec.europa.eu/eurostat"
      />
    </div>
  );
}
