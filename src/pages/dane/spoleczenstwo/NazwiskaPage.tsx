import { useState } from 'react';
import { DaneHeader, DaneSourceFooter } from '@/components/dane';
import { useSurnames } from '@/hooks/useSurnames';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export function NazwiskaPage() {
  const [gender, setGender] = useState<'M' | 'K' | undefined>(undefined);
  const [search, setSearch] = useState('');

  const { ranking, loading, error } = useSurnames({ gender, limit: 100 });

  const filteredRanking = ranking.filter(
    (entry) => entry.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <DaneHeader
        title="Nazwiska"
        subtitle="Najpopularniejsze nazwiska w Polsce"
        icon="ri-file-list-3-line"
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Input
          placeholder="Szukaj nazwiska..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-48"
        />

        <div className="flex gap-1">
          <Button
            variant={gender === undefined ? 'default' : 'outline'}
            size="sm"
            onClick={() => setGender(undefined)}
          >
            Wszystkie
          </Button>
          <Button
            variant={gender === 'M' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setGender('M')}
          >
            Męskie
          </Button>
          <Button
            variant={gender === 'K' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setGender('K')}
          >
            Żeńskie
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Błąd: {error.message}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )}

      {/* Ranking */}
      {!loading && !error && (
        <Card>
          <CardContent className="pt-6">
            {filteredRanking.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Brak wyników dla podanych kryteriów
              </p>
            ) : (
              <div className="divide-y">
                {filteredRanking.map((entry) => (
                  <div
                    key={`${entry.name}-${entry.gender}`}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-muted-foreground w-8">
                        {entry.rank}
                      </span>
                      <div>
                        <p className="font-medium">{entry.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {entry.gender === 'M' ? 'męskie' : 'żeńskie'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{entry.count.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">osób</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <DaneSourceFooter
        source="dane.gov.pl"
        sourceUrl="https://dane.gov.pl"
      />
    </div>
  );
}
