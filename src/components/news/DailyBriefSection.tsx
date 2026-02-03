import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { DailyBrief } from '../../types/brief';
import { scrollReveal } from '@/lib/animations';
import dailyBriefImg from '../../assets/images/daily/day.webp';

interface DailyBriefSectionProps {
  brief: DailyBrief;
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
          <div className="overflow-hidden">
            <img
              src={dailyBriefImg}
              alt=""
              className="w-full aspect-video object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-zinc-900 mb-4 leading-tight hover:underline">
              {brief.headline}
            </h2>
            <p className="text-lg text-zinc-700 leading-snug">
              {brief.lead}
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
