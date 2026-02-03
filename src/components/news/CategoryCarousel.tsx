import { useRef, useState, useLayoutEffect, useEffect, memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Event } from '../../types/events';
import { Button } from '@/components/ui/button';
import { hoverScale } from '@/lib/animations';
import { getImageSource } from '@/lib/imageSource';
import { EventImage } from '../common/EventImage';
import { SectionImageContext } from '../../hooks/useSectionImages';

interface CategoryCarouselProps {
  category: string;
  events: Event[];
}

// Memoized event card component with hover animation
const EventCarouselItem = memo(function EventCarouselItem({ event, hideBorder }: { event: Event; hideBorder?: boolean }) {
  const imageSource = getImageSource(event);
  return (
    <Link
      to={`/event/${event.id}`}
      className={`group p-6 hover:bg-zinc-50 transition-colors h-full block ${hideBorder ? '' : 'border-r border-zinc-200'}`}
    >
      <article>
        <div className="mb-4 relative">
          <EventImage
            event={event}
            className="w-full aspect-video object-cover"
            groupHover
          />
          {imageSource && (
            <span className="absolute bottom-2 left-2 text-[10px] text-zinc-700/80 bg-white/60 backdrop-blur-sm px-2 py-0.5 rounded max-w-[calc(100%-1rem)] truncate">
              Źródło: {imageSource}
            </span>
          )}
        </div>
        <h3 className="text-zinc-900 font-semibold leading-tight group-hover:underline">
          {event.title}
        </h3>
      </article>
    </Link>
  );
});

export function CategoryCarousel({ category, events }: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [itemWidth, setItemWidth] = useState<number | null>(null);
  const [containerHeight, setContainerHeight] = useState<number | null>(null);
  const [isMeasuring, setIsMeasuring] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Section ID for context (no blocking on image load)
  const sectionId = `carousel-${category}`;

  // Simple context - no blocking on image load
  const carouselContext = useMemo(() => ({
    sectionId,
    priority: 'low' as const,
    registerImage: () => {},
    markLoaded: () => {},
    markError: () => {},
  }), [sectionId]);

  // Calculate item width based on container and screen size
  useLayoutEffect(() => {
    const updateWidth = () => {
      const container = measureRef.current || scrollRef.current;
      if (container) {
        const containerWidth = container.offsetWidth;
        const mobile = window.innerWidth < 768;
        // Re-measure if mobile state changes
        if (mobile !== isMobile) {
          setIsMeasuring(true);
        }
        setIsMobile(mobile);
        const newWidth = mobile ? containerWidth : containerWidth / 4;
        setItemWidth(newWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [isMobile]);

  // Measure all items in hidden container to find tallest
  useLayoutEffect(() => {
    if (!measureRef.current || !isMeasuring || itemWidth === null) return;

    const items = measureRef.current.querySelectorAll('[data-measure-item]');
    let maxHeight = 0;

    items.forEach((item) => {
      const height = item.getBoundingClientRect().height;
      if (height > maxHeight) {
        maxHeight = height;
      }
    });

    if (maxHeight > 0) {
      setContainerHeight(maxHeight);
      setIsMeasuring(false);
    }
  }, [itemWidth, isMeasuring, events]);

  // Initialize virtualizer
  const virtualizer = useVirtualizer({
    count: events.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => itemWidth ?? 200,
    horizontal: true,
    overscan: 3,
  });

  // Force virtualizer to recalculate when itemWidth changes
  useEffect(() => {
    virtualizer.measure();
  }, [itemWidth, virtualizer]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current && itemWidth) {
      const currentScroll = scrollRef.current.scrollLeft;
      // On mobile scroll by 1, on desktop scroll by 4
      const scrollAmount = isMobile ? itemWidth : itemWidth * 4;
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

  // Render hidden measurement container while measuring
  if (isMeasuring) {
    return (
      <SectionImageContext.Provider value={carouselContext}>
        <div className="border-b border-zinc-200 last:border-b-0 relative">
          <div className="flex items-center justify-between px-6 py-4 bg-zinc-50 border-b border-zinc-200">
            <h2 className="text-xl font-bold text-zinc-900">{category}</h2>
          </div>
          <div
            ref={measureRef}
            aria-hidden="true"
            className="overflow-hidden"
            style={{
              height: 0,
              pointerEvents: 'none',
            }}
          >
            <div style={{ display: 'flex' }}>
              {events.map((event, index) => (
                <div
                  key={event.id}
                  data-measure-item
                  style={{ width: itemWidth ?? 300, flexShrink: 0 }}
                >
                  <EventCarouselItem event={event} hideBorder={isMobile || index % 4 === 3} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionImageContext.Provider>
    );
  }

  return (
    <SectionImageContext.Provider value={carouselContext}>
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
          style={{
            height: containerHeight ?? 200,
            scrollSnapType: isMobile ? 'x mandatory' : undefined,
          }}
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
              const hideBorder = isMobile || virtualItem.index % 4 === 3;
              return (
                <div
                  key={event.id}
                  data-index={virtualItem.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${itemWidth ?? 300}px`,
                    height: '100%',
                    transform: `translateX(${virtualItem.start}px)`,
                    scrollSnapAlign: isMobile ? 'start' : undefined,
                  }}
                >
                  <EventCarouselItem event={event} hideBorder={hideBorder} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SectionImageContext.Provider>
  );
}
