import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useEvents } from '@/stores/eventsStore';
import { useDocumentHead } from '@/hooks/useDocumentHead';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { DaneHeader } from '@/components/dane/DaneHeader';
import { StatsGrid } from '@/components/dane/StatsGrid';
import {
  getSourceNationality,
  isNationalityMapped,
  nationalityCodes,
  nationalityLabels,
  allNationalities,
  type SourceNationality,
} from '@/utils/source-nationality';
import {
  getPoliticalLeaning,
  isPoliticalMapped,
  allPoliticalLeanings,
  politicalOrder,
  type PoliticalLeaning,
} from '@/utils/political-mapping';

interface SourceInfo {
  name: string;
  count: number;
  nationality: SourceNationality;
  politicalLeaning: PoliticalLeaning;
}

type LangKey = 'pl' | 'en' | 'de';

const politicalLabels: Record<PoliticalLeaning, Record<LangKey, string>> = {
  progressive: { pl: 'Progresywne', en: 'Progressive', de: 'Progressiv' },
  center_left: { pl: 'Centrolewicowe', en: 'Center-left', de: 'Mitte-links' },
  center: { pl: 'Centrowe', en: 'Centrist', de: 'Mitte' },
  center_right: { pl: 'Centroprawicowe', en: 'Center-right', de: 'Mitte-rechts' },
  conservative: { pl: 'Konserwatywne', en: 'Conservative', de: 'Konservativ' },
  unknown: { pl: 'Nieznane', en: 'Unknown', de: 'Unbekannt' },
};

