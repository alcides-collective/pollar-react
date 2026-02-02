import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEvent } from '../../hooks/useEvent';
import { useEvents } from '../../stores/eventsStore';
import { useDocumentHead } from '../../hooks/useDocumentHead';
import { prepareOgTitle, prepareOgDescription } from '../../utils/text';
import { EventHeader } from './EventHeader';
import { EventKeyPoints } from './EventKeyPoints';
import { EventSummary } from './EventSummary';
import { EventSidebar } from './EventSidebar';
import { EventNavigation } from './EventNavigation';

export function EventPage() {
  const { id } = useParams<{ id: string }>();
  const { event, loading, error } = useEvent(id);
  const { events: allEvents } = useEvents({ limit: 100, lang: 'pl' });

  // SEO meta tags
  const pageTitle = event?.metadata?.ultraShortHeadline || event?.title || '';
  const ogImageTitle = event?.title || ''; // Full title for OG image
  const ogTitle = prepareOgTitle(pageTitle);
  const ogDescription = prepareOgDescription(
    event?.metadata?.keyPoints?.[0]?.description || event?.summary
  );
  useDocumentHead({
    title: pageTitle,
    description: ogDescription,
    ogTitle: ogImageTitle, // Use full title for OG image
    ogDescription,
    ogImageType: 'event',
    ogType: 'article',
  });

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
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-4 w-20 bg-zinc-200 rounded" />
              <div className="h-4 w-32 bg-zinc-200 rounded" />
            </div>
            <div className="h-10 w-3/4 bg-zinc-200 rounded mb-3" />
            <div className="h-10 w-1/2 bg-zinc-200 rounded mb-4" />
            <div className="h-6 w-full bg-zinc-200 rounded mb-2" />
            <div className="h-6 w-4/5 bg-zinc-200 rounded" />
          </div>

          {/* Two column skeleton */}
          <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8">
            <div className="space-y-4">
              <div className="h-4 w-24 bg-zinc-200 rounded" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-6 w-6 bg-zinc-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-5 w-1/3 bg-zinc-200 rounded mb-2" />
                    <div className="h-4 w-full bg-zinc-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden lg:block">
              <div className="h-64 bg-zinc-200 rounded-lg" />
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
            Nie znaleziono wydarzenia
          </h1>
          <p className="text-zinc-600 mb-6">
            To wydarzenie nie istnieje lub zostało usunięte.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <i className="ri-arrow-left-line" />
            Wróć do strony głównej
          </Link>
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Two-column layout */}
      <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8">
        {/* Left column - main content */}
        <div>
          <EventHeader event={event} />
          <EventKeyPoints keyPoints={event.metadata?.keyPoints || []} />
          <EventSummary summary={event.summary} />
          <EventNavigation previousEvent={previousEvent} nextEvent={nextEvent} />
        </div>

        {/* Right column - sidebar */}
        <div className="py-6 lg:py-8">
          <EventSidebar event={event} />
        </div>
      </div>
    </div>
  );
}
