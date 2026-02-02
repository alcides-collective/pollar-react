import { useParams, Link } from 'react-router-dom';
import { usePrints, usePrintAISummary } from '../../hooks/usePrints';

export function PrintDetailPage() {
  const { number } = useParams<{ number: string }>();
  const { prints } = usePrints();
  const { summary: aiSummary, loading: aiLoading } = usePrintAISummary(number || null);

  // Find print in the loaded list
  const print = prints.find(p => p.number === number);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (!print && prints.length > 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Nie znaleziono druku</p>
        <Link to="/sejm/druki" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
          <i className="ri-arrow-left-s-line" /> Wróć do listy
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link to="/sejm/druki" className="text-sm text-zinc-500 hover:text-zinc-700">
        <i className="ri-arrow-left-s-line" /> Wszystkie druki
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-zinc-100 text-zinc-600 text-sm font-mono px-2 py-0.5 rounded">
            Druk nr {number}
          </span>
          {print?.documentType && (
            <span className="text-xs text-zinc-500 uppercase tracking-wide">
              {print.documentType}
            </span>
          )}
        </div>
        <h1 className="text-xl font-semibold text-zinc-900">
          {print?.title || `Druk nr ${number}`}
        </h1>
        {print && (
          <p className="text-zinc-500 mt-2">{formatDate(print.deliveryDate)}</p>
        )}
      </div>

      {/* AI Summary */}
      {aiLoading ? (
        <div className="rounded-lg border border-zinc-200 p-4">
          <div className="h-4 w-32 bg-zinc-100 animate-pulse rounded mb-3" />
          <div className="space-y-2">
            <div className="h-4 bg-zinc-100 animate-pulse rounded" />
            <div className="h-4 bg-zinc-100 animate-pulse rounded w-3/4" />
          </div>
        </div>
      ) : aiSummary ? (
        <div className="space-y-4">
          {/* TL;DR */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h2 className="text-sm font-medium text-blue-900 mb-2">TL;DR</h2>
            <p className="text-blue-800 italic">{aiSummary.analysis.tldr}</p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs px-2 py-1 rounded ${
              aiSummary.analysis.complexity === 'simple' ? 'bg-green-100 text-green-700' :
              aiSummary.analysis.complexity === 'medium' ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>
              Złożoność: {aiSummary.analysis.complexity === 'simple' ? 'niska' :
                aiSummary.analysis.complexity === 'medium' ? 'średnia' : 'wysoka'}
            </span>
            <span className={`text-xs px-2 py-1 rounded ${
              aiSummary.analysis.controversy === 'low' ? 'bg-green-100 text-green-700' :
              aiSummary.analysis.controversy === 'medium' ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>
              Kontrowersyjność: {aiSummary.analysis.controversy === 'low' ? 'niska' :
                aiSummary.analysis.controversy === 'medium' ? 'średnia' : 'wysoka'}
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

          {/* Key changes */}
          {aiSummary.analysis.keyChanges.length > 0 && (
            <div className="rounded-lg border border-zinc-200 p-4">
              <h2 className="text-sm font-medium text-zinc-900 mb-3">Kluczowe zmiany</h2>
              <ul className="space-y-2">
                {aiSummary.analysis.keyChanges.map((change, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-700">
                    <span className="text-zinc-400">•</span>
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Affected groups */}
          {aiSummary.analysis.affectedGroups.length > 0 && (
            <div className="rounded-lg border border-zinc-200 p-4">
              <h2 className="text-sm font-medium text-zinc-900 mb-3">Dotknięte grupy</h2>
              <div className="space-y-2">
                {aiSummary.analysis.affectedGroups.map((group, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-700">{group.group}</span>
                    <span className={`${
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
              <h2 className="text-sm font-medium text-amber-900 mb-2">Wpływ finansowy</h2>
              {aiSummary.analysis.financialImpact.estimatedCost && (
                <p className="text-amber-800">
                  Szacowany koszt: {aiSummary.analysis.financialImpact.estimatedCost}
                </p>
              )}
              {aiSummary.analysis.financialImpact.who && (
                <p className="text-amber-700 text-sm mt-1">
                  Kto poniesie: {aiSummary.analysis.financialImpact.who}
                </p>
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* Attachments */}
      {print?.attachments && print.attachments.length > 0 && (
        <div className="rounded-lg border border-zinc-200 p-4">
          <h2 className="text-sm font-medium text-zinc-900 mb-3">Załączniki</h2>
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
    </div>
  );
}
