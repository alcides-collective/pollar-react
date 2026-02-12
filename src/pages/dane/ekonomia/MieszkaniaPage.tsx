import { useEffect } from 'react';
import { DaneHeader, DaneSourceFooter, StatsGrid } from '@/components/dane';
import { useHousing, useHousingSummary } from '@/hooks/useHousing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { trackDatasetViewed } from '@/lib/analytics';

export function MieszkaniaPage() {
  const { datasets, totalCount, loading: datasetsLoading } = useHousing();
  const { summary, loading: summaryLoading } = useHousingSummary();

  useEffect(() => {
    trackDatasetViewed({ dataset: 'mieszkania' });
  }, []);

  const loading = datasetsLoading || summaryLoading;

  return (
    <div>
      <DaneHeader
        title="Ceny mieszkań"
        subtitle="Dane o cenach nieruchomości w Polsce"
        icon="ri-building-line"
      />

      {/* Stats */}
      {summary?.avgPricePerSqm && (
        <StatsGrid
          stats={[
            {
              label: 'Średnia cena',
              value: `${summary.avgPricePerSqm.toLocaleString()} zł`,
              unit: '/m²',
            },
            {
              label: 'Oferty',
              value: (summary.totalListings ?? 0).toLocaleString(),
            },
          ]}
          columns={2}
          loading={loading}
          className="mb-6"
        />
      )}

      {/* Cities */}
      {summary?.byCity && summary.byCity.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Ceny według miast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {summary.byCity.map((city) => (
                <div key={city.city} className="flex justify-between py-3">
                  <span className="font-medium">{city.city}</span>
                  <div className="text-right">
                    <span className="font-semibold">{city.avgPrice.toLocaleString()} zł/m²</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({city.count} ofert)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Datasets info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dostępne zbiory danych ({totalCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : datasets.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Dane w przygotowaniu
            </p>
          ) : (
            <div className="divide-y">
              {datasets.slice(0, 10).map((dataset) => (
                <div key={dataset.id} className="py-3">
                  <p className="font-medium">{dataset.title}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    <span>{dataset.institution}</span>
                    {dataset.resourceCount && (
                      <span>{dataset.resourceCount} zasobów</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DaneSourceFooter
        source="dane.gov.pl"
        sourceUrl="https://dane.gov.pl"
      />
    </div>
  );
}