function getPoliticalColorClass(leaning: PoliticalLeaning): string {
  switch (leaning) {
    case 'progressive':
    case 'center_left':
      return 'bg-red-700 text-white';
    case 'center':
      return 'bg-zinc-400 text-white';
    case 'center_right':
    case 'conservative':
      return 'bg-blue-700 text-white';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function FlagIcon({ nationality }: { nationality: SourceNationality }) {
  const code = nationalityCodes[nationality];
  return code ? <span className={`fi fi-${code}`} /> : <i className="ri-global-line text-base text-muted-foreground" />;
}

type SortColumn = 'count' | 'name' | 'nationality' | 'political';

export function SourcesPage() {
  const { t, i18n } = useTranslation('common');
  const lang: LangKey = i18n.language === 'en' ? 'en' : i18n.language === 'de' ? 'de' : 'pl';
  const { events, loading } = useEvents({ includeArchive: true });

  const [sortBy, setSortBy] = useState<SortColumn>('count');
  const [sortAsc, setSortAsc] = useState(false);
  const [filterNationality, setFilterNationality] = useState<SourceNationality | 'all'>('all');
  const [filterPolitical, setFilterPolitical] = useState<PoliticalLeaning | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useDocumentHead({
    title: t('sources.title'),
    description: t('sources.subtitle'),
    ogTitle: t('sources.title'),
    ogDescription: t('sources.subtitle'),
  });

  // Extract sources from events
  const sources = useMemo<SourceInfo[]>(() => {
    const sourceMap = new Map<string, number>();
    for (const event of events) {
      if (event.sources && Array.isArray(event.sources)) {
        for (const source of event.sources) {
          if (source && typeof source === 'string') {
            sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
          }
        }
      }
    }
    const result = Array.from(sourceMap.entries()).map(([name, count]) => ({
      name,
      count,
      nationality: getSourceNationality(name),
      politicalLeaning: getPoliticalLeaning(name),
    }));

    // Warn about unmapped sources (only truly unmapped, not intentional 'other'/'unknown')
    const unmapped = result.filter(
      (s) => s.name.toLowerCase() !== 'unknown' && (!isNationalityMapped(s.name) || !isPoliticalMapped(s.name)),
    );
    if (unmapped.length > 0) {
      const sorted = [...unmapped].sort((a, b) => b.count - a.count);
      const top5 = sorted.slice(0, 5);
      console.warn(
        `[Sources] ${unmapped.length} unmapped sources found (top 5):\n` +
          top5
            .map(
              (s) =>
                `  "${s.name}" (${s.count} art.) — nationality: ${s.nationality}, political: ${s.politicalLeaning}`,
            )
            .join('\n') +
          (unmapped.length > 5 ? `\n  ...and ${unmapped.length - 5} more` : ''),
      );
    }

    return result;
  }, [events]);

  // Filtered & sorted
  const filteredSources = useMemo(() => {
    return sources
      .filter((s) => {
        if (s.name.toLowerCase() === 'unknown') return false;
        if (filterNationality !== 'all' && s.nationality !== filterNationality) return false;
        if (filterPolitical !== 'all' && s.politicalLeaning !== filterPolitical) return false;
        if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        switch (sortBy) {
          case 'count':
            cmp = b.count - a.count;
            break;
          case 'name':
            cmp = a.name.localeCompare(b.name);
            break;
          case 'nationality':
            cmp = a.nationality.localeCompare(b.nationality);
            break;
          case 'political':
            cmp = politicalOrder(a.politicalLeaning) - politicalOrder(b.politicalLeaning);
            break;
        }
        return sortAsc ? -cmp : cmp;
      });
  }, [sources, filterNationality, filterPolitical, searchQuery, sortBy, sortAsc]);

  // Statistics
  const totalArticles = useMemo(() => sources.reduce((sum, s) => sum + s.count, 0), [sources]);
  const topSource = useMemo(
    () => (sources.length > 0 ? sources.reduce((max, s) => (s.count > max.count ? s : max), sources[0]) : null),
    [sources],
  );
  const avgArticlesPerSource = useMemo(
    () => (sources.length > 0 ? (totalArticles / sources.length).toFixed(3) : '0.000'),
    [sources, totalArticles],
  );

  // Country stats
  const countryStats = useMemo(() => {
    const counts = Object.fromEntries(allNationalities.map((n) => [n, 0])) as Record<SourceNationality, number>;
    for (const s of sources) {
      counts[s.nationality] = (counts[s.nationality] || 0) + 1;
    }
    return (Object.keys(counts) as SourceNationality[])
      .filter((key) => counts[key] > 0)
      .map((nationality) => ({ nationality, count: counts[nationality] }))
      .sort((a, b) => b.count - a.count);
  }, [sources]);

  // Political balance
  const politicalStats = useMemo(() => {
    const counts: Record<PoliticalLeaning, number> = {
      progressive: 0, center_left: 0, center: 0,
      center_right: 0, conservative: 0, unknown: 0,
    };
    for (const s of sources) {
      counts[s.politicalLeaning]++;
    }
    return counts;
  }, [sources]);

  const activePoliticalLeanings = useMemo(
    () => allPoliticalLeanings.filter((key) => politicalStats[key] > 0),
    [politicalStats],
  );

  const politicalBalance = useMemo(() => {
    const progressive = politicalStats.progressive;
    const centerLeft = politicalStats.center_left;
    const center = politicalStats.center;
    const centerRight = politicalStats.center_right;
    const conservative = politicalStats.conservative;
    const total = progressive + centerLeft + center + centerRight + conservative;
    return {
      progressive,
      centerLeft,
      center,
      centerRight,
      conservative,
      progressivePct: total > 0 ? Math.round((progressive / total) * 100) : 0,
      centerLeftPct: total > 0 ? Math.round((centerLeft / total) * 100) : 0,
      centerPct: total > 0 ? Math.round((center / total) * 100) : 0,
      centerRightPct: total > 0 ? Math.round((centerRight / total) * 100) : 0,
      conservativePct: total > 0 ? Math.round((conservative / total) * 100) : 0,
    };
  }, [politicalStats]);

  function toggleSort(col: SortColumn) {
    if (sortBy === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(col);
      setSortAsc(false);
    }
  }

  // Loading skeleton
  if (loading && sources.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-zinc-200">
              <CardContent className="pt-6">
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="border-zinc-200">
                  <CardContent className="pt-6">
                    <Skeleton className="h-6 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border-zinc-200">
                  <CardContent className="pt-6">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="border-zinc-200">
              <CardContent className="pt-6">
                <Skeleton className="h-6 w-full" />
              </CardContent>
            </Card>
            <Card className="border-zinc-200">
              <CardContent className="pt-6">
                <Skeleton className="h-6 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Header */}
      <DaneHeader title={t('sources.title')} subtitle={t('sources.subtitle')} icon="ri-newspaper-line" />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column — Filters & Table */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <Card className="border-zinc-200 py-4 gap-3">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium">{t('sources.filters')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 items-center">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('sources.searchPlaceholder')}
                  className="w-48"
                />
                <select
                  value={filterNationality}
                  onChange={(e) => setFilterNationality(e.target.value as SourceNationality | 'all')}
                  className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                >
                  <option value="all">{t('sources.allNationalities')}</option>
                  {countryStats.map(({ nationality }) => (
                    <option key={nationality} value={nationality}>
                      {nationalityLabels[nationality][lang]}
                    </option>
                  ))}
                </select>
                <select
                  value={filterPolitical}
                  onChange={(e) => setFilterPolitical(e.target.value as PoliticalLeaning | 'all')}
                  className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                >
                  <option value="all">{t('sources.allPolitical')}</option>
                  {activePoliticalLeanings.map((pol) => (
                    <option key={pol} value={pol}>
                      {politicalLabels[pol][lang]}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="overflow-hidden border-zinc-200 py-0">
            <CardContent className="p-0">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-muted">
                    <th
                      className="w-[30%] text-left px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                      onClick={() => toggleSort('name')}
                    >
                      {t('sources.colSource')}
                      {sortBy === 'name' && <span className="ml-1">{sortAsc ? '\u2191' : '\u2193'}</span>}
                    </th>
                    <th
                      className="w-[25%] text-left px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                      onClick={() => toggleSort('nationality')}
                    >
                      {t('sources.colCountry')}
                      {sortBy === 'nationality' && <span className="ml-1">{sortAsc ? '\u2191' : '\u2193'}</span>}
                    </th>
                    <th
                      className="text-left px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                      onClick={() => toggleSort('political')}
                    >
                      {t('sources.colPolitical')}
                      {sortBy === 'political' && <span className="ml-1">{sortAsc ? '\u2191' : '\u2193'}</span>}
                    </th>
                    <th
                      className="text-right px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                      onClick={() => toggleSort('count')}
                    >
                      {t('sources.colArticles')}
                      {sortBy === 'count' && <span className="ml-1">{sortAsc ? '\u2191' : '\u2193'}</span>}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSources.map((source, i) => (
                    <motion.tr
                      key={source.name}
                      className="border-b border-zinc-200/50 hover:bg-muted/50 transition-colors"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.5) }}
                    >
                      <td className="px-3 py-2">
                        <span className="font-medium text-sm">{source.name}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1.5">
                          <FlagIcon nationality={source.nationality} />
                          <span className="text-sm text-muted-foreground">{nationalityLabels[source.nationality][lang]}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={cn('inline-block px-2 py-0.5 text-xs font-medium rounded', getPoliticalColorClass(source.politicalLeaning))}>
                          {politicalLabels[source.politicalLeaning][lang]}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className="text-muted-foreground font-mono text-sm">{source.count.toLocaleString()}</span>
                      </td>
                    </motion.tr>
                  ))}
                  {filteredSources.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                        {t('sources.noResults')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar — Stats & Info */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {/* Statistics Cards */}
            <StatsGrid
              stats={[
                { label: t('sources.sourcesCount'), value: sources.length },
                { label: t('sources.totalArticles'), value: totalArticles.toLocaleString() },
                { label: t('sources.avgPerSource'), value: avgArticlesPerSource },
                ...(topSource
                  ? [{ label: `${t('sources.topSource')} (${topSource.count.toLocaleString()} ${t('sources.articles')})`, value: topSource.name }]
                  : []),
              ]}
              columns={2}
              className="gap-3"
              cardClassName="border-zinc-200 py-3 gap-0"
              contentClassName="pt-0"
            />

            {/* Political Balance Bar */}
            <Card className="border-zinc-200 py-4 gap-3">
              <CardHeader className="pb-0">
                <CardTitle className="text-sm font-medium">{t('sources.politicalBalance')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-5 rounded-lg overflow-hidden bg-muted">
                  {politicalBalance.progressivePct > 0 && (
                    <div
                      className="flex items-center justify-center transition-all duration-300 bg-red-800"
                      style={{ width: `${politicalBalance.progressivePct}%` }}
                      title={`${politicalLabels.progressive[lang]}: ${politicalBalance.progressive}`}
                    >
                      {politicalBalance.progressivePct >= 10 && (
                        <span className="text-[10px] font-semibold text-white">{politicalBalance.progressivePct}%</span>
                      )}
                    </div>
                  )}
                  {politicalBalance.centerLeftPct > 0 && (
                    <div
                      className="flex items-center justify-center transition-all duration-300 bg-red-600"
                      style={{ width: `${politicalBalance.centerLeftPct}%` }}
                      title={`${politicalLabels.center_left[lang]}: ${politicalBalance.centerLeft}`}
                    >
                      {politicalBalance.centerLeftPct >= 10 && (
                        <span className="text-[10px] font-semibold text-white">{politicalBalance.centerLeftPct}%</span>
                      )}
                    </div>
                  )}
                  {politicalBalance.centerPct > 0 && (
                    <div
                      className="flex items-center justify-center transition-all duration-300 bg-zinc-400"
                      style={{ width: `${politicalBalance.centerPct}%` }}
                      title={`${politicalLabels.center[lang]}: ${politicalBalance.center}`}
                    >
                      {politicalBalance.centerPct >= 10 && (
                        <span className="text-[10px] font-semibold text-white">{politicalBalance.centerPct}%</span>
                      )}
                    </div>
                  )}
                  {politicalBalance.centerRightPct > 0 && (
                    <div
                      className="flex items-center justify-center transition-all duration-300 bg-blue-600"
                      style={{ width: `${politicalBalance.centerRightPct}%` }}
                      title={`${politicalLabels.center_right[lang]}: ${politicalBalance.centerRight}`}
                    >
                      {politicalBalance.centerRightPct >= 10 && (
                        <span className="text-[10px] font-semibold text-white">{politicalBalance.centerRightPct}%</span>
                      )}
                    </div>
                  )}
                  {politicalBalance.conservativePct > 0 && (
                    <div
                      className="flex items-center justify-center transition-all duration-300 bg-blue-800"
                      style={{ width: `${politicalBalance.conservativePct}%` }}
                      title={`${politicalLabels.conservative[lang]}: ${politicalBalance.conservative}`}
                    >
                      {politicalBalance.conservativePct >= 10 && (
                        <span className="text-[10px] font-semibold text-white">{politicalBalance.conservativePct}%</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-red-800" />
                    {politicalLabels.progressive[lang]} ({politicalBalance.progressive})
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    {politicalLabels.center_left[lang]} ({politicalBalance.centerLeft})
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-zinc-400" />
                    {politicalLabels.center[lang]} ({politicalBalance.center})
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    {politicalLabels.center_right[lang]} ({politicalBalance.centerRight})
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-blue-800" />
                    {politicalLabels.conservative[lang]} ({politicalBalance.conservative})
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Country Distribution */}
            <Card className="border-zinc-200 py-4 gap-3">
              <CardHeader className="pb-0">
                <CardTitle className="text-sm font-medium">{t('sources.byCountry')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {countryStats.map((stat) => (
                    <Button
                      key={stat.nationality}
                      variant={filterNationality === stat.nationality ? 'default' : 'outline'}
                      size="sm"
                      className={cn('h-7 text-xs', filterNationality !== stat.nationality ? 'border-zinc-200' : undefined)}
                      onClick={() => setFilterNationality(filterNationality === stat.nationality ? 'all' : stat.nationality)}
                    >
                      <FlagIcon nationality={stat.nationality} />
                      <span>{nationalityLabels[stat.nationality][lang]}</span>
                      <span
                        className={cn(
                          'text-xs font-semibold px-1 py-0 rounded',
                          filterNationality === stat.nationality ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {stat.count}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Political Spectrum Legend */}
            <Card className="border-zinc-200 py-4 gap-3">
              <CardHeader className="pb-0">
                <CardTitle className="text-sm font-medium">{t('sources.spectrumLegend')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {allPoliticalLeanings.map((key) => (
                    <span key={key} className={cn('inline-block px-2.5 py-1 text-xs font-medium rounded', getPoliticalColorClass(key))}>
                      {politicalLabels[key][lang]}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
