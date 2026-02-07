import { useTranslation } from 'react-i18next';
import { LocalizedLink } from '@/components/LocalizedLink';
import type { NewsletterEvent } from '../../types/newsletter';

interface NewsletterTopEventsProps {
  events: NewsletterEvent[];
}

export function NewsletterTopEvents({ events }: NewsletterTopEventsProps) {
  const { t } = useTranslation('newsletter');

  return (
    <section className="mb-10">
      <h2 className="text-sm text-content-subtle mb-5 pb-2 border-b border-divider font-medium">
        {t('topEvents')}
      </h2>
      <div className="space-y-4">
        {events.map((event, index) => (
          <TopEventCard key={event.eventId} event={event} rank={index + 1} />
        ))}
      </div>
    </section>
  );
}

function TopEventCard({ event, rank }: { event: NewsletterEvent; rank: number }) {
  const { t } = useTranslation('newsletter');
  const { t: tCommon } = useTranslation('common');

  return (
    <div className="flex gap-4 items-start group">
      {/* Number badge */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
        {rank}
      </div>

      <div className="flex-1 min-w-0">
        {/* Title */}
        <LocalizedLink
          to={`/event/${event.eventId}`}
          className="text-base font-semibold text-content-heading hover:text-content transition-colors leading-snug block mb-1"
        >
          {event.title}
        </LocalizedLink>

        {/* Lead */}
        <p className="text-sm text-content leading-relaxed line-clamp-2 mb-2">
          {event.lead}
        </p>

        {/* Meta row: category badge + source count */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface text-content">
            {tCommon(`categories.${event.category}`, { defaultValue: event.category })}
          </span>
          <span className="text-xs text-content-faint">
            {event.sourceCount} {t('sources')}
          </span>
        </div>
      </div>
    </div>
  );
}
