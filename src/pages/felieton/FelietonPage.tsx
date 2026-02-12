import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LocalizedLink } from '@/components/LocalizedLink';
import { useFelieton } from '../../hooks/useFelieton';
import { trackFelietonViewed } from '../../lib/analytics';
import { useDocumentHead } from '../../hooks/useDocumentHead';
import { FELIETON_CATEGORY_NAMES } from '../../types/felieton';
import { sanitizeAndProcessHtml, prepareOgDescription } from '../../utils/text';
import { useRouteLanguage } from '../../hooks/useRouteLanguage';
import { GrainImage } from '../../components/common/GrainImage';
import ekonomiaImg from '../../assets/images/felietony/ekonomia.webp';
import geopolitykaImg from '../../assets/images/felietony/geopolityka.webp';
import polskaPolitykImg from '../../assets/images/felietony/polska-polityka.webp';
import { CcAttribution } from '../../components/common/CcAttribution';
import type { FelietonCategory, SourceEvent } from '../../types/felieton';
import { eventPath } from '../../utils/slug';

const FELIETON_IMAGES: Record<FelietonCategory, string> = {
  'ekonomia': ekonomiaImg,
  'geopolityka': geopolitykaImg,
  'polska-polityka': polskaPolitykImg,
};

function SourceEventCard({ event }: { event: SourceEvent }) {
  // Handle both new format (createdAt) and old format (date) for backward compatibility
  const dateValue = event.createdAt || (
    typeof event.date === 'string'
      ? event.date
      : event.date?._seconds
        ? new Date(event.date._seconds * 1000).toISOString()
        : new Date().toISOString()
  );
  const date = new Date(dateValue);

  const formattedDate = date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const firstKeyPoint = event.metadata?.keyPoints?.[0];

  return (
    <LocalizedLink
      to={eventPath(event)}
      className="block p-4 bg-surface hover:bg-muted rounded-lg transition-colors group"
    >
      <p className="text-sm font-medium text-content-heading group-hover:text-content mb-1">
        {event.metadata?.ultraShortHeadline || event.title}
      </p>
      {firstKeyPoint?.description && (
        <p className="text-xs text-content line-clamp-3 mb-2">
          {firstKeyPoint.description.replace(/<[^>]*>/g, '')}
        </p>
      )}
      <p className="text-xs text-content-faint">{formattedDate}</p>
    </LocalizedLink>
  );
}

function FelietonSidebar({ sourceEvents }: { sourceEvents: SourceEvent[] }) {
  if (!sourceEvents || sourceEvents.length === 0) {
    return null;
  }

  return (
    <aside className="lg:sticky lg:top-6">
      <div className="bg-surface-alt rounded-xl border border-divider overflow-hidden">
        <div className="px-4 py-3 border-b border-divider bg-surface">
          <h2 className="text-sm font-semibold text-content-heading flex items-center gap-2">
            <i className="ri-links-line text-content-subtle" />
            Wydarzenia źródłowe
          </h2>
          <p className="text-xs text-content-subtle mt-0.5">
            {sourceEvents.length} {sourceEvents.length === 1 ? 'wydarzenie' : sourceEvents.length < 5 ? 'wydarzenia' : 'wydarzeń'}
          </p>
        </div>
        <div className="p-3 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
          {sourceEvents.map((sourceEvent) => (
            <SourceEventCard key={sourceEvent.id} event={sourceEvent} />
          ))}
        </div>
      </div>
    </aside>
  );
}

export function FelietonPage() {
  const { id } = useParams<{ id: string }>();
  const { felieton, loading, error } = useFelieton(id);
  const lang = useRouteLanguage();

  useEffect(() => {
    if (felieton && id) trackFelietonViewed({ felieton_id: id, category: felieton.category });
  }, [felieton, id]);

  // SEO meta tags
  const fullTitle = felieton?.title || '';
  const ogDescription = prepareOgDescription(felieton?.lead);
  useDocumentHead({
    title: fullTitle,
    description: ogDescription,
    ogTitle: fullTitle, // Use full title for OG image
    ogDescription,
    ogImageType: 'felieton',
    ogType: 'article',
  });

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="animate-pulse">
          <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-8">
            <div>
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-4 w-24 bg-divider rounded" />
                  <div className="flex-1 h-px bg-divider" />
                  <div className="h-4 w-32 bg-divider rounded" />
                </div>
                <div className="h-12 w-3/4 bg-divider rounded mb-3" />
                <div className="h-12 w-1/2 bg-divider rounded mb-5" />
                <div className="h-6 w-full bg-divider rounded mb-2" />
                <div className="h-6 w-4/5 bg-divider rounded mb-6" />
                <div className="h-48 w-full bg-divider rounded-lg" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-4 w-full bg-divider rounded" />
                ))}
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="h-64 bg-divider rounded-xl" />
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
            Nie udało się załadować felietonu
          </h1>
          <p className="text-content mb-6">
            {error.message}
          </p>
          <LocalizedLink
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <i className="ri-arrow-left-line" />
            Wróć do strony głównej
          </LocalizedLink>
        </div>
      </div>
    );
  }

  if (!felieton) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-surface flex items-center justify-center">
            <i className="ri-file-text-line text-2xl text-content-faint" />
          </div>
          <h1 className="text-xl font-medium text-content-heading mb-2">
            Felieton nie został znaleziony
          </h1>
          <p className="text-content mb-6">
            Ten felieton nie istnieje lub został usunięty.
          </p>
          <LocalizedLink
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <i className="ri-arrow-left-line" />
            Wróć do strony głównej
          </LocalizedLink>
        </div>
      </div>
    );
  }

  const categoryName = FELIETON_CATEGORY_NAMES[felieton.category];
  const imageSrc = FELIETON_IMAGES[felieton.category];
  const formattedDate = new Date(felieton.date).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const editionLabel = felieton.edition === 'morning' ? 'Wydanie poranne' : 'Wydanie wieczorne';

  return (
    <div className="max-w-[1200px] mx-auto px-6">
      {/* Two-column layout */}
      <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-8">
        {/* Left column - main content */}
        <div className="py-8">
          {/* Hero */}
          <header className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm text-sky-600 font-medium">{categoryName}</span>
              <span className="flex-1 h-px bg-divider" />
              <span className="text-sm text-content-subtle font-medium">{formattedDate} · {editionLabel}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-medium text-content-heading mb-5 leading-tight tracking-tight">
              {felieton.title}
            </h1>

            <p className="text-lg md:text-xl text-content mb-6 leading-relaxed">
              {felieton.lead}
            </p>

            <GrainImage
              src={imageSrc}
              className="w-full aspect-[21/9] object-cover rounded-lg"
            />
          </header>

          {/* Content */}
          <article>
            <div
              className="prose prose-zinc prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeAndProcessHtml(felieton.content, lang) }}
            />
          </article>

          <CcAttribution />

          {/* Mobile: Source Events */}
          {felieton.sourceEvents && felieton.sourceEvents.length > 0 && (
            <section className="lg:hidden mt-10 pt-8 border-t border-divider">
              <h2 className="text-sm font-semibold text-content-heading mb-4 flex items-center gap-2">
                <i className="ri-links-line text-content-subtle" />
                Wydarzenia źródłowe
              </h2>
              <div className="space-y-2">
                {felieton.sourceEvents.map((sourceEvent) => (
                  <SourceEventCard key={sourceEvent.id} event={sourceEvent} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right column - sidebar (desktop only) */}
        <div className="hidden lg:block py-8">
          <FelietonSidebar sourceEvents={felieton.sourceEvents} />
        </div>
      </div>
    </div>
  );
}
