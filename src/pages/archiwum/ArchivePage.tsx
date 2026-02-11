import { LocalizedLink } from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useArchiveEvents } from '../../hooks/useArchiveEvents';
import { useDocumentHead } from '../../hooks/useDocumentHead';
import { CategoryCard } from './CategoryCard';
import { staggerContainer, staggerItem } from '@/lib/animations';

export function ArchivePage() {
  const { t } = useTranslation('common');
  const { groupedByCategory, loading, error } = useArchiveEvents({ limit: 200 });

  // SEO
  useDocumentHead({
    title: t('seo.archiveTitle'),
    description: t('seo.archiveDescription'),
    ogTitle: t('seo.archiveTitle'),
    ogDescription: t('seo.archiveAllEvents'),
  });

  // Loading state
  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="h-8 w-48 bg-divider rounded animate-pulse mb-2" />
          <div className="h-4 w-96 bg-surface rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-background border border-divider rounded-xl p-5 h-64 animate-pulse">
              <div className="h-5 w-24 bg-divider rounded mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j}>
                    <div className="h-3 w-16 bg-surface rounded mb-1" />
                    <div className="h-4 w-full bg-surface rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && groupedByCategory.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-surface flex items-center justify-center">
            <i className="ri-error-warning-line text-2xl text-content-faint" />
          </div>
          <h1 className="text-xl font-medium text-content-heading mb-2">
            {t('archive.failedToLoad')}
          </h1>
          <p className="text-content mb-6">{error.message}</p>
          <LocalizedLink
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <i className="ri-arrow-left-line" />
            {t('actions.backToHome')}
          </LocalizedLink>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <i className="ri-archive-line text-2xl text-content-faint" />
          <h1 className="text-2xl font-bold text-content-heading">{t('archive.title')}</h1>
        </div>
        <p className="text-content-subtle">
          {t('archive.subtitle')}
        </p>
      </div>

      {/* Grid 5 kolumn x 2 rzedy */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {groupedByCategory.map((group) => (
          <motion.div key={group.category} variants={staggerItem}>
            <CategoryCard
              category={group.category}
              events={group.events}
              maxEvents={5}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
