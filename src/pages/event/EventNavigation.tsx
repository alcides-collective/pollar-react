import { LocalizedLink } from '@/components/LocalizedLink';
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
    <section className="px-6 py-6 border-t border-divider">
      <div className="flex gap-3">
        {/* Previous Event */}
        <div className="flex-1">
          {previousEvent ? (
            <LocalizedLink
              to={`/event/${previousEvent.id}`}
              className="block p-4 rounded-lg border border-divider hover:border-divider hover:bg-surface transition-colors h-full"
            >
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-content-faint mb-2">
                <i className="ri-arrow-left-s-line" />
                <span>{t('navigation.previous')}</span>
              </div>
              <h4 className="text-sm font-medium text-content-heading line-clamp-2">
                {previousEvent.title}
              </h4>
            </LocalizedLink>
          ) : (
            <div className="p-4 rounded-lg border border-divider-subtle h-full opacity-50">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-content-faint mb-2">
                <i className="ri-arrow-left-s-line" />
                <span>{t('navigation.previous')}</span>
              </div>
              <p className="text-sm text-content-faint">{t('navigation.none')}</p>
            </div>
          )}
        </div>

        {/* Next Event */}
        <div className="flex-1">
          {nextEvent ? (
            <LocalizedLink
              to={`/event/${nextEvent.id}`}
              className="block p-4 rounded-lg border border-divider hover:border-divider hover:bg-surface transition-colors h-full text-right"
            >
              <div className="flex items-center justify-end gap-2 text-xs uppercase tracking-wider text-content-faint mb-2">
                <span>{t('navigation.next')}</span>
                <i className="ri-arrow-right-s-line" />
              </div>
              <h4 className="text-sm font-medium text-content-heading line-clamp-2">
                {nextEvent.title}
              </h4>
            </LocalizedLink>
          ) : (
            <div className="p-4 rounded-lg border border-divider-subtle h-full text-right opacity-50">
              <div className="flex items-center justify-end gap-2 text-xs uppercase tracking-wider text-content-faint mb-2">
                <span>{t('navigation.next')}</span>
                <i className="ri-arrow-right-s-line" />
              </div>
              <p className="text-sm text-content-faint">{t('navigation.none')}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
