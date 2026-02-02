import { DaneHeader, DaneSourceFooter } from '@/components/dane';
import { usePorts } from '@/hooks/useTransport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function PortyPage() {
  const { data, loading, error } = usePorts();

  return (
    <div>
      <DaneHeader
        title="Porty"
        subtitle="Dane o portach morskich i śródlądowych w Polsce"
        icon="ri-anchor-line"
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
          <CardTitle className="text-lg">Statystyki portowe</CardTitle>
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
