// ============================================
// 1. src/store/useDrawingStore.ts - Gelişmiş Drawing Store
// ============================================
import { create } from 'zustand';

export type DrawingMode = 
  | 'select' 
  | 'pipe' 
  | 'elbow' 
  | 'valve' 
  | 'meter' 
  | 'boiler'
  | 'delete';

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface PipeSegment {
  id: string;
  start: Point3D;
  end: Point3D;
  diameter: string; // "1/2", "3/4", etc.
  material: string;
  length?: number;
}

export interface ComponentInstance {
  id: string;
  type: string;
  position: Point3D;
  rotation: [number, number, number];
  componentId: number;
  name: string;
  properties?: Record<string, any>;
}

interface DrawingState {
  mode: DrawingMode;
  pipes: PipeSegment[];
  components: ComponentInstance[];
  tempPoints: Point3D[];
  selectedId: string | null;
  snapToGrid: boolean;
  gridSize: number;
  currentDiameter: string;
  history: Array<{ pipes: PipeSegment[]; components: ComponentInstance[] }>;
  historyIndex: number;
  
  // Actions
  setMode: (mode: DrawingMode) => void;
  addTempPoint: (point: Point3D) => void;
  clearTempPoints: () => void;
  completePipe: () => void;
  addComponent: (component: ComponentInstance) => void;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, updates: Partial<ComponentInstance>) => void;
  removePipe: (id: string) => void;
  selectObject: (id: string | null) => void;
  toggleSnapToGrid: () => void;
  setGridSize: (size: number) => void;
  setCurrentDiameter: (diameter: string) => void;
  undo: () => void;
  redo: () => void;
  clearAll: () => void;
  saveToHistory: () => void;
}

export const useDrawingStore = create<DrawingState>((set, get) => ({
  mode: 'select',
  pipes: [],
  components: [],
  tempPoints: [],
  selectedId: null,
  snapToGrid: true,
  gridSize: 1,
  currentDiameter: '1/2"',
  history: [],
  historyIndex: -1,
  
  setMode: (mode) => set({ mode, tempPoints: [], selectedId: null }),
  
  addTempPoint: (point) => {
    const { tempPoints, snapToGrid, gridSize } = get();
    const snappedPoint = snapToGrid ? {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize,
      z: Math.round(point.z / gridSize) * gridSize,
    } : point;
    
    set({ tempPoints: [...tempPoints, snappedPoint] });
  },
  
  clearTempPoints: () => set({ tempPoints: [] }),
  
  completePipe: () => {
    const { tempPoints, pipes, currentDiameter } = get();
    if (tempPoints.length < 2) return;
    
    const newPipes: PipeSegment[] = [];
    for (let i = 0; i < tempPoints.length - 1; i++) {
      const start = tempPoints[i];
      const end = tempPoints[i + 1];
      const length = Math.sqrt(
        Math.pow(end.x - start.x, 2) +
        Math.pow(end.y - start.y, 2) +
        Math.pow(end.z - start.z, 2)
      );
      
      newPipes.push({
        id: `pipe_${Date.now()}_${i}`,
        start,
        end,
        diameter: currentDiameter,
        material: 'copper',
        length: parseFloat(length.toFixed(2))
      });
    }
    
    set({ 
      pipes: [...pipes, ...newPipes],
      tempPoints: []
    });
    get().saveToHistory();
  },
  
  addComponent: (component) => {
    set((state) => ({
      components: [...state.components, component]
    }));
    get().saveToHistory();
  },
  
  removeComponent: (id) => {
    set((state) => ({
      components: state.components.filter(c => c.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId
    }));
    get().saveToHistory();
  },
  
  updateComponent: (id, updates) => {
    set((state) => ({
      components: state.components.map(c =>
        c.id === id ? { ...c, ...updates } : c
      )
    }));
  },
  
  removePipe: (id) => {
    set((state) => ({
      pipes: state.pipes.filter(p => p.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId
    }));
    get().saveToHistory();
  },
  
  selectObject: (id) => set({ selectedId: id }),
  
  toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),
  
  setGridSize: (size) => set({ gridSize: size }),
  
  setCurrentDiameter: (diameter) => set({ currentDiameter: diameter }),
  
  saveToHistory: () => {
    const { pipes, components, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ 
      pipes: JSON.parse(JSON.stringify(pipes)), 
      components: JSON.parse(JSON.stringify(components))
    });
    set({ 
      history: newHistory.slice(-50), // Keep last 50 states
      historyIndex: newHistory.length - 1
    });
  },
  
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      set({ 
        pipes: prevState.pipes,
        components: prevState.components,
        historyIndex: historyIndex - 1
      });
    }
  },
  
  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      set({ 
        pipes: nextState.pipes,
        components: nextState.components,
        historyIndex: historyIndex + 1
      });
    }
  },
  
  clearAll: () => {
    set({ 
      pipes: [], 
      components: [], 
      tempPoints: [],
      selectedId: null,
      history: [],
      historyIndex: -1
    });
  }
}));