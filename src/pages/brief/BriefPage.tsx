import { Link } from 'react-router-dom';
import { useBrief } from '../../hooks/useBrief';
import { useActiveSection } from '../../hooks/useActiveSection';
import { useDocumentHead } from '../../hooks/useDocumentHead';
import { prepareOgDescription } from '../../utils/text';
import {
  BriefHero,
  BriefExecutiveSummary,
  BriefSections,
  BriefInsights,
  BriefMentions,
  BriefSidebar,
} from '../../components/brief';

export function BriefPage() {
  const { brief, loading, error } = useBrief({ lang: 'pl' });
  const { activeItem: activeSection, setSectionRef } = useActiveSection(
    brief?.sections ?? []
  );

  // SEO meta tags
  const formattedDate = brief?.date
    ? new Date(brief.date).toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';
  const ogTitle = brief ? `Daily Brief – ${formattedDate}` : 'Daily Brief';
  const ogDescription = prepareOgDescription(brief?.lead || brief?.executiveSummary);
  useDocumentHead({
    title: ogTitle,
    description: ogDescription,
    ogTitle,
    ogDescription,
    ogType: 'article',
  });

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="animate-pulse">
          <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-8">
            {/* Left column skeleton */}
            <div>
              {/* Header skeleton */}
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
                <div className="h-10 w-40 bg-zinc-200 rounded" />
              </div>

              {/* Summary skeleton */}
              <div className="mb-10 space-y-3">
                <div className="h-4 w-24 bg-zinc-200 rounded" />
                <div className="h-4 w-full bg-zinc-200 rounded" />
                <div className="h-4 w-full bg-zinc-200 rounded" />
                <div className="h-4 w-3/4 bg-zinc-200 rounded" />
              </div>

              {/* Sections skeleton */}
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-5 rounded-lg border border-zinc-200">
                    <div className="h-6 w-2/3 bg-zinc-200 rounded mb-4" />
                    <div className="h-4 w-full bg-zinc-200 rounded mb-2" />
                    <div className="h-4 w-full bg-zinc-200 rounded mb-2" />
                    <div className="h-4 w-3/4 bg-zinc-200 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right column skeleton (desktop only) */}
            <div className="hidden lg:block">
              <div className="space-y-4">
                <div className="h-48 bg-zinc-200 rounded-xl" />
                <div className="h-64 bg-zinc-200 rounded-xl" />
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
            Nie udało się załadować briefu
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

  if (!brief) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-zinc-100 flex items-center justify-center">
            <i className="ri-file-text-line text-2xl text-zinc-400" />
          </div>
          <h1 className="text-xl font-medium text-zinc-900 mb-2">
            Brak briefu na dzisiaj
          </h1>
          <p className="text-zinc-600 mb-6">
            Daily Brief nie został jeszcze wygenerowany.
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

  return (
    <div className="max-w-[1200px] mx-auto px-6">
      {/* Two-column layout */}
      <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-8">
        {/* Left column - main content */}
        <div className="py-8">
          <BriefHero brief={brief} />
          <BriefExecutiveSummary summary={brief.executiveSummary} />
          <BriefSections sections={brief.sections} setSectionRef={setSectionRef} />
          <BriefInsights insights={brief.insights} />
          <BriefMentions
            people={brief.mentionedPeople}
            organizations={brief.mentionedOrganizations}
          />

          {/* Mobile: Word of the Day */}
          {brief.wordOfTheDay && (
            <section className="lg:hidden mt-10 pt-8 border-t border-zinc-200">
              <h2 className="text-sm text-zinc-500 mb-4 font-medium flex items-center gap-2">
                <i className="ri-book-2-line" />
                Słowo dnia
              </h2>
              <div className="p-4 rounded-xl border border-zinc-200 bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
                <div className="mb-3">
                  <span className="text-xl font-medium text-zinc-900">{brief.wordOfTheDay.word}</span>
                  <span className="block text-xs italic text-zinc-500 mt-0.5">
                    {brief.wordOfTheDay.etymology}
                  </span>
                </div>
                <p className="text-sm text-zinc-700 leading-relaxed">
                  {brief.wordOfTheDay.encyclopedicDefinition}
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Right column - sidebar (desktop only) */}
        <div className="hidden lg:block py-8">
          <BriefSidebar
            wordOfTheDay={brief.wordOfTheDay}
            activeSection={activeSection}
          />
        </div>
      </div>
    </div>
  );
}
