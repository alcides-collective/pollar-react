import { createContext, useContext, useEffect, useRef, useMemo } from 'react';
import { useImageLoadingStore, useSectionReady } from '../stores/imageLoadingStore';

interface SectionImageContextValue {
  sectionId: string;
  priority: 'high' | 'low';
  registerImage: (imageId: string) => void;
  markLoaded: (imageId: string) => void;
  markError: (imageId: string) => void;
}

export const SectionImageContext = createContext<SectionImageContextValue | null>(null);

/**
 * Hook for section components to create image tracking context
 */
export function useSectionImages(sectionId: string, priority: 'high' | 'low' = 'low') {
  // Select actions individually for stable references
  const registerSection = useImageLoadingStore((s) => s.registerSection);
  const unregisterSection = useImageLoadingStore((s) => s.unregisterSection);
  const registerImage = useImageLoadingStore((s) => s.registerImage);
  const markImageLoaded = useImageLoadingStore((s) => s.markImageLoaded);
  const markImageError = useImageLoadingStore((s) => s.markImageError);
  const isReady = useSectionReady(sectionId);

  useEffect(() => {
    registerSection(sectionId, priority);
    return () => unregisterSection(sectionId);
  }, [sectionId, priority, registerSection, unregisterSection]);

  const contextValue = useMemo<SectionImageContextValue>(
    () => ({
      sectionId,
      priority,
      registerImage: (imageId) => registerImage(sectionId, imageId),
      markLoaded: (imageId) => markImageLoaded(sectionId, imageId),
      markError: (imageId) => markImageError(sectionId, imageId),
    }),
    [sectionId, priority, registerImage, markImageLoaded, markImageError]
  );

  return { contextValue, isReady };
}

/**
 * Hook for image components to report loading status
 */
export function useImageInSection(imageId: string) {
  const context = useContext(SectionImageContext);
  const registeredRef = useRef(false);

  useEffect(() => {
    if (context && !registeredRef.current) {
      context.registerImage(imageId);
      registeredRef.current = true;
    }
  }, [context, imageId]);

  // Return no-op functions if not in a section context
  if (!context) {
    return {
      priority: 'low' as const,
      onLoad: () => {},
      onError: () => {},
    };
  }

  return {
    priority: context.priority,
    onLoad: () => context.markLoaded(imageId),
    onError: () => context.markError(imageId),
  };
}
