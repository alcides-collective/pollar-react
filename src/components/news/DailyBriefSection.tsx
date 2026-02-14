import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { DailyBrief } from '../../types/brief';
import { SectionWrapper } from '../common/SectionWrapper';
import { useRouteLanguage } from '../../hooks/useRouteLanguage';
import { LocalizedLink } from '../LocalizedLink';
import { AnimatedUnderline } from '../common/AnimatedUnderline';

interface DailyBriefSectionProps {
  brief: DailyBrief;
}

/* function WordOfTheDayBox({ word, etymology, editorialDefinition }: { word: string; etymology: string; editorialDefinition: string }) {
  return (
    <div className="p-3 bg-sky-100/50 border border-sky-200/50 h-fit">
      <p className="text-xs text-sky-600 dark:text-sky-400 font-medium mb-1">Słowo dnia</p>
      <p className="text-lg font-semibold text-content-heading">{word}</p>
      <p className="text-xs text-content-subtle italic mb-2">{etymology}</p>
      <p className="text-xs text-content">{editorialDefinition}</p>
    </div>
  );
} */

export function DailyBriefSection({ brief }: DailyBriefSectionProps) {
  const { t } = useTranslation('common');
  const language = useRouteLanguage();
  const localeMap: Record<string, string> = { pl: 'pl-PL', en: 'en-US', de: 'de-DE' };

  const hour = new Date().getHours();

  const getTimeBasedGreeting = () => {
    if (hour >= 5 && hour < 18) return t('greetings.morning');
    if (hour >= 18 && hour < 22) return t('greetings.evening');
    return t('greetings.default');
  };

  const getTimeBasedVideo = () => {
    if (hour >= 5 && hour < 12) return '/videos/daily-brief-morning.webm';
    if (hour >= 12 && hour < 18) return '/videos/daily-brief-afternoon.webm';
    if (hour >= 18 && hour < 22) return '/videos/daily-brief-evening.webm';
    return '/videos/daily-brief-night.webm';
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    videoRef.current?.play();
    videoRef2.current?.play();
  };
  const handleMouseLeave = () => {
    videoRef.current?.pause();
    videoRef2.current?.pause();
  };

  const timeGreeting = getTimeBasedGreeting();
  const briefVideo = getTimeBasedVideo();
  const briefPoster = briefVideo.replace('.webm', '-poster.webp');
  const dateStr = new Date().toLocaleDateString(localeMap[language] || 'pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedDate = `${timeGreeting}, ${t('greetings.today')} ${dateStr}`;

  return (
    <SectionWrapper
      sectionId={`daily-brief-${brief.date}`}
      priority="high"
    >
      <LocalizedLink to="/brief" className="group group/underline block" data-tour="daily-brief">
        <div className="bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/40 transition-colors cursor-pointer p-6" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {/* Mobile layout */}
          <div className="md:hidden">
            <p className="text-2xl font-semibold text-content-heading">Daily Brief</p>
            {brief.greeting && (
              <p className="text-sm text-sky-700 dark:text-sky-300 mt-1">{brief.greeting}</p>
            )}
            <div className="relative overflow-hidden w-full aspect-video mt-4 transition-all duration-500 ease-out group-hover:scale-[1.02] group-hover:shadow-xl">
              <video
                ref={videoRef}
                poster={briefPoster}
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src={briefVideo} type="video/webm" />
              </video>
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: 'url(/grain.webp)',
                  backgroundRepeat: 'repeat',
                  backgroundSize: '256px 256px',
                  opacity: 0.25,
                  mixBlendMode: 'overlay',
                }}
              />
            </div>
            <h2 className="text-3xl font-bold text-content-heading mb-4 mt-4 leading-tight">
              <AnimatedUnderline>{brief.headline}</AnimatedUnderline>
            </h2>
            <p className="text-lg text-content leading-snug">
              {brief.lead}
            </p>
          </div>

          {/* ────────────────────────────────────────────────────────────────── */}

          {/* Desktop layout */}
          <div className="hidden md:grid md:grid-cols-[1fr_2fr] gap-6">
            {/* Left column: greeting + image */}
            <div className="border-r border-sky-200 dark:border-sky-800 pr-6">
              <p className="text-2xl font-semibold text-content-heading">Daily Brief</p>
              {brief.greeting && (
                <p className="text-sm text-sky-700 dark:text-sky-300 mt-1">{brief.greeting}</p>
              )}
              <div className="relative overflow-hidden w-full aspect-video mt-4 transition-all duration-500 ease-out group-hover:scale-[1.02] group-hover:shadow-xl">
                <video
                  ref={videoRef2}
                  poster={briefPoster}
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                >
                  <source src={briefVideo} type="video/webm" />
                </video>
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: 'url(/grain.webp)',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '256px 256px',
                    opacity: 0.25,
                    mixBlendMode: 'overlay',
                  }}
                />
              </div>
            </div>
            {/* Right column: date + headline + lead */}
            <div>
              <p className="text-sm text-sky-600 dark:text-sky-400 mb-2">{formattedDate}</p>
              <h2 className="text-4xl font-bold text-content-heading mb-4 leading-tight">
                <AnimatedUnderline>{brief.headline}</AnimatedUnderline>
              </h2>
              <p className="text-lg text-content leading-snug">
                {brief.lead}
              </p>
            </div>
          </div>
        </div>
      </LocalizedLink>
    </SectionWrapper>
  );
}
