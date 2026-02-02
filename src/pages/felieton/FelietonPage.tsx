import { Link, useParams } from 'react-router-dom';
import { useFelieton } from '../../hooks/useFelieton';
import { FELIETON_CATEGORY_NAMES } from '../../types/felieton';
import { preventWidows, sanitizeAndProcessHtml } from '../../utils/text';
import ekonomiaImg from '../../assets/images/felietony/ekonomia.png';
import geopolitykaImg from '../../assets/images/felietony/geopolityka.png';
import polskaPolitykImg from '../../assets/images/felietony/polska-polityka.png';
import type { FelietonCategory } from '../../types/felieton';

const FELIETON_IMAGES: Record<FelietonCategory, string> = {
  'ekonomia': ekonomiaImg,
  'geopolityka': geopolitykaImg,
  'polska-polityka': polskaPolitykImg,
};

export function FelietonPage() {
  const { id } = useParams<{ id: string }>();
  const { felieton, loading, error } = useFelieton(id);

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto px-6 py-8">
        <div className="animate-pulse">
          <div className="mb-14">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-4 w-24 bg-zinc-200 rounded" />
              <div className="flex-1 h-px bg-zinc-200" />
              <div className="h-4 w-32 bg-zinc-200 rounded" />
            </div>
            <div className="h-12 w-3/4 bg-zinc-200 rounded mb-3" />
            <div className="h-12 w-1/2 bg-zinc-200 rounded mb-5" />
            <div className="h-6 w-full bg-zinc-200 rounded mb-2" />
            <div className="h-6 w-4/5 bg-zinc-200 rounded mb-6" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 w-full bg-zinc-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1000px] mx-auto px-6 py-16">
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
      <div className="max-w-[1000px] mx-auto px-6 py-16">
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
    <div className="max-w-[1000px] mx-auto px-6 py-8">
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
      <article className="mb-10">
        <div
          className="prose prose-zinc prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizeAndProcessHtml(felieton.content) }}
        />
      </article>

      {/* Source Events */}
      {felieton.sourceEvents && felieton.sourceEvents.length > 0 && (
        <section className="border-t border-zinc-200 pt-8">
          <h2 className="text-sm text-zinc-500 mb-4 pb-2 border-b border-zinc-200 font-medium">
            Wydarzenia źródłowe
          </h2>
          <ul className="space-y-2">
            {felieton.sourceEvents.map((event) => (
              <li key={event.id}>
                <Link
                  to={`/event/${event.id}`}
                  className="text-zinc-600 hover:text-zinc-900 hover:underline transition-colors"
                >
                  {event.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
