import { useState, useEffect, useRef, useCallback, type RefObject } from 'react';

interface UseActiveSectionOptions {
  threshold?: number;
  rootMargin?: string;
}

interface UseActiveSectionReturn<T> {
  activeIndex: number | null;
  sectionRefs: RefObject<(HTMLElement | null)[]>;
  setSectionRef: (index: number) => (el: HTMLElement | null) => void;
  activeItem: T | null;
}

export function useActiveSection<T>(
  items: T[],
  options: UseActiveSectionOptions = {}
): UseActiveSectionReturn<T> {
  const { threshold = 0.3, rootMargin = '-100px 0px -40% 0px' } = options;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  const setSectionRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      sectionRefs.current[index] = el;
    },
    []
  );

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const visibleSections = new Map<number, number>();

    sectionRefs.current.forEach((el, index) => {
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              visibleSections.set(index, entry.intersectionRatio);
            } else {
              visibleSections.delete(index);
            }

            // Find section with highest visibility
            if (visibleSections.size > 0) {
              let maxRatio = 0;
              let maxIndex = 0;
              visibleSections.forEach((ratio, idx) => {
                if (ratio > maxRatio) {
                  maxRatio = ratio;
                  maxIndex = idx;
                }
              });
              setActiveIndex(maxIndex);
            } else {
              setActiveIndex(null);
            }
          });
        },
        { threshold: [0, threshold, 0.5, 1], rootMargin }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [items.length, threshold, rootMargin]);

  const activeItem = activeIndex !== null ? items[activeIndex] ?? null : null;

  return { activeIndex, sectionRefs, setSectionRef, activeItem };
}
