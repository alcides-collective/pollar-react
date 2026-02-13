import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LocalizedLink } from '@/components/LocalizedLink';
import { API_BASE } from '@/config/api';
import type { EventGenealogy } from '@/types/events';

interface EventGenealogyBannerProps {
  genealogy: EventGenealogy;
}

/** Check which event IDs from a list still exist (are active, not archived). */
function useExistingEventIds(ids: string[]): Set<string> {
  const [existing, setExisting] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (ids.length === 0) {
      setExisting(new Set());
      return;
    }
    let cancelled = false;

    Promise.all(
      ids.map(id =>
        fetch(`${API_BASE}/events/${id}`, { method: 'HEAD' })
          .then(res => (res.ok ? id : null))
          .catch(() => null)
      )
    ).then(results => {
      if (!cancelled) {
        setExisting(new Set(results.filter((id): id is string => id !== null)));
      }
    });

    return () => { cancelled = true; };
  }, [ids.join(',')]);

  return existing;
}

export function EventGenealogyBanner({ genealogy }: EventGenealogyBannerProps) {
  const { t } = useTranslation('event');

  const parentId = genealogy.splitFrom || genealogy.parentIds?.[0];
  const childIds = genealogy.splitInto || genealogy.childIds || [];

  const isChildFromSplit = genealogy.bornFrom === 'split';
  const isChildFromMerge = genealogy.bornFrom === 'merge';
  const isParentThatSplit = childIds.length > 0;

  // Check parent existence for child banners
  const parentIds = parentId ? [parentId] : [];
  const existingParents = useExistingEventIds(parentIds);
  const parentExists = parentId ? existingParents.has(parentId) : false;

  // Check child existence for parent banner
  const existingChildren = useExistingEventIds(childIds);

  // Nothing to show
  if (!isChildFromSplit && !isChildFromMerge && !isParentThatSplit) return null;

  // For parent-that-split, only show if at least one child exists
  const liveChildIds = childIds.filter(id => existingChildren.has(id));
  if (isParentThatSplit && !isChildFromSplit && !isChildFromMerge && liveChildIds.length === 0) return null;

  return (
    <div className="mx-6 mt-4 flex flex-col gap-3">
      {/* Child banner: this event was born from split or merge */}
      {(isChildFromSplit || isChildFromMerge) && (
        <div className="rounded-lg border border-blue-500/30 bg-blue-50 dark:bg-blue-950/20 p-4">
          <div className="flex items-start gap-3">
            <i className={`${isChildFromSplit ? 'ri-scissors-line' : 'ri-merge-cells-horizontal'} text-xl text-blue-600 dark:text-blue-400 mt-0.5 shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-blue-900 dark:text-blue-200 text-sm">
                  {isChildFromSplit ? t('genealogy.splitTitle') : t('genealogy.mergeTitle')}
                </p>
                <span className="group/gene relative cursor-help">
                  <i className="ri-question-line text-sm text-blue-400 dark:text-blue-500" />
                  <span className="absolute left-0 bottom-full mb-2 px-3 py-2.5 bg-zinc-900/70 backdrop-blur-xl backdrop-saturate-150 text-zinc-100 text-xs rounded-xl border border-white/10 ring-1 ring-white/5 shadow-xl shadow-black/30 z-[60] w-72 font-normal leading-relaxed opacity-0 invisible group-hover/gene:opacity-100 group-hover/gene:visible transition-all duration-200">
                    {t('genealogy.tooltip')}
                  </span>
                </span>
              </div>
              <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                {isChildFromSplit ? t('genealogy.splitDescription') : t('genealogy.mergeDescription')}
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
      )}

      {/* Parent banner: this event was split into children */}
      {isParentThatSplit && liveChildIds.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 p-4">
          <div className="flex items-start gap-3">
            <i className="ri-git-branch-line text-xl text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-amber-900 dark:text-amber-200 text-sm">
                  {t('genealogy.splitParentTitle')}
                </p>
                <span className="group/gene relative cursor-help">
                  <i className="ri-question-line text-sm text-amber-400 dark:text-amber-500" />
                  <span className="absolute left-0 bottom-full mb-2 px-3 py-2.5 bg-zinc-900/70 backdrop-blur-xl backdrop-saturate-150 text-zinc-100 text-xs rounded-xl border border-white/10 ring-1 ring-white/5 shadow-xl shadow-black/30 z-[60] w-72 font-normal leading-relaxed opacity-0 invisible group-hover/gene:opacity-100 group-hover/gene:visible transition-all duration-200">
                    {t('genealogy.tooltip')}
                  </span>
                </span>
              </div>
              <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                {t('genealogy.splitParentDescription', { count: liveChildIds.length })}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {liveChildIds.map(childId => (
                  <LocalizedLink
                    key={childId}
                    to={`/event/${childId}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 transition-colors text-amber-800 dark:text-amber-200"
                  >
                    <i className="ri-arrow-right-down-line text-xs" />
                    {t('genealogy.viewChild')}
                  </LocalizedLink>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
