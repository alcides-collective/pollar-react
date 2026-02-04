import { useTranslation } from 'react-i18next';
import { useGieldaData } from '../../hooks/useGieldaData';
import { IndexCard } from '../../components/gielda';
import { Skeleton } from '../../components/ui/skeleton';

export function IndicesPage() {
  const { t } = useTranslation('gielda');
  const { indices, loading, polishIndices, globalIndices } = useGieldaData();

  return (
    <div className="indices-page">
      <header className="page-header mb-6">
        <h1 className="text-2xl font-semibold text-black dark:text-white mb-1">{t('indicesPage.title')}</h1>
        <p className="text-sm text-black/50 dark:text-white/50">
          {t('indicesPage.subtitle')}
        </p>
      </header>

      {loading && indices.length === 0 ? (
        <div className="space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Polish Indices */}
          <section className="mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-black/60 dark:text-white/60 mb-4">
              {t('polishIndices')}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {polishIndices.map(index => (
                <IndexCard key={index.symbol} index={index} large />
              ))}
            </div>
          </section>

          {/* Global Indices */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-black/60 dark:text-white/60 mb-4">
              {t('globalIndices')}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {globalIndices.map(index => (
                <IndexCard key={index.symbol} index={index} large />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
