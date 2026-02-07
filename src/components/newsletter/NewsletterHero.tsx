import { useTranslation } from 'react-i18next';
import type { Newsletter } from '../../types/newsletter';
import { useLanguage } from '../../stores/languageStore';

interface NewsletterHeroProps {
  newsletter: Newsletter;
}

export function NewsletterHero({ newsletter }: NewsletterHeroProps) {
  const { t } = useTranslation('newsletter');
  const language = useLanguage();

  const localeMap: Record<string, string> = { pl: 'pl-PL', en: 'en-US', de: 'de-DE' };
  const locale = localeMap[language] || 'pl-PL';

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
    });

  const weekStart = formatDate(newsletter.weekStart);
  const weekEnd = formatDate(newsletter.weekEnd);
  const year = new Date(newsletter.weekEnd).getFullYear();

  return (
    <header className="mb-14">
      {/* Row: label --- date range */}
      <div className="flex items-center gap-4 mb-4">
        <span className="text-sm text-zinc-500 font-medium uppercase tracking-wider">
          {t('title')}
        </span>
        <span className="flex-1 h-px bg-zinc-200" />
        <span className="text-sm text-zinc-500 font-medium">
          {weekStart} – {weekEnd} {year}
        </span>
      </div>

      {/* Headline */}
      <h1 className="text-4xl md:text-5xl font-medium text-zinc-900 mb-5 leading-tight tracking-tight">
        {newsletter.headline}
      </h1>

      {/* Intro */}
      <p className="text-lg md:text-xl text-zinc-600 mb-6 leading-relaxed">
        {newsletter.intro}
      </p>
    </header>
  );
}
