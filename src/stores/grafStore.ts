import { create } from 'zustand';
import type { ConnectionType, VisualizationMode } from '@/types/graph';

interface GrafState {
  enabledConnections: Record<ConnectionType, boolean>;
  mode: VisualizationMode;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  highlightedNodeIds: Set<string>;
  minTrendingScore: number;
  selectedCategories: string[];
  showControls: boolean;
  showLegend: boolean;
}

interface GrafActions {
  toggleConnection: (type: ConnectionType) => void;
  setMode: (mode: VisualizationMode) => void;
  selectNode: (nodeId: string | null) => void;
  hoverNode: (nodeId: string | null, connectedIds?: string[]) => void;
  setMinTrendingScore: (score: number) => void;
  toggleCategory: (category: string) => void;
  toggleControls: () => void;
  toggleLegend: () => void;
  setShowControls: (show: boolean) => void;
  setShowLegend: (show: boolean) => void;
  resetFilters: () => void;
}

type GrafStore = GrafState & GrafActions;

const initialState: GrafState = {
  enabledConnections: {
    people: true,
    countries: true,
    sources: true,
    category: false,
  },
  mode: 'force',
  selectedNodeId: null,
  hoveredNodeId: null,
  highlightedNodeIds: new Set(),
  minTrendingScore: 0,
  selectedCategories: [],
  showControls: true,
  showLegend: true,
};

export const useGrafStore = create<GrafStore>((set) => ({
  ...initialState,

  toggleConnection: (type) =>
    set((state) => ({
      enabledConnections: {
        ...state.enabledConnections,
        [type]: !state.enabledConnections[type],
      },
    })),

  setMode: (mode) => set({ mode }),

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  hoverNode: (nodeId, connectedIds = []) =>
    set({
      hoveredNodeId: nodeId,
      highlightedNodeIds: new Set(nodeId ? [nodeId, ...connectedIds] : []),
    }),

  setMinTrendingScore: (score) => set({ minTrendingScore: score }),

  toggleCategory: (category) =>
    set((state) => ({
      selectedCategories: state.selectedCategories.includes(category)
        ? state.selectedCategories.filter((c) => c !== category)
        : [...state.selectedCategories, category],
    })),

  toggleControls: () => set((state) => ({ showControls: !state.showControls })),

  toggleLegend: () => set((state) => ({ showLegend: !state.showLegend })),

  setShowControls: (show: boolean) => set({ showControls: show }),

  setShowLegend: (show: boolean) => set({ showLegend: show }),

  resetFilters: () =>
    set({
      enabledConnections: initialState.enabledConnections,
      minTrendingScore: 0,
      selectedCategories: [],
    }),
}));

// Convenience hooks
export function useGrafMode() {
  return useGrafStore((state) => state.mode);
}

export function useGrafSelectedNode() {
  return useGrafStore((state) => state.selectedNodeId);
}

export function useGrafEnabledConnections() {
  return useGrafStore((state) => state.enabledConnections);
}
