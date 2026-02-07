import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { LocalizedLink } from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useArchiveEvents } from '../../hooks/useArchiveEvents';
import { useDocumentHead } from '../../hooks/useDocumentHead';
import { LiveTimeAgo } from '../../components/common/LiveTimeAgo';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { eventPath } from '../../utils/slug';

export function CategoryArchivePage() {
  const { t } = useTranslation('common');
  const { category } = useParams<{ category: string }>();
  const decodedCategory = category ? decodeURIComponent(category) : '';

  const { events, loading, error } = useArchiveEvents({ limit: 500 });

  // Filter events by category (case-insensitive)
  const { categoryEvents, translatedCategory } = useMemo(() => {
    const filtered = events.filter(
      (event) => event.category?.toLowerCase() === decodedCategory.toLowerCase()
    );
    // Use original category name from first event (with capital letter)
    const originalName = filtered[0]?.category || decodedCategory;
    // Translate category name for display
    const translated = t(`categories.${originalName}`, { defaultValue: originalName });
    return { categoryEvents: filtered, translatedCategory: translated };
  }, [events, decodedCategory, t]);

  // SEO
  useDocumentHead({
    title: t('archive.categoryArchiveTitle', { category: translatedCategory }),
    description: t('archive.categoryArchiveDescription', { category: translatedCategory }),
    ogTitle: t('archive.categoryArchiveTitle', { category: translatedCategory }),
    ogDescription: t('archive.browseAllEvents', { category: translatedCategory }),
  });

  // Loading state
  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="h-4 w-24 bg-surface rounded animate-pulse mb-3" />
          <div className="h-8 w-48 bg-divider rounded animate-pulse mb-2" />
          <div className="h-4 w-32 bg-surface rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-surface-alt border border-divider rounded-xl p-5 animate-pulse">
              <div className="h-3 w-24 bg-surface rounded mb-2" />
              <div className="h-5 w-full bg-divider rounded mb-2" />
              <div className="h-4 w-3/4 bg-surface rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-[1000px] mx-auto px-6 py-16">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-surface flex items-center justify-center">
            <i className="ri-error-warning-line text-2xl text-content-faint" />
          </div>
          <h1 className="text-xl font-medium text-content-heading mb-2">
            {t('archive.failedToLoad')}
          </h1>
          <p className="text-content mb-6">{error.message}</p>
          <LocalizedLink
            to="/archiwum"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <i className="ri-arrow-left-line" />
            {t('archive.backToArchive')}
          </LocalizedLink>
        </div>
      </div>
    );
  }

  // Empty state
  if (categoryEvents.length === 0) {
    return (
      <div className="max-w-[1000px] mx-auto px-6 py-16">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-surface flex items-center justify-center">
            <i className="ri-folder-open-line text-2xl text-content-faint" />
          </div>
          <h1 className="text-xl font-medium text-content-heading mb-2">
            {t('archive.noEventsInCategory', { category: translatedCategory })}
          </h1>
          <p className="text-content mb-6">{t('archive.noEventsFound')}</p>
          <LocalizedLink
            to="/archiwum"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <i className="ri-arrow-left-line" />
            {t('archive.backToArchive')}
          </LocalizedLink>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <LocalizedLink
          to="/archiwum"
          className="inline-flex items-center gap-1 text-sm text-content-subtle hover:text-content-heading transition-colors"
        >
          <i className="ri-arrow-left-s-line" />
          {t('archive.title')}
        </LocalizedLink>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-content-heading mb-1">{translatedCategory}</h1>
        <p className="text-content-subtle">
          {t('archive.eventsInArchive', { count: categoryEvents.length })}
        </p>
      </div>

      {/* Events list */}
      <motion.div
        className="space-y-3"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {categoryEvents.map((event) => (
          <motion.div key={event.id} variants={staggerItem}>
            <LocalizedLink
              to={eventPath(event)}
              className="block bg-surface-alt border border-divider rounded-xl p-5 hover:border-divider hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-2 text-xs mb-2">
                <LiveTimeAgo date={event.updatedAt} className="text-red-500" />
                <span className="text-content-faint">•</span>
                <span className="text-content-faint">
                  {event.sourceCount || event.sources?.length || 0}{' '}
                  {(event.sourceCount || event.sources?.length || 0) === 1 ? t('archive.source') : t('archive.sources')}
                </span>
              </div>
              <h2 className="text-base font-medium text-content-heading group-hover:text-content transition-colors mb-1">
                {event.title}
              </h2>
              {event.lead && (
                <p className="text-sm text-content-subtle line-clamp-2">
                  {event.lead}
                </p>
              )}
            </LocalizedLink>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
