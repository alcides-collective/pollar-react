import { create } from 'zustand';

interface ImageState {
  loaded: boolean;
  error: boolean;
}

interface SectionState {
  images: Record<string, ImageState>;
  priority: 'high' | 'low';
  allLoaded: boolean;
}

interface ImageLoadingState {
  sections: Record<string, SectionState>;
}

interface ImageLoadingActions {
  registerSection: (sectionId: string, priority: 'high' | 'low') => void;
  unregisterSection: (sectionId: string) => void;
  registerImage: (sectionId: string, imageId: string) => void;
  markImageLoaded: (sectionId: string, imageId: string) => void;
  markImageError: (sectionId: string, imageId: string) => void;
}

type ImageLoadingStore = ImageLoadingState & ImageLoadingActions;

function checkAllLoaded(images: Record<string, ImageState>): boolean {
  const imageStates = Object.values(images);
  if (imageStates.length === 0) return true;
  return imageStates.every((img) => img.loaded || img.error);
}

export const useImageLoadingStore = create<ImageLoadingStore>((set, get) => ({
  sections: {},

  registerSection: (sectionId, priority) => {
    const current = get().sections[sectionId];
    if (current) return;

    set((state) => ({
      sections: {
        ...state.sections,
        [sectionId]: {
          images: {},
          priority,
          allLoaded: true,
        },
      },
    }));
  },

  unregisterSection: (sectionId) => {
    set((state) => {
      const { [sectionId]: _, ...rest } = state.sections;
      return { sections: rest };
    });
  },

  registerImage: (sectionId, imageId) => {
    set((state) => {
      const section = state.sections[sectionId];
      if (!section || section.images[imageId]) return state;

      return {
        sections: {
          ...state.sections,
          [sectionId]: {
            ...section,
            images: {
              ...section.images,
              [imageId]: { loaded: false, error: false },
            },
            allLoaded: false,
          },
        },
      };
    });
  },

  markImageLoaded: (sectionId, imageId) => {
    set((state) => {
      const section = state.sections[sectionId];
      if (!section) return state;

      const updatedImages = {
        ...section.images,
        [imageId]: { loaded: true, error: false },
      };

      return {
        sections: {
          ...state.sections,
          [sectionId]: {
            ...section,
            images: updatedImages,
            allLoaded: checkAllLoaded(updatedImages),
          },
        },
      };
    });
  },

  markImageError: (sectionId, imageId) => {
    set((state) => {
      const section = state.sections[sectionId];
      if (!section) return state;

      const updatedImages = {
        ...section.images,
        [imageId]: { loaded: false, error: true },
      };

      return {
        sections: {
          ...state.sections,
          [sectionId]: {
            ...section,
            images: updatedImages,
            allLoaded: checkAllLoaded(updatedImages),
          },
        },
      };
    });
  },
}));

// Convenience hooks
export function useSectionReady(sectionId: string) {
  return useImageLoadingStore((state) => state.sections[sectionId]?.allLoaded ?? true);
}

export function useSectionPriority(sectionId: string) {
  return useImageLoadingStore((state) => state.sections[sectionId]?.priority ?? 'low');
}

export function useAllSectionsReady() {
  return useImageLoadingStore((state) => {
    const sectionIds = Object.keys(state.sections);
    if (sectionIds.length === 0) return false;
    return sectionIds.every((id) => state.sections[id].allLoaded);
  });
}
