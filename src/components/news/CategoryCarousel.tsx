import { useRef, useState, useLayoutEffect, useEffect, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Event } from '../../types/events';
import { Button } from '@/components/ui/button';
import { hoverScale } from '@/lib/animations';
import { getImageSource } from '@/lib/imageSource';
import { EventImage } from '../common/EventImage';
import { SectionImageContext } from '../../hooks/useSectionImages';
import { LocalizedLink } from '../LocalizedLink';
import { AnimatedUnderline } from '../common/AnimatedUnderline';

interface CategoryCarouselProps {
  category: string;
  events: Event[];
  variant?: 'carousel' | 'list' | 'sidebar';
}

// Memoized event card component with hover animation
const EventCarouselItem = memo(function EventCarouselItem({ event, hideBorder }: { event: Event; hideBorder?: boolean }) {
  const { t } = useTranslation('common');
  const imageSource = getImageSource(event);
  return (
    <LocalizedLink
      to={`/event/${event.id}`}
      className={`group/underline p-6 hover:bg-surface transition-colors h-full block ${hideBorder ? '' : 'border-r border-divider'}`}
    >
      <article>
        <div className="mb-4 relative">
          <EventImage
            event={event}
            className="w-full aspect-video object-cover"
            groupHover
            width={400}
            height={225}
          />
          {imageSource && (
            <span className="absolute bottom-2 left-2 text-[10px] text-content/80 bg-background/60 backdrop-blur-sm px-2 py-0.5 rounded max-w-[calc(100%-1rem)] truncate">
              {t('image.source', { source: imageSource })}
            </span>
          )}
        </div>
        <h3 className="text-content-heading font-semibold leading-tight">
          <AnimatedUnderline>{event.title}</AnimatedUnderline>
        </h3>
      </article>
    </LocalizedLink>
  );
});

export function CategoryCarousel({ category, events, variant = 'carousel' }: CategoryCarouselProps) {
  const { t } = useTranslation('common');
  const scrollRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [itemWidth, setItemWidth] = useState<number | null>(null);
  const [containerHeight, setContainerHeight] = useState<number | null>(null);
  const [isMeasuring, setIsMeasuring] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Translate category name
  const translatedCategory = t(`categories.${category}`, { defaultValue: category });

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
  // sidebar variant always shows 1 item (like mobile)
  const isSidebar = variant === 'sidebar';

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
        // Sidebar always shows 1 item, mobile shows 1, desktop shows 4
        const newWidth = (isSidebar || mobile) ? containerWidth : containerWidth / 4;
        setItemWidth(newWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [isMobile, isSidebar]);

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
      // Sidebar/mobile scroll by 1, desktop scroll by 4
      const scrollAmount = (isSidebar || isMobile) ? itemWidth : itemWidth * 4;
      scrollRef.current.scrollTo({
        left: direction === 'left'
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // List variant - simple vertical list (after all hooks)
  if (variant === 'list') {
    if (events.length === 0) return null;
    return (
      <div className="divide-y divide-divider">
        {events.map(event => (
          <EventCarouselItem key={event.id} event={event} hideBorder />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return null;
  }

  // Render hidden measurement container while measuring
  if (isMeasuring) {
    return (
      <SectionImageContext.Provider value={carouselContext}>
        <div className="border-b border-divider relative">
          <div className="flex items-center justify-between px-6 py-4 bg-surface border-b border-divider">
            <h2 className="text-xl font-bold text-content-heading">{translatedCategory}</h2>
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
                  <EventCarouselItem event={event} hideBorder={isSidebar || isMobile || index % 4 === 3} />
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
      <div className="border-b border-divider">
        <div className="flex items-center justify-between px-6 py-4 bg-surface border-b border-divider">
          <h2 className="text-xl font-bold text-content-heading">{translatedCategory}</h2>
          <div className="flex gap-2">
            <motion.div {...hoverScale}>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => scroll('left')}
                className="rounded-full border-divider shadow-none flex items-center justify-center"
                aria-label={t('actions.scrollLeft')}
              >
                <i className="ri-arrow-left-s-line text-base text-content"></i>
              </Button>
            </motion.div>
            <motion.div {...hoverScale}>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => scroll('right')}
                className="rounded-full border-divider shadow-none flex items-center justify-center"
                aria-label={t('actions.scrollRight')}
              >
                <i className="ri-arrow-right-s-line text-base text-content"></i>
              </Button>
            </motion.div>
          </div>
        </div>
        <div
          ref={scrollRef}
          className="overflow-x-auto scroll-smooth scrollbar-hide"
          style={{
            height: containerHeight ?? 200,
            scrollSnapType: (isSidebar || isMobile) ? 'x mandatory' : undefined,
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
              const hideBorder = isSidebar || isMobile || virtualItem.index % 4 === 3;
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
                    scrollSnapAlign: (isSidebar || isMobile) ? 'start' : undefined,
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
