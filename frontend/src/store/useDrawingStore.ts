// ============================================
// USE DRAWING STORE - Çizim Durumu Yönetimi
// Konum: frontend/src/store/useDrawingStore.ts
// Zustand ile global state yönetimi
// ============================================

import { create } from 'zustand';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface PipeSegment {
  id: string;
  start: Point3D;
  end: Point3D;
  startPoint: [number, number, number]; // Uyumluluk için
  endPoint: [number, number, number]; // Uyumluluk için
  diameter: string;
  length: number;
  material?: string;
  layer?: string;
  color?: number;
}

export interface ComponentInstance {
  id: string;
  type: 'valve' | 'meter' | 'boiler' | 'radiator' | 'pump' | 'filter' | 'expansion_tank' | 'pressure_gauge' | 'elbow';
  name?: string;
  position: Point3D;
  rotation: [number, number, number];
  scale?: number;
  layer?: string;
  properties?: Record<string, unknown>;
}

export interface SnapSettings {
  enabled: boolean;
  snapToEndpoints: boolean;
  snapToMidpoints: boolean;
  snapToIntersections: boolean;
  snapToPerpendicular: boolean;
  snapToCenter: boolean;
  snapToGrid: boolean;
  gridSize: number;
  snapTolerance: number;
  snapRadius: number;
}

export type DrawingMode = 'select' | 'pipe' | 'valve' | 'meter' | 'boiler' | 'delete';

// ============================================
// STORE INTERFACE
// ============================================

interface DrawingState {
  // Drawing Mode
  mode: DrawingMode;
  setMode: (mode: DrawingMode) => void;
  
  // Pipes
  pipes: PipeSegment[];
  addPipe: (pipe: PipeSegment) => void;
  removePipe: (id: string) => void;
  updatePipe: (id: string, updates: Partial<PipeSegment>) => void;
  
  // Components
  components: ComponentInstance[];
  addComponent: (component: ComponentInstance) => void;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, updates: Partial<ComponentInstance>) => void;
  
  // Selection
  selectedId: string | null;
  selectObject: (id: string | null) => void;
  
  // Temporary Drawing Points
  tempPoints: Point3D[];
  addTempPoint: (point: Point3D) => void;
  clearTempPoints: () => void;
  completePipe: () => void;
  
  // Snap Settings
  snapSettings: SnapSettings;
  toggleSnap: (key: keyof SnapSettings) => void;
  toggleSnapToGrid: () => void;
  updateSnapSettings: (settings: Partial<SnapSettings>) => void;
  
  // Grid Settings
  snapToGrid: boolean;
  gridSize: number;
  setGridSize: (size: number) => void;
  
  // Current Drawing Properties
  currentDiameter: string;
  setCurrentDiameter: (diameter: string) => void;
  currentLayer: string;
  setCurrentLayer: (layer: string) => void;
  currentColor: number;
  setCurrentColor: (color: number) => void;
  
  // History (Undo/Redo)
  history: { pipes: PipeSegment[]; components: ComponentInstance[] }[];
  historyIndex: number;
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  
  // Clear All
  clearAll: () => void;
}

// ============================================
// DEFAULT VALUES
// ============================================

