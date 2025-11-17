// ============================================
// 1. src/store/useBlueprintStore.ts - Klavuz Store
// ============================================
import { create } from 'zustand';

export interface Blueprint {
  id: string;
  name: string;
  type: 'image' | 'dxf' | 'dwg';
  url: string;
  width: number;
  height: number;
  scale: number;
  position: { x: number; y: number; z: number };
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
}

interface BlueprintState {
  blueprints: Blueprint[];
  selectedBlueprintId: string | null;
  
  // Actions
  addBlueprint: (blueprint: Blueprint) => void;
  removeBlueprint: (id: string) => void;
  updateBlueprint: (id: string, updates: Partial<Blueprint>) => void;
  selectBlueprint: (id: string | null) => void;
  toggleVisibility: (id: string) => void;
  toggleLock: (id: string) => void;
  setScale: (id: string, scale: number) => void;
  setOpacity: (id: string, opacity: number) => void;
  setPosition: (id: string, position: { x: number; y: number; z: number }) => void;
  setRotation: (id: string, rotation: number) => void;
  clearAllBlueprints: () => void;
}

export const useBlueprintStore = create<BlueprintState>((set) => ({
  blueprints: [],
  selectedBlueprintId: null,
  
  addBlueprint: (blueprint) => set((state) => ({
    blueprints: [...state.blueprints, blueprint]
  })),
  
  removeBlueprint: (id) => set((state) => ({
    blueprints: state.blueprints.filter(b => b.id !== id),
    selectedBlueprintId: state.selectedBlueprintId === id ? null : state.selectedBlueprintId
  })),
  
  updateBlueprint: (id, updates) => set((state) => ({
    blueprints: state.blueprints.map(b =>
      b.id === id ? { ...b, ...updates } : b
    )
  })),
  
  selectBlueprint: (id) => set({ selectedBlueprintId: id }),
  
  toggleVisibility: (id) => set((state) => ({
    blueprints: state.blueprints.map(b =>
      b.id === id ? { ...b, visible: !b.visible } : b
    )
  })),
  
  toggleLock: (id) => set((state) => ({
    blueprints: state.blueprints.map(b =>
      b.id === id ? { ...b, locked: !b.locked } : b
    )
  })),
  
  setScale: (id, scale) => set((state) => ({
    blueprints: state.blueprints.map(b =>
      b.id === id ? { ...b, scale } : b
    )
  })),
  
  setOpacity: (id, opacity) => set((state) => ({
    blueprints: state.blueprints.map(b =>
      b.id === id ? { ...b, opacity } : b
    )
  })),
  
  setPosition: (id, position) => set((state) => ({
    blueprints: state.blueprints.map(b =>
      b.id === id ? { ...b, position } : b
    )
  })),
  
  setRotation: (id, rotation) => set((state) => ({
    blueprints: state.blueprints.map(b =>
      b.id === id ? { ...b, rotation } : b
    )
  })),
  
  clearAllBlueprints: () => set({
    blueprints: [],
    selectedBlueprintId: null
  })
}));