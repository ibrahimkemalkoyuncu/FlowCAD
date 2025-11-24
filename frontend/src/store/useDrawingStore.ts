// ============================================
// DRAWING STORE - Ana Çizim State Yönetimi
// Konum: frontend/src/store/useDrawingStore.ts
// Zustand kullanarak çizim state'ini yönetir
// ============================================

import { create } from 'zustand';

// ============================================
// TYPES & INTERFACES
// ============================================

/**
 * 3D uzayda bir nokta
 */
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Boru segmenti
 */
export interface PipeSegment {
  id: string;
  start: Point3D;
  end: Point3D;
  diameter: string;
  length?: number;
  material?: string;
  selected?: boolean;
}

/**
 * Component instance (vana, sayaç, kombi vb.)
 */
export interface ComponentInstance {
  id: string;
  type: string;
  position: Point3D;
  rotation: [number, number, number];
  componentId: number;
  name: string;
  selected?: boolean;
}

/**
 * Snap ayarları
 */
export interface SnapSettings {
  enabled: boolean;
  snapToEndpoints: boolean;
  snapToMidpoints: boolean;
  snapToIntersections: boolean;
  snapToCenter: boolean;
  snapToGrid: boolean;
  snapToPerpendicular: boolean;
  snapRadius: number;
  snapTolerance: number;
  gridSize: number;
}

/**
 * Çizim modları
 */
export type DrawingMode = 'select' | 'pipe' | 'valve' | 'meter' | 'boiler' | 'elbow' | 'delete';

// ============================================
// STATE INTERFACE
// ============================================

interface DrawingState {
  // State
  mode: DrawingMode;
  pipes: PipeSegment[];
  components: ComponentInstance[];
  tempPoints: Point3D[];
  selectedId: string | null;
  currentDiameter: string;
  snapSettings: SnapSettings;
  gridSize: number;
  snapToGrid: boolean;
  history: {
    pipes: PipeSegment[][];
    components: ComponentInstance[][];
  };
  historyIndex: number;

  // Actions - Mode
  setMode: (mode: DrawingMode) => void;

  // Actions - Pipes
  addPipe: (pipe: PipeSegment) => void;
  removePipe: (id: string) => void;
  addTempPoint: (point: Point3D) => void;
  clearTempPoints: () => void;
  completePipe: () => void;
  setCurrentDiameter: (diameter: string) => void;

  // Actions - Components
  addComponent: (component: ComponentInstance) => void;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, updates: Partial<ComponentInstance>) => void;

  // Actions - Selection
  selectObject: (id: string | null) => void;
  deleteSelected: () => void;

  // Actions - Snap
  toggleSnap: (key: keyof SnapSettings) => void;
  updateSnapSettings: (settings: Partial<SnapSettings>) => void;

  // Actions - History
  undo: () => void;
  redo: () => void;
  clearAll: () => void;
  saveHistory: () => void;
}

// ============================================
// DEFAULT VALUES
// ============================================

