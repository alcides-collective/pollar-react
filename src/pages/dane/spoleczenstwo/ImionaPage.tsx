import { useState } from 'react';
import { DaneHeader, DaneSourceFooter } from '@/components/dane';
import { useNames } from '@/hooks/useNames';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export function ImionaPage() {
  const [year, setYear] = useState<number | undefined>(undefined); // API zwróci najnowszy rok
  const [gender, setGender] = useState<'M' | 'K' | undefined>(undefined);
  const [search, setSearch] = useState('');

  const { ranking, availableYears, selectedYear, loading, error } = useNames({ year, gender, limit: 100 });

  // Użyj roku z API jeśli nie wybrano żadnego
  const displayYear = year ?? selectedYear;

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
          className="h-9 w-48"
        />

        <div className="flex gap-1">
          <Button
            variant={gender === undefined ? 'default' : 'outline'}
            className="h-9"
            onClick={() => setGender(undefined)}
          >
            Wszystkie
          </Button>
          <Button
            variant={gender === 'M' ? 'default' : 'outline'}
            className="h-9"
            onClick={() => setGender('M')}
          >
            Męskie
          </Button>
          <Button
            variant={gender === 'K' ? 'default' : 'outline'}
            className="h-9"
            onClick={() => setGender('K')}
          >
            Żeńskie
          </Button>
        </div>

        {availableYears.length > 0 && (
          <select
            value={displayYear ?? availableYears[0]}
            onChange={(e) => setYear(Number(e.target.value))}
            className="h-9 px-3 text-sm border rounded-md bg-background"
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
          <CardContent className="p-0">
            {filteredRanking.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Brak wyników dla podanych kryteriów
              </p>
            ) : (
              <table className="w-full">
                <tbody className="divide-y divide-border">
                  {filteredRanking.map((entry) => (
                    <tr key={`${entry.name}-${entry.gender}`} className="h-12">
                      <td className="w-12 pr-2 text-right tabular-nums text-sm text-muted-foreground font-medium">
                        {entry.rank}
                      </td>
                      <td className="py-2">
                        <div className="font-medium text-sm">{entry.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {entry.gender === 'M' ? (
                            <><i className="ri-men-line text-blue-500" /> męskie</>
                          ) : (
                            <><i className="ri-women-line text-pink-500" /> żeńskie</>
                          )}
                        </div>
                      </td>
                      <td className="w-24 pl-2 text-right">
                        <div className="font-semibold text-sm tabular-nums">{entry.count.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">nadań</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
