import { Link } from 'react-router-dom';
import type { DailyBrief } from '../../types/brief';
import { GrainImage } from '../common/GrainImage';
import { SectionWrapper } from '../common/SectionWrapper';
import dailyBriefImg from '../../assets/images/daily/day.webp';

interface DailyBriefSectionProps {
  brief: DailyBrief;
}

/* function WordOfTheDayBox({ word, etymology, editorialDefinition }: { word: string; etymology: string; editorialDefinition: string }) {
  return (
    <div className="p-3 bg-sky-100/50 border border-sky-200/50 h-fit">
      <p className="text-xs text-sky-600 font-medium mb-1">Słowo dnia</p>
      <p className="text-lg font-semibold text-zinc-900">{word}</p>
      <p className="text-xs text-zinc-500 italic mb-2">{etymology}</p>
      <p className="text-xs text-zinc-600">{editorialDefinition}</p>
    </div>
  );
} */

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 18) return 'Dzień Dobry';
  if (hour >= 18 && hour < 22) return 'Dobry Wieczór';
  return 'Witaj';
}

export function DailyBriefSection({ brief }: DailyBriefSectionProps) {
  const timeGreeting = getTimeBasedGreeting();
  const formattedDate = new Date(brief.date).toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <SectionWrapper
      sectionId={`daily-brief-${brief.date}`}
      priority="low"
    >
      <Link to="/brief" className="group block">
        <div className="bg-sky-50 hover:bg-sky-100 transition-colors cursor-pointer p-6">
          {/* Mobile layout */}
          <div className="md:hidden">
            <p className="text-2xl font-semibold text-zinc-900">{timeGreeting}</p>
            {brief.greeting && (
              <p className="text-sm text-sky-700 mt-1">{brief.greeting}</p>
            )}
            <GrainImage
              src={dailyBriefImg}
              className="w-full aspect-video object-cover mt-4"
              groupHover
            />
            <h2 className="text-3xl font-bold text-zinc-900 mb-4 mt-4 leading-tight hover:underline">
              {brief.headline}
            </h2>
            <p className="text-lg text-zinc-700 leading-snug">
              {brief.lead}
            </p>
          </div>

          {/* Desktop layout */}
          <div className="hidden md:grid md:grid-cols-[1fr_2fr] gap-6">
            {/* Left column: greeting + image */}
            <div>
              <p className="text-2xl font-semibold text-zinc-900">{timeGreeting}</p>
              {brief.greeting && (
                <p className="text-sm text-sky-700 mt-1">{brief.greeting}</p>
              )}
              <GrainImage
                src={dailyBriefImg}
                className="w-full aspect-video object-cover mt-4"
                groupHover
              />
            </div>
            {/* Right column: date + headline + lead */}
            <div>
              <p className="text-sm text-sky-600 mb-2 text-right">{formattedDate}</p>
              <h2 className="text-3xl font-bold text-zinc-900 mb-4 leading-tight hover:underline">
                {brief.headline}
              </h2>
              <p className="text-lg text-zinc-700 leading-snug">
                {brief.lead}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </SectionWrapper>
  );
}
