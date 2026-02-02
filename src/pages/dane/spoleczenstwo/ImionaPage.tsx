import { useState } from 'react';
import { DaneHeader, DaneSourceFooter } from '@/components/dane';
import { useNames } from '@/hooks/useNames';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export function ImionaPage() {
  const [year, setYear] = useState<number | undefined>(2023);
  const [gender, setGender] = useState<'M' | 'K' | undefined>(undefined);
  const [search, setSearch] = useState('');

  const { ranking, availableYears, loading, error } = useNames({ year, gender, limit: 100 });

  const filteredRanking = ranking.filter(
    (entry) => entry.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <DaneHeader
        title="Imiona"
        subtitle="Najpopularniejsze imiona nadawane w Polsce"
        icon="ri-user-heart-line"
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Input
          placeholder="Szukaj imienia..."
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

        {availableYears.length > 0 && (
          <select
            value={year ?? ''}
            onChange={(e) => setYear(e.target.value ? Number(e.target.value) : undefined)}
            className="px-3 py-1 text-sm border rounded-md bg-background"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        )}
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
                      <p className="text-sm text-muted-foreground">nadań</p>
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
        sourceUrl="https://dane.gov.pl/pl/dataset/219"
      />
    </div>
  );
}
