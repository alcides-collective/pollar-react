import { useParams } from 'react-router-dom';
import { LocalizedLink } from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import { useProceeding } from '../../hooks/useProceedings';
import { SejmApiError } from '../../components/sejm';
import { useLanguageStore } from '../../stores/languageStore';

export function ProceedingDetailPage() {
  const { t } = useTranslation('sejm');
  const language = useLanguageStore((s) => s.language);
  const { number } = useParams<{ number: string }>();
  const { proceeding, loading, error } = useProceeding(number ? parseInt(number) : null);

  if (error) {
    return <SejmApiError message={error.message} />;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 bg-zinc-100 animate-pulse rounded" />
        <div className="h-32 bg-zinc-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  const localeMap: Record<string, string> = { pl: 'pl-PL', en: 'en-US', de: 'de-DE' };

  const formatDates = (dates: string[]) => {
    if (!dates || dates.length === 0) return '';
    const locale = localeMap[language] || 'pl-PL';
    if (dates.length === 1) {
      return new Date(dates[0]).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
    const first = new Date(dates[0]);
    const last = new Date(dates[dates.length - 1]);
    return `${first.toLocaleDateString(locale, { day: 'numeric' })}-${last.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}`;
  };

  if (!proceeding) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">{t('proceedingDetail.notFound')}</p>
        <LocalizedLink to="/sejm/posiedzenia" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
          <i className="ri-arrow-left-s-line" /> {t('proceedingDetail.backToList')}
        </LocalizedLink>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <LocalizedLink to="/sejm/posiedzenia" className="text-sm text-zinc-500 hover:text-zinc-700">
        <i className="ri-arrow-left-s-line" /> {t('proceedingDetail.allProceedings')}
      </LocalizedLink>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-lg font-semibold text-zinc-900">
            {t('proceedingDetail.sejmSession', { number: proceeding.number })}
          </span>
          {proceeding.current && (
            <span className="bg-green-500 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded animate-pulse">
              {t('proceedingDetail.live')}
            </span>
          )}
        </div>
        <h1 className="text-xl text-zinc-700">{proceeding.title}</h1>
        <p className="text-zinc-500 mt-2">{formatDates(proceeding.dates)}</p>
      </div>

      {/* Agenda */}
      {proceeding.agenda && (
        <div className="rounded-lg border border-zinc-200 p-4">
          <h2 className="text-sm font-medium text-zinc-900 mb-3">{t('proceedingDetail.agenda')}</h2>
          <div
            className="prose prose-sm max-w-none text-zinc-700"
            dangerouslySetInnerHTML={{ __html: proceeding.agenda }}
          />
        </div>
      )}
    </div>
  );
}
