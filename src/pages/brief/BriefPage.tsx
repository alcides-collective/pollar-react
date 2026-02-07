import { LocalizedLink } from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import { useBrief } from '../../hooks/useBrief';
import { useActiveSection } from '../../hooks/useActiveSection';
import { useDocumentHead } from '../../hooks/useDocumentHead';
import { prepareOgDescription } from '../../utils/text';
import { useLanguage } from '../../stores/languageStore';
import { CcAttribution } from '../../components/common/CcAttribution';
import {
  BriefHero,
  BriefExecutiveSummary,
  BriefSections,
  BriefInsights,
  BriefMentions,
  BriefSidebar,
} from '../../components/brief';

export function BriefPage() {
  const { t } = useTranslation('brief');
  const language = useLanguage();
  const { brief, loading, error } = useBrief({ lang: language });
  const { activeItem: activeSection, setSectionRef } = useActiveSection(
    brief?.sections ?? []
  );

  const localeMap: Record<string, string> = { pl: 'pl-PL', en: 'en-US', de: 'de-DE' };

  // SEO meta tags
  const formattedDate = brief?.date
    ? new Date(brief.date).toLocaleDateString(localeMap[language] || 'pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';
  const ogTitle = brief ? `Daily Brief – ${formattedDate}` : 'Daily Brief';
  const ogImageTitle = brief?.headline || ogTitle;
  const ogDescription = prepareOgDescription(brief?.lead || brief?.executiveSummary);
  useDocumentHead({
    title: ogTitle,
    description: ogDescription,
    ogTitle: ogImageTitle,
    ogDescription,
    ogImageType: 'brief',
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
                  <div className="h-4 w-24 bg-divider rounded" />
                  <div className="flex-1 h-px bg-divider" />
                  <div className="h-4 w-32 bg-divider rounded" />
                </div>
                <div className="h-12 w-3/4 bg-divider rounded mb-3" />
                <div className="h-12 w-1/2 bg-divider rounded mb-5" />
                <div className="h-6 w-full bg-divider rounded mb-2" />
                <div className="h-6 w-4/5 bg-divider rounded mb-6" />
                <div className="h-10 w-40 bg-divider rounded" />
              </div>

              {/* Summary skeleton */}
              <div className="mb-10 space-y-3">
                <div className="h-4 w-24 bg-divider rounded" />
                <div className="h-4 w-full bg-divider rounded" />
                <div className="h-4 w-full bg-divider rounded" />
                <div className="h-4 w-3/4 bg-divider rounded" />
              </div>

              {/* Sections skeleton */}
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-5 rounded-lg border border-divider">
                    <div className="h-6 w-2/3 bg-divider rounded mb-4" />
                    <div className="h-4 w-full bg-divider rounded mb-2" />
                    <div className="h-4 w-full bg-divider rounded mb-2" />
                    <div className="h-4 w-3/4 bg-divider rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right column skeleton (desktop only) */}
            <div className="hidden lg:block">
              <div className="space-y-4">
                <div className="h-48 bg-divider rounded-xl" />
                <div className="h-64 bg-divider rounded-xl" />
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
            {error.message}
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

  if (!brief) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-surface flex items-center justify-center">
            <i className="ri-file-text-line text-2xl text-content-faint" />
          </div>
          <h1 className="text-xl font-medium text-content-heading mb-2">
            {t('empty.title')}
          </h1>
          <p className="text-content mb-6">
            {t('empty.description')}
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

          <CcAttribution />

          {/* Mobile: Word of the Day */}
          {brief.wordOfTheDay && (
            <section className="lg:hidden mt-10 pt-8 border-t border-divider">
              <h2 className="text-sm text-content-subtle mb-4 font-medium flex items-center gap-2">
                <i className="ri-book-2-line" />
                {t('wordOfTheDay')}
              </h2>
              <div className="p-4 rounded-xl border border-divider bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30">
                <div className="mb-3">
                  <span className="text-xl font-medium text-content-heading">{brief.wordOfTheDay.word}</span>
                  <span className="block text-xs italic text-content-subtle mt-0.5">
                    {brief.wordOfTheDay.etymology}
                  </span>
                </div>
                <p className="text-sm text-content leading-relaxed">
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
            sections={brief.sections}
          />
        </div>
      </div>
    </div>
  );
}
