import { useTranslation } from 'react-i18next';
import { LocalizedLink } from '@/components/LocalizedLink';
import { useFavoriteCategories } from '@/stores/userStore';
import type { NewsletterCategorySection, NewsletterEvent } from '../../types/newsletter';

interface NewsletterCategorySectionsProps {
  sections: NewsletterCategorySection[];
  setSectionRef?: (category: string) => (el: HTMLElement | null) => void;
}

export function NewsletterCategorySections({ sections, setSectionRef }: NewsletterCategorySectionsProps) {
  const { t } = useTranslation('newsletter');
  const favoriteCategories = useFavoriteCategories();

  const hasFavorites = favoriteCategories.length > 0;

  // Split sections into favorites and others
  const favoriteSections = hasFavorites
    ? sections.filter((s) => favoriteCategories.includes(s.category))
    : [];
  const otherSections = hasFavorites
    ? sections.filter((s) => !favoriteCategories.includes(s.category))
    : sections;

  return (
    <section className="mb-10">
      <h2 className="text-sm text-zinc-500 mb-5 pb-2 border-b border-zinc-200 font-medium">
        {t('categories')}
      </h2>

      {/* Favorite categories first */}
      {hasFavorites && favoriteSections.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <i className="ri-star-fill text-amber-500 text-sm" />
            <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
              {t('yourCategories')}
            </span>
          </div>
          <div className="space-y-8 mb-8">
            {favoriteSections.map((section) => (
              <CategorySection
                key={section.category}
                section={section}
                ref={setSectionRef?.(section.category)}
              />
            ))}
          </div>

          {/* Separator */}
          {otherSections.length > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <span className="flex-1 h-px bg-zinc-200" />
              <span className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
                {t('otherCategories')}
              </span>
              <span className="flex-1 h-px bg-zinc-200" />
            </div>
          )}
        </>
      )}

      {/* Other / all categories */}
      <div className="space-y-8">
        {otherSections.map((section) => (
          <CategorySection
            key={section.category}
            section={section}
            ref={setSectionRef?.(section.category)}
          />
        ))}
      </div>
    </section>
  );
}

import { forwardRef } from 'react';

const CategorySection = forwardRef<HTMLDivElement, { section: NewsletterCategorySection }>(
  function CategorySection({ section }, ref) {
    return (
      <div ref={ref} id={`category-${slugify(section.category)}`}>
        <h3 className="text-xl font-semibold text-zinc-900 mb-3 leading-tight">
          {section.category}
        </h3>
        <p className="text-sm text-zinc-600 leading-relaxed mb-4">
          {section.summary}
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {section.events.slice(0, 3).map((event) => (
            <CategoryEventCard key={event.eventId} event={event} />
          ))}
        </div>
      </div>
    );
  }
);

function CategoryEventCard({ event }: { event: NewsletterEvent }) {
  const { t } = useTranslation('newsletter');

  return (
    <LocalizedLink
      to={`/event/${event.eventId}`}
      className="block p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors group"
    >
      <h4 className="text-sm font-semibold text-zinc-900 group-hover:text-zinc-700 mb-2 line-clamp-2 leading-snug">
        {event.title}
      </h4>
      <p className="text-xs text-zinc-500 line-clamp-2 mb-3 leading-relaxed">
        {event.lead}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">
          {event.sourceCount} {t('sources')}
        </span>
        <span className="text-xs font-medium text-zinc-500 group-hover:text-zinc-700 transition-colors">
          {t('readMore')} &rarr;
        </span>
      </div>
    </LocalizedLink>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}
