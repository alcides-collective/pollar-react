import { useRef, useEffect, useState, type ReactNode } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { SectionImageContext, useSectionImages } from '../../hooks/useSectionImages';

interface SectionWrapperProps {
  sectionId: string;
  priority?: 'high' | 'low' | 'auto';
  children: ReactNode;
  className?: string;
  animationVariants?: Variants;
  minDisplayDelay?: number;
  /** Maximum time to wait for images before showing section anyway (ms) */
  maxWaitTime?: number;
}

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export function SectionWrapper({
  sectionId,
  priority: propPriority = 'auto',
  children,
  className,
  animationVariants = defaultVariants,
  minDisplayDelay = 100,
  maxWaitTime = 3000,
}: SectionWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [detectedPriority, setDetectedPriority] = useState<'high' | 'low'>(
    propPriority === 'auto' ? 'low' : propPriority
  );
  const [shouldShow, setShouldShow] = useState(false);

  // Auto-detect above-fold sections on mount
  useEffect(() => {
    if (propPriority !== 'auto' || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // If section top is within initial viewport, it's above fold
    if (rect.top < viewportHeight) {
      setDetectedPriority('high');
    }
  }, [propPriority]);

  const finalPriority = propPriority === 'auto' ? detectedPriority : propPriority;
  const { contextValue, isReady } = useSectionImages(sectionId, finalPriority);

  // Add minimum delay before showing to prevent flash (only for non-high-priority)
  useEffect(() => {
    if (finalPriority === 'high') {
      setShouldShow(true);
      return;
    }
    if (isReady) {
      const timer = setTimeout(() => setShouldShow(true), minDisplayDelay);
      return () => clearTimeout(timer);
    }
  }, [isReady, minDisplayDelay, finalPriority]);

  // Fallback timeout - show section after maxWaitTime even if images haven't loaded
  useEffect(() => {
    if (finalPriority === 'high' || shouldShow) return;

    const fallbackTimer = setTimeout(() => {
      setShouldShow(true);
    }, maxWaitTime);

    return () => clearTimeout(fallbackTimer);
  }, [maxWaitTime, shouldShow, finalPriority]);

  // High-priority sections: render immediately, no animation delay
  if (finalPriority === 'high') {
    return (
      <SectionImageContext.Provider value={contextValue}>
        <div ref={containerRef} className={className}>
          {children}
        </div>
      </SectionImageContext.Provider>
    );
  }

  return (
    <SectionImageContext.Provider value={contextValue}>
      <div ref={containerRef} className={className}>
        <AnimatePresence mode="wait">
          {shouldShow ? (
            <motion.div
              key="content"
              initial="hidden"
              animate="visible"
              variants={animationVariants}
            >
              {children}
            </motion.div>
          ) : (
            <div
              key="placeholder"
              className="invisible"
              aria-hidden="true"
            >
              {/* Invisible placeholder to maintain layout */}
              {children}
            </div>
          )}
        </AnimatePresence>
      </div>
    </SectionImageContext.Provider>
  );
}
