import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { DailyBrief } from '../../types/brief';
import { scrollReveal } from '@/lib/animations';
import { GrainImage } from '../common/GrainImage';
import dailyBriefImg from '../../assets/images/daily/day.webp';

interface DailyBriefSectionProps {
  brief: DailyBrief;
}

function WordOfTheDayBox({ word, etymology, editorialDefinition }: { word: string; etymology: string; editorialDefinition: string }) {
  return (
    <div className="p-3 bg-sky-100/50 border border-sky-200/50 h-fit">
      <p className="text-xs text-sky-600 font-medium mb-1">Słowo dnia</p>
      <p className="text-lg font-semibold text-zinc-900">{word}</p>
      <p className="text-xs text-zinc-500 italic mb-2">{etymology}</p>
      <p className="text-xs text-zinc-600">{editorialDefinition}</p>
    </div>
  );
}

export function DailyBriefSection({ brief }: DailyBriefSectionProps) {
  const formattedDate = new Date(brief.date).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Link to="/brief" className="block group">
      <motion.div
        className="bg-sky-50 hover:bg-sky-100 transition-colors cursor-pointer"
        initial={scrollReveal.initial}
        whileInView={scrollReveal.whileInView}
        viewport={scrollReveal.viewport}
        transition={scrollReveal.transition}
      >
        <p className="text-sm text-sky-700 px-6 pt-6 pb-4">
          Daily Brief na {formattedDate}
          {brief.greeting && ` — ${brief.greeting}`}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 px-6 pb-6">
          <GrainImage
            src={dailyBriefImg}
            className="w-full aspect-video object-cover"
            hoverScale
          />
          <div className="flex gap-4">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-zinc-900 mb-4 leading-tight hover:underline">
                {brief.headline}
              </h2>
              <p className="text-lg text-zinc-700 leading-snug">
                {brief.lead}
              </p>
            </div>
            {brief.wordOfTheDay && (
              <div className="hidden md:block w-48 shrink-0">
                <WordOfTheDayBox
                  word={brief.wordOfTheDay.word}
                  etymology={brief.wordOfTheDay.etymology}
                  editorialDefinition={brief.wordOfTheDay.editorialDefinition}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
