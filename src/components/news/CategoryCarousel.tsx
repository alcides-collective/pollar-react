import { useRef } from 'react';
import type { Event } from '../../types/events';

interface CategoryCarouselProps {
  category: string;
  events: Event[];
}

export function CategoryCarousel({ category, events }: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="border-b border-zinc-200 last:border-b-0">
      <div className="flex items-center justify-between px-6 py-4 bg-zinc-50 border-b border-zinc-200">
        <h2 className="text-xl font-bold text-zinc-900">{category}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-zinc-300 hover:border-zinc-400 hover:bg-zinc-100 transition-colors"
            aria-label="Przewiń w lewo"
          >
            <i className="ri-arrow-left-s-line text-lg text-zinc-900"></i>
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-zinc-300 hover:border-zinc-400 hover:bg-zinc-100 transition-colors"
            aria-label="Przewiń w prawo"
          >
            <i className="ri-arrow-right-s-line text-lg text-zinc-900"></i>
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide"
      >
        {events.map((event) => (
          <article
            key={event.id}
            className="group cursor-pointer p-6 hover:bg-zinc-50 transition-colors shrink-0 w-full md:w-1/4 snap-start border-r border-zinc-200 last:border-r-0"
          >
            {event.imageUrl && (
              <img
                src={event.imageUrl}
                alt=""
                className="w-full aspect-video object-cover mb-4"
              />
            )}
            <h3 className="text-zinc-900 font-semibold leading-tight group-hover:underline">
              {event.title}
            </h3>
          </article>
        ))}
      </div>
    </div>
  );
}
