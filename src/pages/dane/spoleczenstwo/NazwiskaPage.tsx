import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DaneHeader, DaneSourceFooter } from '@/components/dane';
import { useSurnames } from '@/hooks/useSurnames';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguageStore } from '@/stores/languageStore';

export function NazwiskaPage() {
  const { t } = useTranslation('dane');
  const language = useLanguageStore((s) => s.language);
  const localeMap: Record<string, string> = { pl: 'pl-PL', en: 'en-US', de: 'de-DE' };
  const [search, setSearch] = useState('');

  const { ranking, date, loading, error } = useSurnames({ limit: 100 });

  const filteredRanking = ranking.filter(
    (entry) => entry.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <DaneHeader
        title={t('nazwiska.title')}
        subtitle={t('nazwiska.subtitle')}
        icon="ri-file-list-3-line"
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Input
          placeholder={t('nazwiska.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-64"
        />
        {date && (
          <p className="text-sm text-muted-foreground self-center">
            {t('common.asOf')}: {date}
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{t('common.error')}: {error.message}</p>
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
                {t('common.noResults')}
              </p>
            ) : (
              <table className="w-full">
                <tbody className="divide-y divide-border">
                  {filteredRanking.map((entry) => (
                    <tr key={entry.name} className="h-12">
                      <td className="w-12 pr-2 text-right tabular-nums text-sm text-muted-foreground font-medium">
                        {entry.rank}
                      </td>
                      <td className="py-2">
                        <div className="font-medium text-sm">{entry.name}</div>
                        <div className="text-xs text-muted-foreground">
                          <i className="ri-men-line text-blue-500" /> {entry.maleCount.toLocaleString(localeMap[language] || 'pl-PL')}
                          <span className="mx-1">·</span>
                          <i className="ri-women-line text-pink-500" /> {entry.femaleCount.toLocaleString(localeMap[language] || 'pl-PL')}
                        </div>
                      </td>
                      <td className="w-24 pl-2 text-right">
                        <div className="font-semibold text-sm tabular-nums">{entry.totalCount.toLocaleString(localeMap[language] || 'pl-PL')}</div>
                        <div className="text-xs text-muted-foreground">{t('nazwiska.people')}</div>
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
        sourceUrl="https://dane.gov.pl"
      />
    </div>
  );
}
