import { useRef, useState, useLayoutEffect, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Event } from '../../types/events';
import { Button } from '@/components/ui/button';
import { hoverScale } from '@/lib/animations';

interface CategoryCarouselProps {
  category: string;
  events: Event[];
}

// Memoized event card component with hover animation
const EventCarouselItem = memo(function EventCarouselItem({ event }: { event: Event }) {
  return (
    <Link
      to={`/event/${event.id}`}
      className="group p-6 hover:bg-zinc-50 transition-colors h-full block border-r border-zinc-200"
    >
      <article>
        {event.imageUrl && (
          <div className="overflow-hidden mb-4">
            <img
              src={event.imageUrl}
              alt=""
              className="w-full aspect-video object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
              loading="lazy"
            />
          </div>
        )}
        <h3 className="text-zinc-900 font-semibold leading-tight group-hover:underline">
          {event.title}
        </h3>
      </article>
    </Link>
  );
});

export function CategoryCarousel({ category, events }: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [itemWidth, setItemWidth] = useState(300);
  const [containerHeight, setContainerHeight] = useState(280);

  // Calculate item width based on container and screen size
  useLayoutEffect(() => {
    const updateWidth = () => {
      if (scrollRef.current) {
        const containerWidth = scrollRef.current.offsetWidth;
        const isMobile = window.innerWidth < 768;
        // On mobile: full width, on desktop: 1/4 of container
        const newWidth = isMobile ? containerWidth : Math.floor(containerWidth / 4);
        setItemWidth(newWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Initialize virtualizer
  const virtualizer = useVirtualizer({
    count: events.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => itemWidth,
    horizontal: true,
    overscan: 3, // Render 3 extra items on each side for smooth scrolling
  });

  // Force virtualizer to recalculate when itemWidth changes
  useEffect(() => {
    virtualizer.measure();
  }, [itemWidth, virtualizer]);

  // Update container height based on first item (after render)
  useEffect(() => {
    if (scrollRef.current) {
      const firstItem = scrollRef.current.querySelector('[data-index="0"]');
      if (firstItem) {
        const height = firstItem.getBoundingClientRect().height;
        if (height > 0) {
          setContainerHeight(height);
        }
      }
    }
  }, [events, itemWidth]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const currentScroll = scrollRef.current.scrollLeft;
      const scrollAmount = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: direction === 'left'
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-zinc-200 last:border-b-0">
      <div className="flex items-center justify-between px-6 py-4 bg-zinc-50 border-b border-zinc-200">
        <h2 className="text-xl font-bold text-zinc-900">{category}</h2>
        <div className="flex gap-2">
          <motion.div {...hoverScale}>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full"
              aria-label="Przewiń w lewo"
            >
              <i className="ri-arrow-left-s-line text-lg text-zinc-900"></i>
            </Button>
          </motion.div>
          <motion.div {...hoverScale}>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full"
              aria-label="Przewiń w prawo"
            >
              <i className="ri-arrow-right-s-line text-lg text-zinc-900"></i>
            </Button>
          </motion.div>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="overflow-x-auto scroll-smooth scrollbar-hide"
        style={{ height: containerHeight }}
      >
        <div
          style={{
            width: `${virtualizer.getTotalSize()}px`,
            height: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const event = events[virtualItem.index];
            return (
              <div
                key={event.id}
                data-index={virtualItem.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: `${itemWidth}px`,
                  height: '100%',
                  transform: `translateX(${virtualItem.start}px)`,
                }}
              >
                <EventCarouselItem event={event} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
