import { useParams } from 'react-router-dom';
import { LocalizedLink } from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import { usePrints, usePrintAISummary, usePrintContent } from '../../hooks/usePrints';
import { useLanguageStore } from '../../stores/languageStore';

export function PrintDetailPage() {
  const { t } = useTranslation('sejm');
  const language = useLanguageStore((s) => s.language);
  const { number } = useParams<{ number: string }>();
  const { prints } = usePrints();
  const { summary: aiSummary, loading: aiLoading } = usePrintAISummary(number || null);
  const { content: printContent, loading: contentLoading } = usePrintContent(number || null);

  // Find print in the loaded list
  const print = prints.find(p => p.number === number);

  const localeMap: Record<string, string> = { pl: 'pl-PL', en: 'en-US', de: 'de-DE' };
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(localeMap[language] || 'pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (!print && prints.length > 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">{t('printDetail.notFound')}</p>
        <LocalizedLink to="/sejm/druki" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
          <i className="ri-arrow-left-s-line" /> {t('printDetail.backToList')}
        </LocalizedLink>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Back link */}
      <LocalizedLink to="/sejm/druki" className="text-sm text-zinc-500 hover:text-zinc-700 inline-flex items-center gap-1">
        <i className="ri-arrow-left-s-line" /> {t('printDetail.allPrints')}
      </LocalizedLink>

      {/* Header - full width */}
      <div className="pb-2 border-b border-zinc-100">
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-zinc-100 text-zinc-600 text-sm font-mono px-2 py-0.5 rounded">
            {t('printDetail.printNumber', { number })}
          </span>
          {print?.documentType && (
            <span className="text-xs text-zinc-500 uppercase tracking-wide">
              {print.documentType}
            </span>
          )}
        </div>
        <h1 className="text-xl font-semibold text-zinc-900 leading-tight">
          {print?.title || t('printDetail.printNumber', { number })}
        </h1>
        {print && (
          <p className="text-zinc-500 text-sm mt-2">{formatDate(print.deliveryDate)}</p>
        )}
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT PANEL - Source & Metadata */}
        <div className="space-y-4">
          {/* Badges & Tags */}
          {aiSummary && (
            <div className="space-y-3">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  aiSummary.analysis.complexity === 'simple' ? 'bg-green-100 text-green-700' :
                  aiSummary.analysis.complexity === 'medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {t('printDetail.complexity')}: {aiSummary.analysis.complexity === 'simple' ? t('printDetail.complexityLow') :
                    aiSummary.analysis.complexity === 'medium' ? t('printDetail.complexityMedium') : t('printDetail.complexityHigh')}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  aiSummary.analysis.controversy === 'low' ? 'bg-green-100 text-green-700' :
                  aiSummary.analysis.controversy === 'medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {t('printDetail.controversy')}: {aiSummary.analysis.controversy === 'low' ? t('printDetail.controversyLow') :
                    aiSummary.analysis.controversy === 'medium' ? t('printDetail.controversyMedium') : t('printDetail.controversyHigh')}
                </span>
              </div>

              {/* Tags */}
              {aiSummary.analysis.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {aiSummary.analysis.tags.map((tag, i) => (
                    <span key={i} className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Attachments (download links) */}
          {print?.attachments && print.attachments.length > 0 && (
            <div className="rounded-lg border border-zinc-200 p-4">
              <h2 className="text-sm font-medium text-zinc-900 mb-3">{t('printDetail.attachments')}</h2>
              <div className="space-y-2">
                {print.attachments.map((attachment, i) => (
                  <a
                    key={i}
                    href={attachment.URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                  >
                    <i className="ri-file-download-line" />
                    {attachment.name}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Document Content (expandable) */}
          {contentLoading ? (
            <div className="rounded-lg border border-zinc-200 p-4">
              <div className="h-4 w-40 bg-zinc-100 animate-pulse rounded mb-3" />
              <div className="space-y-2">
                <div className="h-4 bg-zinc-100 animate-pulse rounded" />
                <div className="h-4 bg-zinc-100 animate-pulse rounded w-5/6" />
                <div className="h-4 bg-zinc-100 animate-pulse rounded w-4/6" />
              </div>
            </div>
          ) : printContent && printContent.attachments.length > 0 ? (
            <div className="rounded-lg border border-zinc-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-zinc-900">{t('printDetail.documentContent')}</h2>
                <span className="text-xs text-zinc-500">
                  {printContent.totalCharacters.toLocaleString()} {t('printDetail.characters')}
                </span>
              </div>
              <div className="space-y-3">
                {printContent.attachments.map((attachment, i) => (
                  <details key={i} className="group">
                    <summary className="cursor-pointer text-sm font-medium text-zinc-700 hover:text-zinc-900 flex items-center gap-2">
                      <i className="ri-file-text-line" />
                      {attachment.filename}
                      <i className="ri-arrow-down-s-line group-open:rotate-180 transition-transform ml-auto" />
                    </summary>
                    <div className="mt-3 p-3 bg-zinc-50 rounded text-zinc-700 whitespace-pre-wrap max-h-[500px] overflow-y-auto font-mono text-xs leading-relaxed">
                      {attachment.text}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* RIGHT PANEL - AI Analysis */}
        <div className="space-y-4">
          {aiLoading ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-zinc-200 p-4">
                <div className="h-4 w-16 bg-zinc-100 animate-pulse rounded mb-3" />
                <div className="space-y-2">
                  <div className="h-4 bg-zinc-100 animate-pulse rounded" />
                  <div className="h-4 bg-zinc-100 animate-pulse rounded w-3/4" />
                </div>
              </div>
              <div className="rounded-lg border border-zinc-200 p-4">
                <div className="h-4 w-32 bg-zinc-100 animate-pulse rounded mb-3" />
                <div className="space-y-2">
                  <div className="h-4 bg-zinc-100 animate-pulse rounded" />
                  <div className="h-4 bg-zinc-100 animate-pulse rounded" />
                  <div className="h-4 bg-zinc-100 animate-pulse rounded w-2/3" />
                </div>
              </div>
            </div>
          ) : aiSummary ? (
            <>
              {/* TL;DR */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h2 className="text-sm font-medium text-blue-900 mb-2">TL;DR</h2>
                <p className="text-blue-800 italic text-sm leading-relaxed">{aiSummary.analysis.tldr}</p>
              </div>

              {/* Key changes */}
              {aiSummary.analysis.keyChanges.length > 0 && (
                <div className="rounded-lg border border-zinc-200 p-4">
                  <h2 className="text-sm font-medium text-zinc-900 mb-3">{t('printDetail.keyChanges')}</h2>
                  <ul className="space-y-2">
                    {aiSummary.analysis.keyChanges.map((change, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-zinc-700">
                        <span className="text-zinc-400 mt-0.5">•</span>
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Affected groups */}
              {aiSummary.analysis.affectedGroups.length > 0 && (
                <div className="rounded-lg border border-zinc-200 p-4">
                  <h2 className="text-sm font-medium text-zinc-900 mb-3">{t('printDetail.affectedGroups')}</h2>
                  <div className="space-y-2">
                    {aiSummary.analysis.affectedGroups.map((group, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-zinc-700">{group.group}</span>
                        <span className={`font-medium ${
                          group.impact === 'positive' ? 'text-green-600' :
                          group.impact === 'negative' ? 'text-red-600' :
                          'text-zinc-400'
                        }`}>
                          {group.impact === 'positive' ? '+' :
                           group.impact === 'negative' ? '−' : '○'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Financial impact */}
              {aiSummary.analysis.financialImpact.hasBudgetImpact && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <h2 className="text-sm font-medium text-amber-900 mb-2">{t('printDetail.financialImpact')}</h2>
                  {aiSummary.analysis.financialImpact.estimatedCost && (
                    <p className="text-amber-800 text-sm">
                      {t('printDetail.estimatedCost')}: {aiSummary.analysis.financialImpact.estimatedCost}
                    </p>
                  )}
                  {aiSummary.analysis.financialImpact.who && (
                    <p className="text-amber-700 text-sm mt-1">
                      {t('printDetail.whoBears')}: {aiSummary.analysis.financialImpact.who}
                    </p>
                  )}
                </div>
              )}

              {/* AI Summary (full) - collapsible */}
              {aiSummary.analysis.summary && (
                <details className="rounded-lg border border-zinc-200 p-4 group">
                  <summary className="cursor-pointer text-sm font-medium text-zinc-900 flex items-center gap-2">
                    <i className="ri-article-line" />
                    {t('printDetail.fullSummary')}
                    <i className="ri-arrow-down-s-line group-open:rotate-180 transition-transform ml-auto" />
                  </summary>
                  <p className="mt-3 text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
                    {aiSummary.analysis.summary}
                  </p>
                </details>
              )}
            </>
          ) : (
            <div className="rounded-lg border border-zinc-200 border-dashed p-6 text-center">
              <i className="ri-sparkling-line text-2xl text-zinc-300 mb-2" />
              <p className="text-sm text-zinc-500">{t('printDetail.noAISummary')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
