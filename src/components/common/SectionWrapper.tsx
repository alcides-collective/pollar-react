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

  // Add minimum delay before showing to prevent flash
  useEffect(() => {
    if (isReady) {
      const timer = setTimeout(() => setShouldShow(true), minDisplayDelay);
      return () => clearTimeout(timer);
    }
  }, [isReady, minDisplayDelay]);

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
