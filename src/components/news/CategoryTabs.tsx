import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { LocalizedLink } from '@/components/LocalizedLink';
import { motion, AnimatePresence, useMotionValue, useTransform, animate, useInView } from 'framer-motion';
import { trackCategoryTabClicked } from '@/lib/analytics';
import type { Event } from '../../types/events';
import { getImageSource } from '@/lib/imageSource';
import { EventImage } from '../common/EventImage';
import { AnimateHeight } from '../common/AnimateHeight';
import { SectionWrapper } from '../common/SectionWrapper';
import { AnimatedUnderline } from '../common/AnimatedUnderline';
import { eventPath } from '../../utils/slug';
import { extractQuote } from '../../utils/text';
import { useWikipediaImages } from '../../hooks/useWikipediaImages';
import { FeaturedEventPreview } from './CategoryTabPreview';

const AUTO_ROTATE_INTERVAL = 8; // seconds

interface CategoryTabsProps {
  groups: Array<[string, Event[]]>;
}

export function CategoryTabs({ groups }: CategoryTabsProps) {
  const { t } = useTranslation('common');
  const [selectedTab, setSelectedTab] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<ReturnType<typeof animate> | null>(null);
  const progress = useMotionValue(0);
  const progressWidth = useTransform(progress, [0, 1], ['0%', '100%']);
  const isInView = useInView(containerRef, { amount: 0.3 });
  const selectedGroup = groups[selectedTab];

  // Preload Wikipedia images for quote authors across ALL tabs
  const allQuoteAuthors = useMemo(() => {
    const people: Event['metadata']['mentionedPeople'] = [];
    for (const [, events] of groups) {
      const featured = events[0];
      if (!featured?.summary || !featured.metadata?.mentionedPeople) continue;
      const quote = extractQuote(featured.summary);
      if (!quote) continue;
      const match = featured.metadata.mentionedPeople.find((p) => p.name === quote.autor);
      if (match) people.push(match);
    }
    return people;
  }, [groups]);

  const wikipediaImages = useWikipediaImages(allQuoteAuthors);

  // Preload actual image files once URLs are known
  useEffect(() => {
    for (const url of Object.values(wikipediaImages)) {
      const img = new Image();
      img.src = url;
    }
  }, [wikipediaImages]);

  // Desktop detection
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Auto-rotation progress animation
  const startProgress = useCallback((fromValue = 0) => {
    controlsRef.current?.stop();
    progress.set(fromValue);
    const remainingDuration = (1 - fromValue) * AUTO_ROTATE_INTERVAL;
    controlsRef.current = animate(progress, 1, {
      duration: remainingDuration,
      ease: 'linear',
      onComplete: () => {
        setSelectedTab((prev) => (prev + 1) % groups.length);
      },
    });
  }, [groups.length, progress]);

  useEffect(() => {
    if (!isAutoRotating || !isDesktop || !isInView) {
      controlsRef.current?.stop();
      return;
    }
    startProgress(0);
    return () => controlsRef.current?.stop();
  }, [selectedTab, isAutoRotating, isDesktop, isInView, startProgress]);

  // Hover: smooth deceleration to stop
  const handleMouseEnter = useCallback(() => {
    if (!isAutoRotating) return;
    controlsRef.current?.stop();
    const current = progress.get();
    controlsRef.current = animate(progress, Math.min(current + 0.03, 1), {
      duration: 0.6,
      ease: 'easeOut',
    });
  }, [isAutoRotating, progress]);

  const handleMouseLeave = useCallback(() => {
    if (!isAutoRotating) return;
    startProgress(progress.get());
  }, [isAutoRotating, progress, startProgress]);

  if (groups.length === 0) return null;

  return (
    <div ref={containerRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="grid grid-cols-2 md:flex md:items-center md:border-b border-divider">
        {groups.map(([_, events], index) => (
          <button
            key={index}
            onClick={() => {
              setIsAutoRotating(false);
              controlsRef.current?.stop();
              progress.set(0);
              setSelectedTab(index);
              const category = events[0]?.category || 'unknown';
              trackCategoryTabClicked({ category, is_auto_rotate: false });
            }}
            className={`relative text-xs md:text-sm px-4 py-3 md:px-6 md:py-4 transition-colors border-b md:border-b-0 border-r border-divider even:border-r-0 md:even:border-r md:last:border-r-0 ${
              selectedTab === index
                ? 'text-content-heading font-bold bg-surface'
                : 'text-content-subtle hover:text-content hover:bg-surface'
            }`}
          >
            {events[0]?.metadata?.ultraShortHeadline || t(`categories.${events[0]?.category}`, { defaultValue: events[0]?.category })}
            {selectedTab === index && !isAutoRotating && (
              <motion.div
                layoutId="tabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary hidden md:block"
                transition={{ duration: 0.2 }}
              />
            )}
            {selectedTab === index && isAutoRotating && (
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-primary hidden md:block"
                style={{ width: progressWidth }}
              />
            )}
          </button>
        ))}
      </div>

      <AnimateHeight>
        <AnimatePresence mode="wait" initial={false}>
          {selectedGroup && (
            <motion.div
              key={selectedTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <SectionWrapper
                sectionId={`category-tabs-${selectedTab}-${selectedGroup[1][0]?.id || 'empty'}`}
                priority="auto"
              >
                <div className="flex flex-col md:flex-row">
                  {selectedGroup[1][0] && (
                <LocalizedLink to={eventPath(selectedGroup[1][0])} className="group/underline flex gap-4 md:flex-[2] p-6 border-b md:border-b-0 md:border-r border-divider">
                  <article className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-80 md:shrink-0">
                      <div className="relative">
                        <EventImage
                          event={selectedGroup[1][0]}
                          className="w-full aspect-video object-cover"
                          groupHover
                        />
                        {getImageSource(selectedGroup[1][0]) && (
                          <span className="absolute bottom-2 left-2 text-[10px] text-content/80 bg-background/60 backdrop-blur-sm px-2 py-0.5 rounded z-10 max-w-[calc(100%-1rem)] truncate">
                            Źródło: {getImageSource(selectedGroup[1][0])}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-content-faint text-xs">{t(`categories.${selectedGroup[1][0].category}`, { defaultValue: selectedGroup[1][0].category })}</span>
                      <h4 className="text-content-heading font-semibold text-xl leading-tight">
                        <AnimatedUnderline>{selectedGroup[1][0].title}</AnimatedUnderline>
                      </h4>
                      <p className="text-sm text-content mt-2 leading-snug">
                        {selectedGroup[1][0].lead}
                      </p>
                    </div>
                  </article>
                </LocalizedLink>
              )}
              <div className="flex-1">
                {selectedGroup[1].slice(1).map((event) => (
                  <LocalizedLink
                    key={event.id}
                    to={eventPath(event)}
                    className="group/underline block p-6 hover:bg-surface transition-colors border-b border-divider"
                  >
                    <h4 className="text-content text-sm leading-tight">
                      <AnimatedUnderline>{event.title}</AnimatedUnderline>
                    </h4>
                  </LocalizedLink>
                ))}
                {selectedGroup[1][0] && (
                  <FeaturedEventPreview event={selectedGroup[1][0]} wikipediaImages={wikipediaImages} />
                )}
                </div>
              </div>
              </SectionWrapper>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimateHeight>
    </div>
  );
}
