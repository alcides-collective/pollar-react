import { useTranslation } from 'react-i18next';
import type { Event } from '../../types/events';
import { EventImage } from '../common/EventImage';
import { SectionWrapper } from '../common/SectionWrapper';
import { LocalizedLink } from '../LocalizedLink';
import { AnimatedUnderline } from '../common/AnimatedUnderline';
import { eventPath } from '../../utils/slug';
import olympicsRings from '../../assets/images/olympics/olympics.svg';

const OLYMPIC_PATTERNS = [/igrzysk/i, /olympi/i, /olimp/i, /milancortina/i, /mailandcortina/i, /bormio2026/i, /zio2026/i];

export function isOlympicEvent(event: Event): boolean {
  const keywords = event.metadata?.seo?.keywords ?? [];
  const hashtags = event.metadata?.seo?.hashtags ?? [];
  const allTags = [...keywords, ...hashtags, event.title];
  return allTags.some(tag => OLYMPIC_PATTERNS.some(p => p.test(tag)));
}

interface OlympicsSectionProps {
  events: Event[];
}

export function OlympicsSection({ events }: OlympicsSectionProps) {
  const { t } = useTranslation('common');

  if (events.length === 0) return null;

  return (
    <SectionWrapper sectionId="olympics-section" priority="low">
      <div className="relative overflow-hidden p-6">
        <div className="absolute inset-0 dark:hidden" style={{ background: 'linear-gradient(135deg, rgba(0,133,199,0.1) 0%, rgba(244,195,0,0.1) 25%, rgba(0,159,61,0.08) 50%, rgba(223,0,36,0.08) 75%, rgba(0,133,199,0.1) 100%)' }} />
        <div className="absolute inset-0 hidden dark:block" style={{ background: 'linear-gradient(135deg, rgba(0,133,199,0.18) 0%, rgba(244,195,0,0.12) 25%, rgba(0,159,61,0.14) 50%, rgba(223,0,36,0.14) 75%, rgba(0,133,199,0.18) 100%)' }} />
        <div className="relative flex items-center gap-3 mb-5">
          <img src={olympicsRings} alt="Olympic Rings" className="w-20 h-auto drop-shadow-[0_0_4px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_0_4px_rgba(255,255,255,0.15)]" />
          <div>
            <h2 className="text-xl font-bold text-content-heading">{t('olympics.title')}</h2>
            <p className="text-sm text-content-subtle">{t('olympics.subtitle')}</p>
            <p className="text-xs text-content-faint">{t('olympics.details')}</p>
          </div>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {events.map(event => (
            <LocalizedLink
              key={event.id}
              to={eventPath(event)}
              className="group/underline block bg-background border border-divider hover:bg-surface transition-colors"
            >
              <EventImage
                event={event}
                className="w-full aspect-video object-cover"
                groupHover
                width={400}
                height={225}
              />
              <div className="p-3">
                {event.metadata?.ultraShortHeadline && (
                  <h3 className="text-content-heading font-semibold text-sm leading-snug">
                    <AnimatedUnderline>{event.metadata.ultraShortHeadline}</AnimatedUnderline>
                  </h3>
                )}
                <p className="text-xs text-content-subtle mt-1 line-clamp-4">
                  {event.title}
                </p>
              </div>
            </LocalizedLink>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
