import { create } from 'zustand';
import { trackChecklistItemCompleted } from '@/lib/analytics';
import type { OnboardingData } from '@/types/auth';

// ============ Types ============

export type ChecklistItemKey =
  | 'ai_companion'
  | 'follow_mp'
  | 'read_brief'
  | 'favorite_categories'
  | 'newsletter';

const CHECKLIST_KEYS: ChecklistItemKey[] = [
  'ai_companion',
  'follow_mp',
  'read_brief',
  'favorite_categories',
  'newsletter',
];

interface ChecklistItems {
  ai_companion: boolean;
  follow_mp: boolean;
  read_brief: boolean;
  favorite_categories: boolean;
  newsletter: boolean;
}

interface OnboardingState {
  // Tour (Phase A — anonymous)
  tourCompleted: boolean;
  tourSkipped: boolean;
  tourStartedAt: number | null;
  stepsViewed: string[];

  // Checklist (Phase B — authenticated)
  checklistItems: ChecklistItems;
  checklistDismissed: boolean;
}

interface OnboardingActions {
  startTour: () => void;
  completeTourStep: (stepName: string) => void;
  completeTour: () => void;
  skipTour: () => void;

  markChecklistItem: (key: ChecklistItemKey) => void;
  dismissChecklist: () => void;

  loadFromStorage: () => void;
  syncFromProfile: (onboarding?: OnboardingData | null) => void;
  reset: () => void;
}

type OnboardingStore = OnboardingState & OnboardingActions;

// ============ Persistence ============

const STORAGE_KEY = 'pollar-onboarding';

const DEFAULT_CHECKLIST: ChecklistItems = {
  ai_companion: false,
  follow_mp: false,
  read_brief: false,
  favorite_categories: false,
  newsletter: false,
};

function getDefaultState(): OnboardingState {
  return {
    tourCompleted: false,
    tourSkipped: false,
    tourStartedAt: null,
    stepsViewed: [],
    checklistItems: { ...DEFAULT_CHECKLIST },
    checklistDismissed: false,
  };
}

function saveToStorage(state: OnboardingState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function loadFromStorageSync(): OnboardingState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...getDefaultState(),
        ...parsed,
        checklistItems: { ...DEFAULT_CHECKLIST, ...parsed.checklistItems },
      };
    }
  } catch {}
  return getDefaultState();
}

// ============ Store ============

// Auto-hydrate from localStorage on module load
const initialState = loadFromStorageSync();

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  ...initialState,

  startTour: () => {
    const state = { ...getState(get), tourStartedAt: Date.now() };
    saveToStorage(state);
    set({ tourStartedAt: state.tourStartedAt });
  },

  completeTourStep: (stepName: string) => {
    const prev = get().stepsViewed;
    if (prev.includes(stepName)) return;
    const stepsViewed = [...prev, stepName];
    const state = { ...getState(get), stepsViewed };
    saveToStorage(state);
    set({ stepsViewed });
  },

  completeTour: () => {
    const state = { ...getState(get), tourCompleted: true };
    saveToStorage(state);
    set({ tourCompleted: true });
  },

  skipTour: () => {
    const state = { ...getState(get), tourSkipped: true };
    saveToStorage(state);
    set({ tourSkipped: true });
  },

  markChecklistItem: (key: ChecklistItemKey) => {
    const current = get().checklistItems;
    if (current[key]) return; // already marked
    const checklistItems = { ...current, [key]: true };
    const state = { ...getState(get), checklistItems };
    saveToStorage(state);
    set({ checklistItems });
    trackChecklistItemCompleted({ item_name: key });
  },

  dismissChecklist: () => {
    const state = { ...getState(get), checklistDismissed: true };
    saveToStorage(state);
    set({ checklistDismissed: true });
  },

  loadFromStorage: () => {
    const state = loadFromStorageSync();
    set(state);
  },

  syncFromProfile: (onboarding?: OnboardingData | null) => {
    if (!onboarding) return;
    const local = getState(get);
    // Prefer Firestore data, but merge with local
    const firestoreChecklist = onboarding.checklistItems ?? {};
    const merged: OnboardingState = {
      tourCompleted: onboarding.tourCompleted ?? local.tourCompleted,
      tourSkipped: onboarding.tourSkipped ?? local.tourSkipped,
      tourStartedAt: local.tourStartedAt,
      stepsViewed: onboarding.stepsViewed?.length
        ? onboarding.stepsViewed
        : local.stepsViewed,
      checklistItems: {
        ...DEFAULT_CHECKLIST,
        ...local.checklistItems,
        ai_companion: firestoreChecklist.ai_companion ?? local.checklistItems.ai_companion,
        follow_mp: firestoreChecklist.follow_mp ?? local.checklistItems.follow_mp,
        read_brief: firestoreChecklist.read_brief ?? local.checklistItems.read_brief,
        favorite_categories: firestoreChecklist.favorite_categories ?? local.checklistItems.favorite_categories,
        newsletter: firestoreChecklist.newsletter ?? local.checklistItems.newsletter,
      },
      checklistDismissed: onboarding.checklistDismissed ?? local.checklistDismissed,
    };
    saveToStorage(merged);
    set(merged);
  },

  reset: () => {
    const state = getDefaultState();
    saveToStorage(state);
    set(state);
  },
}));

// Helper to snapshot current state (excluding actions)
function getState(get: () => OnboardingStore): OnboardingState {
  const s = get();
  return {
    tourCompleted: s.tourCompleted,
    tourSkipped: s.tourSkipped,
    tourStartedAt: s.tourStartedAt,
    stepsViewed: s.stepsViewed,
    checklistItems: s.checklistItems,
    checklistDismissed: s.checklistDismissed,
  };
}

// ============ Convenience Hooks ============

export function useTourCompleted() {
  return useOnboardingStore((s) => s.tourCompleted);
}

export function useTourSkipped() {
  return useOnboardingStore((s) => s.tourSkipped);
}

export function useTourStartedAt() {
  return useOnboardingStore((s) => s.tourStartedAt);
}

export function useStepsViewed() {
  return useOnboardingStore((s) => s.stepsViewed);
}

export function useChecklistItems() {
  return useOnboardingStore((s) => s.checklistItems);
}

export function useChecklistDismissed() {
  return useOnboardingStore((s) => s.checklistDismissed);
}

export function useChecklistProgress(): { completed: number; total: number } {
  const items = useOnboardingStore((s) => s.checklistItems);
  const completed = CHECKLIST_KEYS.filter((k) => items[k]).length;
  return { completed, total: CHECKLIST_KEYS.length };
}

export function useShouldShowTour() {
  return useOnboardingStore((s) =>
    s.tourStartedAt !== null && !s.tourCompleted && !s.tourSkipped
  );
}
