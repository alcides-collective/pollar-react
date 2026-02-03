import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useArchiveEvents } from '../../hooks/useArchiveEvents';
import { useDocumentHead } from '../../hooks/useDocumentHead';
import { LiveTimeAgo } from '../../components/common/LiveTimeAgo';
import { staggerContainer, staggerItem } from '@/lib/animations';

export function CategoryArchivePage() {
  const { category } = useParams<{ category: string }>();
  const decodedCategory = category ? decodeURIComponent(category) : '';

  const { events, loading, error } = useArchiveEvents({ limit: 500 });

  // Filtruj eventy po kategorii
  const categoryEvents = useMemo(() => {
    return events.filter((event) => event.category === decodedCategory);
  }, [events, decodedCategory]);

  // SEO
  useDocumentHead({
    title: `${decodedCategory} - Archiwum`,
    description: `Archiwum wydarzeń z kategorii ${decodedCategory}`,
    ogTitle: `${decodedCategory} - Archiwum wydarzeń`,
    ogDescription: `Przeglądaj wszystkie wydarzenia z kategorii ${decodedCategory}`,
  });

  // Loading state
  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="h-4 w-24 bg-zinc-100 rounded animate-pulse mb-3" />
          <div className="h-8 w-48 bg-zinc-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-32 bg-zinc-100 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white border border-zinc-200 rounded-xl p-5 animate-pulse">
              <div className="h-3 w-24 bg-zinc-100 rounded mb-2" />
              <div className="h-5 w-full bg-zinc-200 rounded mb-2" />
              <div className="h-4 w-3/4 bg-zinc-100 rounded" />
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
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-zinc-100 flex items-center justify-center">
            <i className="ri-error-warning-line text-2xl text-zinc-400" />
          </div>
          <h1 className="text-xl font-medium text-zinc-900 mb-2">
            Nie udało się załadować archiwum
          </h1>
          <p className="text-zinc-600 mb-6">{error.message}</p>
          <Link
            to="/archiwum"
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <i className="ri-arrow-left-line" />
            Wróć do archiwum
          </Link>
        </div>
      </div>
    );
  }

  // Empty state
  if (categoryEvents.length === 0) {
    return (
      <div className="max-w-[1000px] mx-auto px-6 py-16">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-zinc-100 flex items-center justify-center">
            <i className="ri-folder-open-line text-2xl text-zinc-400" />
          </div>
          <h1 className="text-xl font-medium text-zinc-900 mb-2">
            Brak wydarzeń w kategorii "{decodedCategory}"
          </h1>
          <p className="text-zinc-600 mb-6">Nie znaleziono żadnych wydarzeń w tej kategorii.</p>
          <Link
            to="/archiwum"
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <i className="ri-arrow-left-line" />
            Wróć do archiwum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          to="/archiwum"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <i className="ri-arrow-left-s-line" />
          Archiwum
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-1">{decodedCategory}</h1>
        <p className="text-zinc-500">
          {categoryEvents.length} {categoryEvents.length === 1 ? 'wydarzenie' : 'wydarzeń'} w archiwum
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
            <Link
              to={`/event/${event.id}`}
              className="block bg-white border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-2 text-xs mb-2">
                <LiveTimeAgo date={event.updatedAt} className="text-red-500" />
                <span className="text-zinc-300">•</span>
                <span className="text-zinc-400">
                  {event.sourceCount || event.sources?.length || 0}{' '}
                  {(event.sourceCount || event.sources?.length || 0) === 1 ? 'źródło' : 'źródeł'}
                </span>
              </div>
              <h2 className="text-base font-medium text-zinc-900 group-hover:text-zinc-700 transition-colors mb-1">
                {event.title}
              </h2>
              {event.lead && (
                <p className="text-sm text-zinc-500 line-clamp-2">
                  {event.lead}
                </p>
              )}
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
