import { useCallback, useRef } from 'react';
import { LocalizedLink } from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import { useNewsletter } from '../../hooks/useNewsletter';
import { useDocumentHead } from '../../hooks/useDocumentHead';
import {
  NewsletterHero,
  NewsletterTopEvents,
  NewsletterCategorySections,
  NewsletterSidebar,
} from '../../components/newsletter';

export function NewsletterPage() {
  const { t } = useTranslation('newsletter');
  const { newsletter, loading, error } = useNewsletter();

  // Section refs for scroll anchoring
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const setSectionRef = useCallback(
    (category: string) => (el: HTMLElement | null) => {
      sectionRefs.current[category] = el;
    },
    []
  );

  // SEO meta tags
  const ogTitle = newsletter ? `${t('title')} – ${newsletter.headline}` : t('title');
  useDocumentHead({
    title: ogTitle,
    ogTitle: newsletter?.headline || ogTitle,
    ogImageType: 'newsletter',
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
                  <div className="h-4 w-32 bg-zinc-200 rounded" />
                  <div className="flex-1 h-px bg-zinc-200" />
                  <div className="h-4 w-40 bg-zinc-200 rounded" />
                </div>
                <div className="h-12 w-3/4 bg-zinc-200 rounded mb-3" />
                <div className="h-12 w-1/2 bg-zinc-200 rounded mb-5" />
                <div className="h-6 w-full bg-zinc-200 rounded mb-2" />
                <div className="h-6 w-4/5 bg-zinc-200 rounded" />
              </div>

              {/* Top events skeleton */}
              <div className="mb-10">
                <div className="h-4 w-32 bg-zinc-200 rounded mb-5" />
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-zinc-200 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="h-5 w-3/4 bg-zinc-200 rounded mb-2" />
                        <div className="h-4 w-full bg-zinc-200 rounded mb-2" />
                        <div className="h-3 w-24 bg-zinc-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category sections skeleton */}
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <div className="h-6 w-40 bg-zinc-200 rounded mb-3" />
                    <div className="h-4 w-full bg-zinc-200 rounded mb-4" />
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="p-4 rounded-lg border border-zinc-200">
                          <div className="h-4 w-3/4 bg-zinc-200 rounded mb-2" />
                          <div className="h-3 w-full bg-zinc-200 rounded mb-2" />
                          <div className="h-3 w-1/2 bg-zinc-200 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column skeleton (desktop only) */}
            <div className="hidden lg:block">
              <div className="space-y-4">
                <div className="h-64 bg-zinc-200 rounded-xl" />
                <div className="h-32 bg-zinc-200 rounded-xl" />
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
            {error.message}
          </p>
          <LocalizedLink
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <i className="ri-arrow-left-line" />
            {t('error.back')}
          </LocalizedLink>
        </div>
      </div>
    );
  }

  if (!newsletter) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-zinc-100 flex items-center justify-center">
            <i className="ri-mail-line text-2xl text-zinc-400" />
          </div>
          <h1 className="text-xl font-medium text-zinc-900 mb-2">
            {t('empty.title')}
          </h1>
          <p className="text-zinc-600 mb-6">
            {t('empty.description')}
          </p>
          <LocalizedLink
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <i className="ri-arrow-left-line" />
            {t('error.back')}
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
          <NewsletterHero newsletter={newsletter} />
          <NewsletterTopEvents events={newsletter.topEvents} />
          <NewsletterCategorySections
            sections={newsletter.categorySections}
            setSectionRef={setSectionRef}
          />
        </div>

        {/* Right column - sidebar (desktop only) */}
        <div className="hidden lg:block py-8">
          <NewsletterSidebar sections={newsletter.categorySections} />
        </div>
      </div>
    </div>
  );
}
