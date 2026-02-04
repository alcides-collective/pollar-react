import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Event } from '../../types/events';

interface EventNavigationProps {
  previousEvent: Event | null;
  nextEvent: Event | null;
}

export function EventNavigation({ previousEvent, nextEvent }: EventNavigationProps) {
  const { t } = useTranslation('event');
  if (!previousEvent && !nextEvent) return null;

  return (
    <section className="px-6 py-6 border-t border-zinc-200">
      <div className="flex gap-3">
        {/* Previous Event */}
        <div className="flex-1">
          {previousEvent ? (
            <Link
              to={`/event/${previousEvent.id}`}
              className="block p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors h-full"
            >
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-400 mb-2">
                <i className="ri-arrow-left-s-line" />
                <span>{t('navigation.previous')}</span>
              </div>
              <h4 className="text-sm font-medium text-zinc-900 line-clamp-2">
                {previousEvent.title}
              </h4>
            </Link>
          ) : (
            <div className="p-4 rounded-lg border border-zinc-100 h-full opacity-50">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-300 mb-2">
                <i className="ri-arrow-left-s-line" />
                <span>{t('navigation.previous')}</span>
              </div>
              <p className="text-sm text-zinc-300">{t('navigation.none')}</p>
            </div>
          )}
        </div>

        {/* Next Event */}
        <div className="flex-1">
          {nextEvent ? (
            <Link
              to={`/event/${nextEvent.id}`}
              className="block p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors h-full text-right"
            >
              <div className="flex items-center justify-end gap-2 text-xs uppercase tracking-wider text-zinc-400 mb-2">
                <span>{t('navigation.next')}</span>
                <i className="ri-arrow-right-s-line" />
              </div>
              <h4 className="text-sm font-medium text-zinc-900 line-clamp-2">
                {nextEvent.title}
              </h4>
            </Link>
          ) : (
            <div className="p-4 rounded-lg border border-zinc-100 h-full text-right opacity-50">
              <div className="flex items-center justify-end gap-2 text-xs uppercase tracking-wider text-zinc-300 mb-2">
                <span>{t('navigation.next')}</span>
                <i className="ri-arrow-right-s-line" />
              </div>
              <p className="text-sm text-zinc-300">{t('navigation.none')}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
