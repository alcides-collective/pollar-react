import { useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { LocalizedLink } from '@/components/LocalizedLink';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useEvent } from '../../hooks/useEvent';
import { useEvents } from '../../stores/eventsStore';
import { useDocumentHead } from '../../hooks/useDocumentHead';
import { useUser } from '../../stores/authStore';
import { useRouteLanguage } from '../../hooks/useRouteLanguage';
import { useReadHistoryStore } from '../../stores/readHistoryStore';
import { useViewTracking } from '../../hooks/useViewTracking';
import { useWikipediaImages } from '../../hooks/useWikipediaImages';
import { prepareOgDescription } from '../../utils/text';
import { createSlug } from '../../utils/slug';
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
  const language = useRouteLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { id, slug } = useParams<{ id: string; slug?: string }>();
  const { event, loading, error, isTranslated } = useEvent(id);
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

  // Correct slug to match current language (like Wikipedia canonical redirect)
  useEffect(() => {
    if (!event || loading) return;
    const correctSlug = createSlug(event.metadata?.ultraShortHeadline || event.title);
    if (!correctSlug || correctSlug === slug) return;
    const prefix = language !== 'pl' ? `/${language}` : '';
    navigate(`${prefix}/event/${event.id}/${correctSlug}`, { replace: true });
  }, [event, loading, slug, language, navigate]);

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
            <div className="px-6 py-6 border-t border-divider">
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
            <div className="px-6 py-6 border-t border-divider">
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
            <div className="px-6 py-6 border-t border-divider">
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
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-surface flex items-center justify-center">
            <i className="ri-error-warning-line text-2xl text-content-faint" />
          </div>
          <h1 className="text-xl font-medium text-content-heading mb-2">
            {t('error.title')}
          </h1>
          <p className="text-content mb-6">
            {t('error.description')}
          </p>
          <LocalizedLink
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
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
      {/* Untranslated event banner */}
      {!isTranslated && language !== 'pl' && (
        <motion.div
          variants={staggerItem}
          className="mx-6 mt-6 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4"
        >
          <div className="flex items-start gap-3">
            <i className="ri-translate-2 text-xl text-amber-500 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-content-heading text-sm">
                {t('untranslated.title')}
              </p>
              <p className="text-content text-sm mt-1">
                {t('untranslated.description')}
              </p>
              <div className="flex flex-wrap gap-3 mt-3">
                <LocalizedLink
                  to="/"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-surface hover:bg-surface-hover transition-colors text-content"
                >
                  <i className="ri-arrow-left-line text-xs" />
                  {t('untranslated.backHome')}
                </LocalizedLink>
                <button
                  onClick={() => navigate(location.pathname.replace(/^\/(en|de)/, ''), { replace: true })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <i className="ri-book-read-line text-xs" />
                  {t('untranslated.readInPolish')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

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
        <div className="mt-8 mx-6 p-4 bg-surface rounded-lg font-mono text-xs text-content">
          <p className="font-semibold mb-2">Debug Info:</p>
          <p>trendingScore: <span className="text-content-heading">{event.trendingScore}</span></p>
          <p>sourceCount: <span className="text-content-heading">{event.sourceCount}</span></p>
          <p>articleCount: <span className="text-content-heading">{event.articleCount}</span></p>
          <p>viewCount: <span className="text-content-heading">{event.viewCount}</span></p>
          <p>freshnessLevel: <span className="text-content-heading">{event.freshnessLevel}</span></p>
          <p>category: <span className="text-content-heading">{event.category}</span></p>
          <p className="mt-2">summary (raw):</p>
          <pre className="text-content-heading whitespace-pre-wrap text-[10px] mt-1 max-h-40 overflow-auto">{event.summary}</pre>
          <p className="font-semibold mt-3 mb-1">SEO: {event.metadata?.seo ? '' : <span className="text-orange-500 font-normal">brak (event sprzed deploy)</span>}</p>
          {event.metadata?.seo && (
            <>
              <p>metaTitle: <span className="text-content-heading">{event.metadata.seo.metaTitle}</span></p>
              <p>metaDescription: <span className="text-content-heading">{event.metadata.seo.metaDescription}</span></p>
              <p>ogDescription: <span className="text-content-heading">{event.metadata.seo.ogDescription}</span></p>
              <p>keywords: <span className="text-content-heading">{event.metadata.seo.keywords?.join(', ')}</span></p>
              <p>hashtags: <span className="text-content-heading">{event.metadata.seo.hashtags?.map(h => `#${h}`).join(' ')}</span></p>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
