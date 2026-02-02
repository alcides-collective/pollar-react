import type { Event } from '../../types/events';

interface DoubleHeroSectionProps {
  events: Event[];
  reversed?: boolean;
}

export function DoubleHeroSection({ events, reversed = false }: DoubleHeroSectionProps) {
  if (events.length < 2) return null;

  const gridCols = reversed ? 'md:grid-cols-[2fr_1fr]' : 'md:grid-cols-[1fr_2fr]';
  const [leftEvent, rightEvent] = events;
  const leftIsLarger = reversed;
  const rightIsLarger = !reversed;

  return (
    <div className={`grid grid-cols-1 ${gridCols}`}>
      <article className="group cursor-pointer p-6 hover:bg-zinc-50 transition-colors border-r border-zinc-200">
        {leftEvent.imageUrl && (
          <img
            src={leftEvent.imageUrl}
            alt=""
            className="w-full aspect-video object-cover mb-4"
          />
        )}
        <span className="text-zinc-400 text-xs">{leftEvent.category}</span>
        <h3 className={`text-zinc-900 font-semibold leading-tight group-hover:underline ${leftIsLarger ? 'text-2xl' : 'text-xl'}`}>
          {leftEvent.title}
        </h3>
        <p className={`text-zinc-600 leading-snug ${leftIsLarger ? 'mt-3' : 'mt-2 text-sm'}`}>
          {leftEvent.lead}
        </p>
      </article>

      <article className="group cursor-pointer p-6 hover:bg-zinc-50 transition-colors">
        {rightEvent.imageUrl && (
          <img
            src={rightEvent.imageUrl}
            alt=""
            className="w-full aspect-video object-cover mb-4"
          />
        )}
        <span className="text-zinc-400 text-xs">{rightEvent.category}</span>
        <h3 className={`text-zinc-900 font-semibold leading-tight group-hover:underline ${rightIsLarger ? 'text-2xl' : 'text-xl'}`}>
          {rightEvent.title}
        </h3>
        <p className={`text-zinc-600 leading-snug ${rightIsLarger ? 'mt-3' : 'mt-2 text-sm'}`}>
          {rightEvent.lead}
        </p>
      </article>
    </div>
  );
}
