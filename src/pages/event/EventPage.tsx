import { useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LocalizedLink } from '@/components/LocalizedLink';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useEvent } from '../../hooks/useEvent';
import { useEvents } from '../../stores/eventsStore';
import { useDocumentHead } from '../../hooks/useDocumentHead';
import { useUser } from '../../stores/authStore';
import { useLanguage } from '../../stores/languageStore';
import { useReadHistoryStore } from '../../stores/readHistoryStore';
import { useViewTracking } from '../../hooks/useViewTracking';
import { useWikipediaImages } from '../../hooks/useWikipediaImages';
import { prepareOgDescription } from '../../utils/text';
import { staggerContainer, staggerItem, fadeInUp } from '../../lib/animations';
import { Skeleton } from '../../components/ui/skeleton';
import { EventHeader } from './EventHeader';
import { EventKeyPoints } from './EventKeyPoints';
import { EventSummary } from './EventSummary';
import { EventSidebar } from './EventSidebar';
import { EventNavigation } from './EventNavigation';
import { CcAttribution } from '../../components/common/CcAttribution';

export function EventPage() {
  const { t } = useTranslation('event');
  const language = useLanguage();
  const { id } = useParams<{ id: string }>();
  const { event, loading, error } = useEvent(id);
  const { events: allEvents } = useEvents({ limit: 100, lang: language });
  const user = useUser();

  // View tracking - for all users (logged in and anonymous)
  const { viewCount } = useViewTracking(id, {
    initialViewCount: event?.viewCount || 0,
    category: event?.category || '',
    disabled: loading || !!error,
  });

  // Wikipedia images for mentioned people
  const wikipediaImages = useWikipediaImages(event?.metadata?.mentionedPeople);

  // SEO meta tags — prefer backend seo fields, fall back to existing logic
  const seo = event?.metadata?.seo;
  const pageTitle = seo?.metaTitle || event?.metadata?.ultraShortHeadline || event?.title || '';
  const fullTitle = event?.title || '';
  const ogDescription = seo?.ogDescription || prepareOgDescription(
    event?.metadata?.keyPoints?.[0]?.description || event?.summary
  );
  const metaDescription = seo?.metaDescription || ogDescription;
  useDocumentHead({
    title: pageTitle,
    description: metaDescription,
    ogTitle: pageTitle,
    ogDescription,
    ogImageTitle: fullTitle,
    ogImageType: 'event',
    ogType: 'article',
    keywords: seo?.keywords,
  });

  // Mark event as read in user's history
  useEffect(() => {
    if (user?.uid && id && event && !loading) {
      useReadHistoryStore.getState().markAsRead(user.uid, id);
    }
  }, [user?.uid, id, event, loading]);

  // Find previous and next events
  const { previousEvent, nextEvent } = useMemo(() => {
    if (!event || allEvents.length === 0) {
      return { previousEvent: null, nextEvent: null };
    }
    const currentIndex = allEvents.findIndex(e => e.id === event.id);
    if (currentIndex === -1) {
      return { previousEvent: null, nextEvent: null };
    }
    return {
      previousEvent: currentIndex > 0 ? allEvents[currentIndex - 1] : null,
      nextEvent: currentIndex < allEvents.length - 1 ? allEvents[currentIndex + 1] : null,
    };
  }, [event, allEvents]);

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto">
        {/* Two-column layout */}
        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8">
          {/* Left column - main content */}
          <div>
            {/* EventHeader skeleton */}
            <div className="px-6 pt-8 pb-6">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-1">
                  <Skeleton className="h-9 w-full mb-2" />
                  <Skeleton className="h-9 w-3/4" />
                </div>
                <div className="flex gap-2 shrink-0">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-4/5" />
            </div>

            {/* EventKeyPoints skeleton */}
            <div className="px-6 py-6 border-t border-zinc-200">
              <Skeleton className="h-3 w-28 mb-4" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-2/5 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* EventSummary skeleton */}
            <div className="px-6 py-6 border-t border-zinc-200">
              <Skeleton className="h-3 w-24 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            {/* EventNavigation skeleton */}
            <div className="px-6 py-6 border-t border-zinc-200">
              <div className="flex gap-3">
                <Skeleton className="flex-1 h-24" />
                <Skeleton className="flex-1 h-24" />
              </div>
            </div>
          </div>

          {/* Right column - sidebar */}
          <div className="py-6 lg:py-8 space-y-6">
            {/* Map placeholder */}
            <div className="px-6 lg:px-0">
              <Skeleton className="h-48" />
            </div>
            {/* Sources skeleton */}
            <div className="px-6 lg:px-0">
              <Skeleton className="h-3 w-20 mb-3" />
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-zinc-100 flex items-center justify-center">
            <i className="ri-error-warning-line text-2xl text-zinc-400" />
          </div>
          <h1 className="text-xl font-medium text-zinc-900 mb-2">
            {t('error.title')}
          </h1>
          <p className="text-zinc-600 mb-6">
            {t('error.description')}
          </p>
          <LocalizedLink
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <i className="ri-arrow-left-line" />
            {t('error.backHome')}
          </LocalizedLink>
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <motion.div
      className="max-w-[1200px] mx-auto"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Two-column layout */}
      <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8">
        {/* Left column - main content */}
        <motion.div variants={staggerContainer}>
          <motion.div variants={staggerItem}>
            <EventHeader event={event} viewCount={viewCount} />
          </motion.div>
          <motion.div variants={staggerItem}>
            <EventKeyPoints keyPoints={event.metadata?.keyPoints || []} />
          </motion.div>
          <motion.div variants={staggerItem}>
            <EventSummary summary={event.summary} wikipediaImages={wikipediaImages} />
          </motion.div>
          <motion.div variants={staggerItem}>
            <EventNavigation previousEvent={previousEvent} nextEvent={nextEvent} />
          </motion.div>
          <motion.div variants={staggerItem} className="px-6">
            <CcAttribution />
          </motion.div>
        </motion.div>

        {/* Right column - sidebar */}
        <motion.div
          className="py-6 lg:py-8"
          {...fadeInUp}
          transition={{ ...fadeInUp.transition, delay: 0.2 }}
        >
          <EventSidebar event={event} wikipediaImages={wikipediaImages} />
        </motion.div>
      </div>

      {/* Debug info - DEV only */}
      {import.meta.env.DEV && (
        <div className="mt-8 mx-6 p-4 bg-zinc-100 rounded-lg font-mono text-xs text-zinc-600">
          <p className="font-semibold mb-2">Debug Info:</p>
          <p>trendingScore: <span className="text-zinc-900">{event.trendingScore}</span></p>
          <p>sourceCount: <span className="text-zinc-900">{event.sourceCount}</span></p>
          <p>articleCount: <span className="text-zinc-900">{event.articleCount}</span></p>
          <p>viewCount: <span className="text-zinc-900">{event.viewCount}</span></p>
          <p>freshnessLevel: <span className="text-zinc-900">{event.freshnessLevel}</span></p>
          <p>category: <span className="text-zinc-900">{event.category}</span></p>
          <p className="mt-2">summary (raw):</p>
          <pre className="text-zinc-900 whitespace-pre-wrap text-[10px] mt-1 max-h-40 overflow-auto">{event.summary}</pre>
          <p className="font-semibold mt-3 mb-1">SEO: {event.metadata?.seo ? '' : <span className="text-orange-500 font-normal">brak (event sprzed deploy)</span>}</p>
          {event.metadata?.seo && (
            <>
              <p>metaTitle: <span className="text-zinc-900">{event.metadata.seo.metaTitle}</span></p>
              <p>metaDescription: <span className="text-zinc-900">{event.metadata.seo.metaDescription}</span></p>
              <p>ogDescription: <span className="text-zinc-900">{event.metadata.seo.ogDescription}</span></p>
              <p>keywords: <span className="text-zinc-900">{event.metadata.seo.keywords?.join(', ')}</span></p>
              <p>hashtags: <span className="text-zinc-900">{event.metadata.seo.hashtags?.map(h => `#${h}`).join(' ')}</span></p>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
