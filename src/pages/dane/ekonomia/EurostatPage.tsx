import { useState } from 'react';
import { DaneHeader, DaneSourceFooter, StatsGrid } from '@/components/dane';
import { EurostatLineChart } from '@/components/dane/charts';
import { useEurostatPoland, useEurostatCompare, useEurostatSociety, useEurostatTimeSeries } from '@/hooks/useEurostat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const COUNTRY_NAMES: Record<string, string> = {
  PL: 'Polska',
  DE: 'Niemcy',
  CZ: 'Czechy',
  SK: 'Słowacja',
  HU: 'Węgry',
  AT: 'Austria',
};

const INDICATORS = [
  { id: 'gdp', name: 'PKB', unit: 'mln EUR' },
  { id: 'inflation', name: 'Inflacja', unit: '%' },
  { id: 'unemployment', name: 'Bezrobocie', unit: '%' },
  { id: 'population', name: 'Populacja', unit: 'mln' },
];

const COMPARE_COUNTRIES = ['PL', 'DE', 'CZ', 'SK', 'HU', 'AT'];

export function EurostatPage() {
  const [selectedIndicator, setSelectedIndicator] = useState('gdp');

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
        <DaneHeader title="Eurostat" subtitle="Dane makroekonomiczne UE" icon="ri-global-line" />
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
        title="Eurostat"
        subtitle="Dane makroekonomiczne z Eurostatu"
        icon="ri-global-line"
        lastUpdate={polandData?.lastUpdate}
      />

      {/* Poland Key Indicators */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
              <i className="ri-pie-chart-line text-primary" />
              Polska - kluczowe wskaźniki
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
                  label: 'PKB',
                  value: polandData.data.gdp?.value
                    ? `${(polandData.data.gdp.value / 1000000).toFixed(0)} mld`
                    : '-',
                  unit: 'EUR',
                },
                {
                  label: 'Inflacja',
                  value: polandData.data.inflation?.value?.toFixed(1) ?? '-',
                  unit: '%',
                },
                {
                  label: 'Bezrobocie',
                  value: polandData.data.unemployment?.value?.toFixed(1) ?? '-',
                  unit: '%',
                },
                {
                  label: 'Populacja',
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
              Porównanie krajów
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
                    <th className="text-left py-2">Kraj</th>
                    <th className="text-right py-2">Wartość</th>
                    <th className="text-right py-2">Okres</th>
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
            <p className="text-muted-foreground text-center py-8">Brak danych do porównania</p>
          )}
        </CardContent>
      </Card>

      {/* Society Data */}
      {societyData && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <i className="ri-group-line text-primary" />
              Wskaźniki społeczne
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
                  Inflacja (%)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EurostatLineChart
                  data={inflationSeries}
                  title="Inflacja w Polsce"
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
                  Bezrobocie (%)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EurostatLineChart
                  data={unemploymentSeries}
                  title="Bezrobocie w Polsce"
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