const defaultSnapSettings: SnapSettings = {
  enabled: true,
  snapToEndpoints: true,
  snapToMidpoints: true,
  snapToIntersections: true,
  snapToPerpendicular: false,
  snapToCenter: true,
  snapToGrid: true,
  gridSize: 1,
  snapTolerance: 0.5,
  snapRadius: 0.5,
};

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useDrawingStore = create<DrawingState>((set, get) => ({
  // Drawing Mode
  mode: 'select',
  setMode: (mode) => set({ mode }),
  
  // Pipes
  pipes: [],
  addPipe: (pipe) => {
    get().saveToHistory();
    set((state) => ({ pipes: [...state.pipes, pipe] }));
  },
  removePipe: (id) => {
    get().saveToHistory();
    set((state) => ({ pipes: state.pipes.filter(p => p.id !== id) }));
  },
  updatePipe: (id, updates) => {
    set((state) => ({
      pipes: state.pipes.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  },
  
  // Components
  components: [],
  addComponent: (component) => {
    get().saveToHistory();
    set((state) => ({ components: [...state.components, component] }));
  },
  removeComponent: (id) => {
    get().saveToHistory();
    set((state) => ({ components: state.components.filter(c => c.id !== id) }));
  },
  updateComponent: (id, updates) => {
    set((state) => ({
      components: state.components.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  },
  
  // Selection
  selectedId: null,
  selectObject: (id) => set({ selectedId: id }),
  
  // Temporary Drawing Points
  tempPoints: [],
  addTempPoint: (point) => {
    set((state) => ({ tempPoints: [...state.tempPoints, point] }));
  },
  clearTempPoints: () => set({ tempPoints: [] }),
  completePipe: () => {
    const { tempPoints, currentDiameter, currentLayer, currentColor, addPipe } = get();
    
    if (tempPoints.length >= 2) {
      const start = tempPoints[0];
      const end = tempPoints[1];
      
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const dz = end.z - start.z;
      const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      const newPipe: PipeSegment = {
        id: `pipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        start,
        end,
        startPoint: [start.x, start.y, start.z],
        endPoint: [end.x, end.y, end.z],
        diameter: currentDiameter,
        length,
        layer: currentLayer,
        color: currentColor,
      };
      
      addPipe(newPipe);
      set({ tempPoints: [] });
    }
  },
  
  // Snap Settings
  snapSettings: defaultSnapSettings,
  toggleSnap: (key) => {
    set((state) => ({
      snapSettings: {
        ...state.snapSettings,
        [key]: !state.snapSettings[key as keyof SnapSettings]
      }
    }));
  },
  toggleSnapToGrid: () => {
    set((state) => ({
      snapSettings: {
        ...state.snapSettings,
        snapToGrid: !state.snapSettings.snapToGrid
      }
    }));
  },
  updateSnapSettings: (settings) => {
    set((state) => {
      const newSettings = { 
        ...state.snapSettings, 
        ...settings 
      };
      
      // snapRadius ve snapTolerance sync tut
      if (settings.snapRadius !== undefined) {
        newSettings.snapTolerance = settings.snapRadius;
      }
      if (settings.snapTolerance !== undefined) {
        newSettings.snapRadius = settings.snapTolerance;
      }
      
      return {
        snapSettings: newSettings
      };
    });
  },
  
  // Grid Settings
  snapToGrid: true,
  gridSize: 1,
  setGridSize: (size) => set({ gridSize: size }),
  
  // Current Drawing Properties
  currentDiameter: '1/2"',
  setCurrentDiameter: (diameter) => set({ currentDiameter: diameter }),
  currentLayer: '0',
  setCurrentLayer: (layer) => set({ currentLayer: layer }),
  currentColor: 7,
  setCurrentColor: (color) => set({ currentColor: color }),
  
  // History (Undo/Redo)
  history: [],
  historyIndex: -1,
  saveToHistory: () => {
    const { pipes, components, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ pipes: [...pipes], components: [...components] });
    
    // Max 50 history items
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      set({
        pipes: [...prevState.pipes],
        components: [...prevState.components],
        historyIndex: historyIndex - 1
      });
    } else if (historyIndex === 0) {
      set({ pipes: [], components: [], historyIndex: -1 });
    }
  },
  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      set({
        pipes: [...nextState.pipes],
        components: [...nextState.components],
        historyIndex: historyIndex + 1
      });
    }
  },
  
  // Clear All
  clearAll: () => {
    get().saveToHistory();
    set({
      pipes: [],
      components: [],
      tempPoints: [],
      mode: 'select'
    });
  },
}));