const defaultSnapSettings: SnapSettings = {
  enabled: true,
  snapToEndpoints: true,
  snapToMidpoints: true,
  snapToIntersections: true,
  snapToCenter: true,
  snapToGrid: true,
  snapToPerpendicular: false,
  snapRadius: 0.5,
  snapTolerance: 0.5,
  gridSize: 1
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * İki nokta arası mesafeyi hesaplar
 */
const calculateDistance = (p1: Point3D, p2: Point3D): number => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

// ============================================
// STORE CREATION
// ============================================

export const useDrawingStore = create<DrawingState>((set, get) => ({
  // ============================================
  // INITIAL STATE
  // ============================================
  
  mode: 'select',
  pipes: [],
  components: [],
  tempPoints: [],
  selectedId: null,
  currentDiameter: '1/2"',
  snapSettings: defaultSnapSettings,
  gridSize: 1,
  snapToGrid: true,
  history: {
    pipes: [],
    components: []
  },
  historyIndex: -1,

  // ============================================
  // MODE ACTIONS
  // ============================================

  /**
   * Çizim modunu değiştirir
   */
  setMode: (mode) => set({ mode }),

  // ============================================
  // PIPE ACTIONS
  // ============================================

  /**
   * Yeni boru ekler
   */
  addPipe: (pipe) => set((state) => {
    const newPipes = [...state.pipes, pipe];
    return { pipes: newPipes };
  }),

  /**
   * Boru siler
   */
  removePipe: (id) => set((state) => ({
    pipes: state.pipes.filter(p => p.id !== id),
    selectedId: state.selectedId === id ? null : state.selectedId
  })),

  /**
   * Geçici nokta ekler (boru çizimi için)
   */
  addTempPoint: (point) => set((state) => ({
    tempPoints: [...state.tempPoints, point]
  })),

  /**
   * Geçici noktaları temizler
   */
  clearTempPoints: () => set({ tempPoints: [] }),

  /**
   * Boru çizimini tamamlar (2 noktadan boru oluşturur)
   */
  completePipe: () => {
    const state = get();
    if (state.tempPoints.length < 2) return;

    const [start, end] = state.tempPoints;
    const length = calculateDistance(start, end);
    
    const newPipe: PipeSegment = {
      id: `pipe_${Date.now()}`,
      start,
      end,
      diameter: state.currentDiameter,
      length,
      selected: false
    };

    set((state) => ({
      pipes: [...state.pipes, newPipe],
      tempPoints: []
    }));

    get().saveHistory();
  },

  /**
   * Aktif boru çapını ayarlar
   */
  setCurrentDiameter: (diameter) => set({ currentDiameter: diameter }),

  // ============================================
  // COMPONENT ACTIONS
  // ============================================

  /**
   * Yeni component ekler (vana, sayaç vb.)
   */
  addComponent: (component) => set((state) => {
    const newComponents = [...state.components, component];
    get().saveHistory();
    return { components: newComponents };
  }),

  /**
   * Component siler
   */
  removeComponent: (id) => set((state) => ({
    components: state.components.filter(c => c.id !== id),
    selectedId: state.selectedId === id ? null : state.selectedId
  })),

  /**
   * Component'i günceller
   */
  updateComponent: (id, updates) => set((state) => ({
    components: state.components.map(c =>
      c.id === id ? { ...c, ...updates } : c
    )
  })),

  // ============================================
  // SELECTION ACTIONS
  // ============================================

  /**
   * Obje seçer/seçimi kaldırır
   */
  selectObject: (id) => set({ selectedId: id }),

  /**
   * Seçili objeyi siler
   */
  deleteSelected: () => {
    const state = get();
    if (!state.selectedId) return;

    set((state) => ({
      pipes: state.pipes.filter(p => p.id !== state.selectedId),
      components: state.components.filter(c => c.id !== state.selectedId),
      selectedId: null
    }));

    get().saveHistory();
  },

  // ============================================
  // SNAP ACTIONS
  // ============================================

  /**
   * Snap ayarını toggle eder
   */
  toggleSnap: (key) => set((state) => ({
    snapSettings: {
      ...state.snapSettings,
      [key]: !state.snapSettings[key]
    }
  })),

  /**
   * Snap ayarlarını toplu günceller
   */
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

  // ============================================
  // HISTORY ACTIONS
  // ============================================

  /**
   * Geçmişe yeni durum ekler
   */
  saveHistory: () => {
    const state = get();
    const newHistory = {
      pipes: [
        ...state.history.pipes.slice(0, state.historyIndex + 1),
        [...state.pipes]
      ],
      components: [
        ...state.history.components.slice(0, state.historyIndex + 1),
        [...state.components]
      ]
    };

    set({
      history: newHistory,
      historyIndex: state.historyIndex + 1
    });
  },

  /**
   * Geri al (undo)
   */
  undo: () => {
    const state = get();
    if (state.historyIndex <= 0) return;

    const newIndex = state.historyIndex - 1;
    set({
      pipes: state.history.pipes[newIndex] || [],
      components: state.history.components[newIndex] || [],
      historyIndex: newIndex
    });
  },

  /**
   * İleri al (redo)
   */
  redo: () => {
    const state = get();
    if (state.historyIndex >= state.history.pipes.length - 1) return;

    const newIndex = state.historyIndex + 1;
    set({
      pipes: state.history.pipes[newIndex] || [],
      components: state.history.components[newIndex] || [],
      historyIndex: newIndex
    });
  },

  /**
   * Tümünü temizle
   */
  clearAll: () => {
    set({
      pipes: [],
      components: [],
      tempPoints: [],
      selectedId: null,
      history: {
        pipes: [],
        components: []
      },
      historyIndex: -1
    });
  }
}));

// ============================================
// EXPORT
// ============================================

export default useDrawingStore;
