import { Link, useParams } from 'react-router-dom';
import { useFelieton } from '../../hooks/useFelieton';
import { useEvent } from '../../hooks/useEvent';
import { useDocumentHead } from '../../hooks/useDocumentHead';
import { FELIETON_CATEGORY_NAMES } from '../../types/felieton';
import { preventWidows, sanitizeAndProcessHtml, prepareOgDescription } from '../../utils/text';
import ekonomiaImg from '../../assets/images/felietony/ekonomia.png';
import geopolitykaImg from '../../assets/images/felietony/geopolityka.png';
import polskaPolitykImg from '../../assets/images/felietony/polska-polityka.png';
import type { FelietonCategory, SourceEvent } from '../../types/felieton';

const FELIETON_IMAGES: Record<FelietonCategory, string> = {
  'ekonomia': ekonomiaImg,
  'geopolityka': geopolitykaImg,
  'polska-polityka': polskaPolitykImg,
};

function SourceEventCard({ eventId }: { eventId: string }) {
  const { event, loading } = useEvent(eventId);

  if (loading) {
    return (
      <div className="p-4 bg-zinc-50 rounded-lg animate-pulse">
        <div className="h-4 w-3/4 bg-zinc-200 rounded mb-2" />
        <div className="h-3 w-full bg-zinc-200 rounded mb-2" />
        <div className="h-3 w-16 bg-zinc-200 rounded" />
      </div>
    );
  }

  if (!event) return null;

  const date = new Date(event.createdAt);

  const formattedDate = date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const firstKeyPoint = event.metadata?.keyPoints?.[0];

  return (
    <Link
      to={`/event/${event.id}`}
      className="block p-4 bg-zinc-50 hover:bg-zinc-100 rounded-lg transition-colors group"
    >
      <p className="text-sm font-medium text-zinc-900 group-hover:text-zinc-700 mb-1">
        {event.metadata?.ultraShortHeadline || event.title}
      </p>
      {firstKeyPoint?.description && (
        <p className="text-xs text-zinc-600 line-clamp-3 mb-2">
          {firstKeyPoint.description.replace(/<[^>]*>/g, '')}
        </p>
      )}
      <p className="text-xs text-zinc-400">{formattedDate}</p>
    </Link>
  );
}

function FelietonSidebar({ sourceEvents }: { sourceEvents: SourceEvent[] }) {
  if (!sourceEvents || sourceEvents.length === 0) {
    return null;
  }

  return (
    <aside className="lg:sticky lg:top-6">
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-200 bg-zinc-50">
          <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
            <i className="ri-links-line text-zinc-500" />
            Wydarzenia źródłowe
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {sourceEvents.length} {sourceEvents.length === 1 ? 'wydarzenie' : sourceEvents.length < 5 ? 'wydarzenia' : 'wydarzeń'}
          </p>
        </div>
        <div className="p-3 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
          {sourceEvents.map((event) => (
            <SourceEventCard key={event.id} eventId={event.id} />
          ))}
        </div>
      </div>
    </aside>
  );
}

export function FelietonPage() {
  const { id } = useParams<{ id: string }>();
  const { felieton, loading, error } = useFelieton(id);

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
                  <div className="h-4 w-24 bg-zinc-200 rounded" />
                  <div className="flex-1 h-px bg-zinc-200" />
                  <div className="h-4 w-32 bg-zinc-200 rounded" />
                </div>
                <div className="h-12 w-3/4 bg-zinc-200 rounded mb-3" />
                <div className="h-12 w-1/2 bg-zinc-200 rounded mb-5" />
                <div className="h-6 w-full bg-zinc-200 rounded mb-2" />
                <div className="h-6 w-4/5 bg-zinc-200 rounded mb-6" />
                <div className="h-48 w-full bg-zinc-200 rounded-lg" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-4 w-full bg-zinc-200 rounded" />
                ))}
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="h-64 bg-zinc-200 rounded-xl" />
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
            Nie udało się załadować felietonu
          </h1>
          <p className="text-zinc-600 mb-6">
            {error.message}
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

  if (!felieton) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-zinc-100 flex items-center justify-center">
            <i className="ri-file-text-line text-2xl text-zinc-400" />
          </div>
          <h1 className="text-xl font-medium text-zinc-900 mb-2">
            Felieton nie został znaleziony
          </h1>
          <p className="text-zinc-600 mb-6">
            Ten felieton nie istnieje lub został usunięty.
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
              <span className="flex-1 h-px bg-zinc-200" />
              <span className="text-sm text-zinc-500 font-medium">{formattedDate} · {editionLabel}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-medium text-zinc-900 mb-5 leading-tight tracking-tight">
              {preventWidows(felieton.title)}
            </h1>

            <p className="text-lg md:text-xl text-zinc-600 mb-6 leading-relaxed">
              {felieton.lead}
            </p>

            <img
              src={imageSrc}
              alt=""
              className="w-full aspect-[21/9] object-cover rounded-lg"
            />
          </header>

          {/* Content */}
          <article>
            <div
              className="prose prose-zinc prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeAndProcessHtml(felieton.content) }}
            />
          </article>

          {/* Mobile: Source Events */}
          {felieton.sourceEvents && felieton.sourceEvents.length > 0 && (
            <section className="lg:hidden mt-10 pt-8 border-t border-zinc-200">
              <h2 className="text-sm font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                <i className="ri-links-line text-zinc-500" />
                Wydarzenia źródłowe
              </h2>
              <div className="space-y-2">
                {felieton.sourceEvents.map((event) => (
                  <SourceEventCard key={event.id} eventId={event.id} />
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
