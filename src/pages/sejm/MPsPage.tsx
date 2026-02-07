import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useMPs } from '../../hooks/useMPs';
import { MPCard, SejmApiError } from '../../components/sejm';

type SortOption = 'name' | 'votes' | 'club' | 'voivodeship';

export function MPsPage() {
  const { t } = useTranslation('sejm');
  const { mps, clubs, loading, error } = useMPs();
  const [search, setSearch] = useState('');
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('votes');

  const filteredMPs = useMemo(() => {
    let result = [...mps];

    // Filter by active status
    if (!showInactive) {
      result = result.filter(mp => mp.active);
    }

    // Filter by club
    if (selectedClub) {
      result = result.filter(mp => mp.club === selectedClub);
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(mp =>
        mp.firstLastName.toLowerCase().includes(searchLower) ||
        mp.districtName.toLowerCase().includes(searchLower) ||
        mp.voivodeship.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.lastName.localeCompare(b.lastName, 'pl'));
        break;
      case 'votes':
        result.sort((a, b) => (b.numberOfVotes || 0) - (a.numberOfVotes || 0));
        break;
      case 'club':
        result.sort((a, b) => a.club.localeCompare(b.club));
        break;
      case 'voivodeship':
        result.sort((a, b) => a.voivodeship.localeCompare(b.voivodeship, 'pl'));
        break;
    }

    return result;
  }, [mps, search, selectedClub, showInactive, sortBy]);

  if (error) {
    return <SejmApiError message={error.message} />;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-surface animate-pulse rounded-lg" />
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-1">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-surface animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-content-heading">{t('mpsPage.title')}</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center p-3 bg-surface rounded-lg">
        <input
          type="text"
          placeholder={t('mpsPage.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-divider rounded-md focus:outline-none focus:ring-2 focus:ring-divider"
        />

        <select
          value={selectedClub || ''}
          onChange={(e) => setSelectedClub(e.target.value || null)}
          className="px-3 py-2 text-sm border border-divider rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-divider"
        >
          <option value="">{t('mpsPage.allClubs')}</option>
          {clubs.map((club) => (
            <option key={club} value={club}>{club}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="px-3 py-2 text-sm border border-divider rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-divider"
        >
          <option value="votes">{t('mpsPage.sortByVotes')}</option>
          <option value="name">{t('mpsPage.sortByName')}</option>
          <option value="club">{t('mpsPage.sortByClub')}</option>
          <option value="voivodeship">{t('mpsPage.sortByVoivodeship')}</option>
        </select>

        <label className="flex items-center gap-2 text-sm text-content">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-divider"
          />
          {t('mpsPage.showInactive')}
        </label>
      </div>

      {/* Results count */}
      <p className="text-sm text-content-subtle">
        {t('mpsPage.found', { count: filteredMPs.length })}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-1">
        {filteredMPs.map((mp) => (
          <MPCard key={mp.id} mp={mp} />
        ))}
      </div>

      {filteredMPs.length === 0 && (
        <p className="text-center text-content-subtle py-8">
          {t('mpsPage.noResults')}
        </p>
      )}
    </div>
  );
}
