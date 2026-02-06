import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useEvents } from '@/stores/eventsStore';
import { useDocumentHead } from '@/hooks/useDocumentHead';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { cn } from '@/lib/utils';
import {
  getSourceNationality,
  isNationalityMapped,
  nationalityFlags,
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

const politicalLabels: Record<PoliticalLeaning, { pl: string; en: string }> = {
  far_left: { pl: 'Skrajna lewica', en: 'Far left' },
  left: { pl: 'Lewica', en: 'Left' },
  center_left: { pl: 'Centro-lewica', en: 'Center-left' },
  center: { pl: 'Centrum', en: 'Center' },
  center_right: { pl: 'Centro-prawica', en: 'Center-right' },
  right: { pl: 'Prawica', en: 'Right' },
  far_right: { pl: 'Skrajna prawica', en: 'Far right' },
  unknown: { pl: 'Nieznane', en: 'Unknown' },
};

function getPoliticalColorClass(leaning: PoliticalLeaning): string {
  switch (leaning) {
    case 'far_left':
    case 'left':
    case 'center_left':
      return 'bg-red-700 text-white';
    case 'center':
      return 'bg-zinc-400 text-white';
    case 'center_right':
    case 'right':
    case 'far_right':
      return 'bg-blue-700 text-white';
    default:
      return 'bg-zinc-200 text-zinc-700';
  }
}

type SortColumn = 'count' | 'name' | 'nationality' | 'political';

export function SourcesPage() {
  const { t, i18n } = useTranslation('common');
  const lang = i18n.language === 'en' ? 'en' : 'pl';
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
      const sorted = unmapped.sort((a, b) => b.count - a.count);
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
    () => (sources.length > 0 ? Math.round(totalArticles / sources.length) : 0),
    [sources, totalArticles],
  );

  // Country stats
  const countryStats = useMemo(() => {
    const counts: Record<SourceNationality, number> = {
      polish: 0, american: 0, british: 0, german: 0,
      swiss_german: 0, swedish: 0, french: 0, other: 0,
    };
    for (const s of sources) {
      counts[s.nationality]++;
    }
    return (Object.keys(counts) as SourceNationality[])
      .filter((key) => counts[key] > 0)
      .map((nationality) => ({ nationality, count: counts[nationality] }))
      .sort((a, b) => b.count - a.count);
  }, [sources]);

  // Political balance
  const politicalStats = useMemo(() => {
    const counts: Record<PoliticalLeaning, number> = {
      far_left: 0, left: 0, center_left: 0, center: 0,
      center_right: 0, right: 0, far_right: 0, unknown: 0,
    };
    for (const s of sources) {
      counts[s.politicalLeaning]++;
    }
    return counts;
  }, [sources]);

  const politicalBalance = useMemo(() => {
    const left = politicalStats.far_left + politicalStats.left + politicalStats.center_left;
    const center = politicalStats.center;
    const right = politicalStats.center_right + politicalStats.right + politicalStats.far_right;
    const total = left + center + right;
    return {
      left,
      center,
      right,
      leftPct: total > 0 ? Math.round((left / total) * 100) : 0,
      centerPct: total > 0 ? Math.round((center / total) * 100) : 0,
      rightPct: total > 0 ? Math.round((right / total) * 100) : 0,
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
        <div className="mb-8">
          <div className="h-8 w-48 bg-zinc-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-96 bg-zinc-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-zinc-200 rounded-xl p-5 h-24 animate-pulse" />
          ))}
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-5 h-16 animate-pulse mb-6" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white border border-zinc-200 rounded-xl p-4 h-14 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <i className="ri-newspaper-line text-2xl text-zinc-400" />
          <h1 className="text-2xl font-bold text-zinc-900">{t('sources.title')}</h1>
        </div>
        <p className="text-zinc-500">{t('sources.subtitle')}</p>
      </div>

      {/* Statistics Cards */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem} className="rounded-xl p-5 text-center bg-gradient-to-br from-blue-500 to-blue-700 text-white">
          <div className="text-3xl font-semibold">{sources.length}</div>
          <div className="text-xs uppercase tracking-wider mt-1 text-white/80">{t('sources.sourcesCount')}</div>
        </motion.div>

        <motion.div variants={staggerItem} className="rounded-xl p-5 text-center bg-white border border-zinc-200">
          <div className="text-3xl font-semibold text-zinc-900">{totalArticles.toLocaleString()}</div>
          <div className="text-xs uppercase tracking-wider mt-1 text-zinc-500">{t('sources.totalArticles')}</div>
        </motion.div>

        <motion.div variants={staggerItem} className="rounded-xl p-5 text-center bg-white border border-zinc-200">
          <div className="text-3xl font-semibold text-zinc-900">{avgArticlesPerSource}</div>
          <div className="text-xs uppercase tracking-wider mt-1 text-zinc-500">{t('sources.avgPerSource')}</div>
        </motion.div>

        {topSource && (
          <motion.div variants={staggerItem} className="rounded-xl p-5 text-center bg-amber-50 border border-amber-200">
            <div className="text-lg font-semibold text-zinc-900 break-words">{topSource.name}</div>
            <div className="text-xs uppercase tracking-wider mt-1 text-zinc-500">
              {t('sources.topSource')}
              <span className="block text-[10px] normal-case tracking-normal opacity-70 mt-0.5">
                ({topSource.count.toLocaleString()} {t('sources.articles')})
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Political Balance Bar */}
      <div className="rounded-xl bg-white border border-zinc-200 p-5 mb-6">
        <h3 className="text-sm font-medium text-zinc-600 mb-3">{t('sources.politicalBalance')}</h3>
        <div className="flex h-8 rounded-lg overflow-hidden bg-zinc-100">
          {politicalBalance.leftPct > 0 && (
            <div
              className="flex items-center justify-center transition-all duration-300 bg-gradient-to-r from-red-800 to-red-700"
              style={{ width: `${politicalBalance.leftPct}%` }}
              title={`${t('sources.left')}: ${politicalBalance.left}`}
            >
              {politicalBalance.leftPct >= 10 && (
                <span className="text-xs font-semibold text-white">{politicalBalance.leftPct}%</span>
              )}
            </div>
          )}
          {politicalBalance.centerPct > 0 && (
            <div
              className="flex items-center justify-center transition-all duration-300 bg-gradient-to-r from-zinc-500 to-zinc-400"
              style={{ width: `${politicalBalance.centerPct}%` }}
              title={`${t('sources.center')}: ${politicalBalance.center}`}
            >
              {politicalBalance.centerPct >= 10 && (
                <span className="text-xs font-semibold text-white">{politicalBalance.centerPct}%</span>
              )}
            </div>
          )}
          {politicalBalance.rightPct > 0 && (
            <div
              className="flex items-center justify-center transition-all duration-300 bg-gradient-to-r from-blue-700 to-blue-600"
              style={{ width: `${politicalBalance.rightPct}%` }}
              title={`${t('sources.right')}: ${politicalBalance.right}`}
            >
              {politicalBalance.rightPct >= 10 && (
                <span className="text-xs font-semibold text-white">{politicalBalance.rightPct}%</span>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-4 mt-3 justify-center">
          <span className="flex items-center gap-1.5 text-sm text-zinc-600">
            <span className="w-2.5 h-2.5 rounded-full bg-red-700" />
            {t('sources.left')} ({politicalBalance.left})
          </span>
          <span className="flex items-center gap-1.5 text-sm text-zinc-600">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
            {t('sources.center')} ({politicalBalance.center})
          </span>
          <span className="flex items-center gap-1.5 text-sm text-zinc-600">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-700" />
            {t('sources.right')} ({politicalBalance.right})
          </span>
        </div>
      </div>

      {/* Country Distribution */}
      <div className="rounded-xl bg-white border border-zinc-200 p-5 mb-6">
        <h3 className="text-sm font-medium text-zinc-600 mb-3">{t('sources.byCountry')}</h3>
        <div className="flex flex-wrap gap-2">
          {countryStats.map((stat) => (
            <button
              key={stat.nationality}
              onClick={() => setFilterNationality(filterNationality === stat.nationality ? 'all' : stat.nationality)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors',
                filterNationality === stat.nationality
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50',
              )}
            >
              <span className="text-lg">{nationalityFlags[stat.nationality]}</span>
              <span>{nationalityLabels[stat.nationality][lang]}</span>
              <span
                className={cn(
                  'text-xs font-semibold px-1.5 py-0.5 rounded',
                  filterNationality === stat.nationality ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500',
                )}
              >
                {stat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Political Spectrum Legend */}
      <div className="rounded-xl bg-white border border-zinc-200 p-5 mb-6">
        <h3 className="text-sm font-medium text-zinc-600 mb-3">{t('sources.spectrumLegend')}</h3>
        <div className="flex flex-wrap gap-2">
          {allPoliticalLeanings.map((key) => (
            <span key={key} className={cn('inline-block px-2.5 py-1 text-xs font-medium rounded', getPoliticalColorClass(key))}>
              {politicalLabels[key][lang]}
            </span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('sources.searchPlaceholder')}
          className="px-3 py-2 border border-zinc-200 rounded-lg bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 w-48"
        />
        <select
          value={filterNationality}
          onChange={(e) => setFilterNationality(e.target.value as SourceNationality | 'all')}
          className="px-3 py-2 border border-zinc-200 rounded-lg bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <option value="all">{t('sources.allNationalities')}</option>
          {allNationalities.map((nat) => (
            <option key={nat} value={nat}>
              {nationalityFlags[nat]} {nationalityLabels[nat][lang]}
            </option>
          ))}
        </select>
        <select
          value={filterPolitical}
          onChange={(e) => setFilterPolitical(e.target.value as PoliticalLeaning | 'all')}
          className="px-3 py-2 border border-zinc-200 rounded-lg bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <option value="all">{t('sources.allPolitical')}</option>
          {allPoliticalLeanings.map((pol) => (
            <option key={pol} value={pol}>
              {politicalLabels[pol][lang]}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-200 overflow-hidden bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th
                className="text-left px-4 py-3 text-xs uppercase tracking-wider text-zinc-400 cursor-pointer hover:text-zinc-700 transition-colors select-none"
                onClick={() => toggleSort('name')}
              >
                {t('sources.colSource')}
                {sortBy === 'name' && <span className="ml-1">{sortAsc ? '\u2191' : '\u2193'}</span>}
              </th>
              <th
                className="text-left px-4 py-3 text-xs uppercase tracking-wider text-zinc-400 cursor-pointer hover:text-zinc-700 transition-colors select-none"
                onClick={() => toggleSort('nationality')}
              >
                {t('sources.colCountry')}
                {sortBy === 'nationality' && <span className="ml-1">{sortAsc ? '\u2191' : '\u2193'}</span>}
              </th>
              <th
                className="text-left px-4 py-3 text-xs uppercase tracking-wider text-zinc-400 cursor-pointer hover:text-zinc-700 transition-colors select-none"
                onClick={() => toggleSort('political')}
              >
                {t('sources.colPolitical')}
                {sortBy === 'political' && <span className="ml-1">{sortAsc ? '\u2191' : '\u2193'}</span>}
              </th>
              <th
                className="text-right px-4 py-3 text-xs uppercase tracking-wider text-zinc-400 cursor-pointer hover:text-zinc-700 transition-colors select-none"
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
                className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.5) }}
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-zinc-900">{source.name}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-lg">{nationalityFlags[source.nationality]}</span>
                    <span className="text-sm text-zinc-500">{nationalityLabels[source.nationality][lang]}</span>
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('inline-block px-2 py-0.5 text-xs font-medium rounded', getPoliticalColorClass(source.politicalLeaning))}>
                    {politicalLabels[source.politicalLeaning][lang]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-zinc-600 font-mono text-sm">{source.count.toLocaleString()}</span>
                </td>
              </motion.tr>
            ))}
            {filteredSources.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-zinc-400">
                  {t('sources.noResults')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
