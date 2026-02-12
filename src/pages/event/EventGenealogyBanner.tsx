import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LocalizedLink } from '@/components/LocalizedLink';
import { API_BASE } from '@/config/api';
import type { EventGenealogy } from '@/types/events';

interface EventGenealogyBannerProps {
  genealogy: EventGenealogy;
}

export function EventGenealogyBanner({ genealogy }: EventGenealogyBannerProps) {
  const { t } = useTranslation('event');
  const [parentExists, setParentExists] = useState<boolean | null>(null);

  const parentId = genealogy.splitFrom || genealogy.parentIds?.[0];

  useEffect(() => {
    if (!parentId) {
      setParentExists(false);
      return;
    }
    let cancelled = false;
    fetch(`${API_BASE}/events/${parentId}`, { method: 'HEAD' })
      .then(res => { if (!cancelled) setParentExists(res.ok); })
      .catch(() => { if (!cancelled) setParentExists(false); });
    return () => { cancelled = true; };
  }, [parentId]);

  if (genealogy.bornFrom === 'new') return null;

  const isSplit = genealogy.bornFrom === 'split';
  const icon = isSplit ? 'ri-scissors-line' : 'ri-merge-cells-horizontal';

  return (
    <div className="mx-6 mt-4 rounded-lg border border-blue-500/30 bg-blue-50 dark:bg-blue-950/20 p-4">
      <div className="flex items-start gap-3">
        <i className={`${icon} text-xl text-blue-600 dark:text-blue-400 mt-0.5 shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-blue-900 dark:text-blue-200 text-sm">
              {isSplit ? t('genealogy.splitTitle') : t('genealogy.mergeTitle')}
            </p>
            <span className="group/gene relative cursor-help">
              <i className="ri-question-line text-sm text-blue-400 dark:text-blue-500" />
              <span className="absolute left-0 bottom-full mb-2 px-3 py-2.5 bg-zinc-900/70 backdrop-blur-xl backdrop-saturate-150 text-zinc-100 text-xs rounded-xl border border-white/10 ring-1 ring-white/5 shadow-xl shadow-black/30 z-[60] w-72 font-normal leading-relaxed opacity-0 invisible group-hover/gene:opacity-100 group-hover/gene:visible transition-all duration-200">
                {t('genealogy.tooltip')}
              </span>
            </span>
          </div>
          <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
            {isSplit ? t('genealogy.splitDescription') : t('genealogy.mergeDescription')}
          </p>
          {parentExists && parentId && (
            <div className="mt-3">
              <LocalizedLink
                to={`/event/${parentId}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 transition-colors text-blue-800 dark:text-blue-200"
              >
                <i className="ri-arrow-left-up-line text-xs" />
                {t('genealogy.viewParent')}
              </LocalizedLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
