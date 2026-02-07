import { useTranslation } from 'react-i18next';
import type { NewsletterCategorySection } from '../../types/newsletter';

interface NewsletterSidebarProps {
  sections: NewsletterCategorySection[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}

export function NewsletterSidebar({ sections }: NewsletterSidebarProps) {
  const { t } = useTranslation('newsletter');

  return (
    <aside className="lg:sticky lg:top-6 space-y-4">
      {/* Table of contents */}
      <div className="p-4 rounded-xl border border-zinc-200 bg-white">
        <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3 flex items-center gap-2">
          <i className="ri-list-unordered" />
          {t('tableOfContents')}
        </h3>
        <nav>
          <ul className="space-y-1.5">
            {sections.map((section) => (
              <li key={section.category}>
                <a
                  href={`#category-${slugify(section.category)}`}
                  className="block text-sm text-zinc-600 hover:text-zinc-900 transition-colors py-1 px-2 rounded hover:bg-zinc-50"
                >
                  {section.category}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Subscribe CTA */}
      <div className="p-4 rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100/50">
        <div className="flex items-center gap-2 mb-2">
          <i className="ri-mail-send-line text-zinc-600" />
          <h3 className="text-sm font-semibold text-zinc-900">
            {t('subscribe')}
          </h3>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed">
          {t('subscribeDesc')}
        </p>
      </div>
    </aside>
  );
}
