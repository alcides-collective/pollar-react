import { Link } from 'react-router-dom';
import { useBrief } from '../../hooks/useBrief';
import {
  BriefHero,
  BriefExecutiveSummary,
  BriefWordOfTheDay,
  BriefSections,
  BriefInsights,
  BriefMentions,
} from '../../components/brief';

export function BriefPage() {
  const { brief, loading, error } = useBrief({ lang: 'pl' });

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto px-6 py-8">
        <div className="animate-pulse">
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

          {/* Two column skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <div className="space-y-3">
              <div className="h-4 w-24 bg-zinc-200 rounded" />
              <div className="h-4 w-full bg-zinc-200 rounded" />
              <div className="h-4 w-full bg-zinc-200 rounded" />
              <div className="h-4 w-3/4 bg-zinc-200 rounded" />
            </div>
            <div className="p-5 rounded-lg border border-zinc-200">
              <div className="h-4 w-20 bg-zinc-200 rounded mb-4" />
              <div className="h-8 w-32 bg-zinc-200 rounded mb-2" />
              <div className="h-4 w-48 bg-zinc-200 rounded mb-4" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-zinc-200 rounded" />
                <div className="h-4 w-full bg-zinc-200 rounded" />
              </div>
            </div>
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
      <div className="max-w-[1000px] mx-auto px-6 py-16">
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
    <div className="max-w-[1000px] mx-auto px-6 py-8">
      <BriefHero brief={brief} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <BriefExecutiveSummary summary={brief.executiveSummary} />
        {brief.wordOfTheDay && <BriefWordOfTheDay word={brief.wordOfTheDay} />}
      </div>

      <BriefSections sections={brief.sections} />
      <BriefInsights insights={brief.insights} />
      <BriefMentions
        people={brief.mentionedPeople}
        organizations={brief.mentionedOrganizations}
      />
    </div>
  );
}
