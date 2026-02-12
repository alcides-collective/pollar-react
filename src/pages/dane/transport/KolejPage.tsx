import { useEffect } from 'react';
import { DaneHeader, DaneSourceFooter } from '@/components/dane';
import { useRailway } from '@/hooks/useTransport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { trackDatasetViewed } from '@/lib/analytics';

export function KolejPage() {
  const { data, loading, error } = useRailway();

  useEffect(() => {
    trackDatasetViewed({ dataset: 'kolej' });
  }, []);

  return (
    <div>
      <DaneHeader
        title="Kolej"
        subtitle="Dane o transporcie kolejowym w Polsce"
        icon="ri-train-line"
      />

      {error && (
        <Card className="border-destructive mb-6">
          <CardContent className="pt-6">
            <p className="text-destructive">Błąd: {error.message}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Statystyki kolejowe</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data ? (
            <div className="space-y-4">
              {data.datasets?.map((dataset: any) => (
                <div key={dataset.id} className="border-b pb-4 last:border-b-0">
                  <p className="font-medium">{dataset.name}</p>
                  <p className="text-sm text-muted-foreground">{dataset.source}</p>
                </div>
              ))}
              {!data.datasets?.length && (
                <p className="text-muted-foreground text-center py-8">
                  Dane w przygotowaniu
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Dane w przygotowaniu
            </p>
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
