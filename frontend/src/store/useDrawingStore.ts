// ============================================
// DRAWING STORE - SNAP SİSTEMİ İLE GELİŞTİRİLMİŞ
// Zustand kullanarak global state yönetimi
// ============================================

import { create } from 'zustand';
import { defaultSnapSettings, type SnapSettings } from '../utils/snapUtils';

// ============================================
// TİP TANIMLARI
// ============================================

export type DrawingMode = 
  | 'select'   // Seçim modu
  | 'pipe'     // Boru çizimi
  | 'elbow'    // Dirsek ekleme
  | 'valve'    // Vana ekleme
  | 'meter'    // Sayaç ekleme
  | 'boiler'   // Kombi ekleme
  | 'delete';  // Silme modu

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface PipeSegment {
  id: string;
  start: Point3D;
  end: Point3D;
  diameter: string;     // Örn: "1/2", "3/4"
  material: string;
  length?: number;      // Otomatik hesaplanır
}

export interface ComponentInstance {
  id: string;
  type: string;         // 'valve', 'meter', 'boiler', vb.
  position: Point3D;
  rotation: [number, number, number];
  componentId: number;
  name: string;
  properties?: Record<string, any>;
}

// ============================================
// STORE INTERFACE
// ============================================

interface DrawingState {
  // Çizim durumu
  mode: DrawingMode;
  pipes: PipeSegment[];
  components: ComponentInstance[];
  tempPoints: Point3D[];
  selectedId: string | null;
  
  // 🎯 SNAP AYARLARI
  snapSettings: SnapSettings;
  
  // Grid ve çap ayarları
  gridSize: number;          // Eski uyumluluk için
  currentDiameter: string;
  
  // Undo/Redo
  history: Array<{ pipes: PipeSegment[]; components: ComponentInstance[] }>;
  historyIndex: number;
  
  // ============================================
  // TEMEL İŞLEMLER
  // ============================================
  
  setMode: (mode: DrawingMode) => void;
  addTempPoint: (point: Point3D) => void;
  clearTempPoints: () => void;
  completePipe: () => void;
  
  // Component işlemleri
  addComponent: (component: ComponentInstance) => void;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, updates: Partial<ComponentInstance>) => void;
  
  // Pipe işlemleri
  removePipe: (id: string) => void;
  
  // Seçim işlemleri
  selectObject: (id: string | null) => void;
  
  // 🎯 SNAP İŞLEMLERİ
  toggleSnap: (snapType: keyof SnapSettings) => void;
  updateSnapSettings: (settings: Partial<SnapSettings>) => void;
  
  // Eski snap fonksiyonu (geriye dönük uyumluluk)
  toggleSnapToGrid: () => void;
  snapToGrid: boolean;  // Computed property
  
  setGridSize: (size: number) => void;
  setCurrentDiameter: (diameter: string) => void;
  
  // Undo/Redo işlemleri
  undo: () => void;
  redo: () => void;
  clearAll: () => void;
  saveToHistory: () => void;
}

// ============================================
// STORE OLUŞTURMA
// ============================================

export const useDrawingStore = create<DrawingState>((set, get) => ({
  // ============================================
  // BAŞLANGIÇ DEĞERLERİ
  // ============================================
  
  mode: 'select',
  pipes: [],
  components: [],
  tempPoints: [],
  selectedId: null,
  
  // 🎯 Snap ayarları
  snapSettings: defaultSnapSettings,
  
  gridSize: 1,
  currentDiameter: '1/2"',
  history: [],
  historyIndex: -1,
  
  // Computed property - geriye dönük uyumluluk
  get snapToGrid() {
    return get().snapSettings.snapToGrid;
  },
  
  // ============================================
  // MOD İŞLEMLERİ
  // ============================================
  
  setMode: (mode) => set({ 
    mode, 
    tempPoints: [], 
    selectedId: null 
  }),
  
  // ============================================
  // GEÇİCİ NOKTA İŞLEMLERİ
  // ============================================
  
  addTempPoint: (point) => {
    const { tempPoints, snapSettings } = get();
    
    // SNAP UYGULAMASI KALDIRILDI
    // Snap artık InteractiveScene3D içinde uygulanıyor
    // Buraya gelen nokta zaten snap uygulanmış nokta
    
    set({ tempPoints: [...tempPoints, point] });
  },
  
  clearTempPoints: () => set({ tempPoints: [] }),
  
  // ============================================
  // BORU TAMAMLAMA
  // ============================================
  
  completePipe: () => {
    const { tempPoints, pipes, currentDiameter } = get();
    
    if (tempPoints.length < 2) return;
    
    const newPipes: PipeSegment[] = [];
    
    // Ardışık noktalar arasında borular oluştur
    for (let i = 0; i < tempPoints.length - 1; i++) {
      const start = tempPoints[i];
      const end = tempPoints[i + 1];
      
      // Uzunluğu hesapla
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
        material: 'PPR',
        length: length
      });
    }
    
    set({ 
      pipes: [...pipes, ...newPipes],
      tempPoints: []
    });
    
    get().saveToHistory();
  },
  
  // ============================================
  // COMPONENT İŞLEMLERİ
  // ============================================
  
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
  
  // ============================================
  // PIPE İŞLEMLERİ
  // ============================================
  
  removePipe: (id) => {
    set((state) => ({
      pipes: state.pipes.filter(p => p.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId
    }));
    get().saveToHistory();
  },
  
  // ============================================
  // SEÇİM İŞLEMLERİ
  // ============================================
  
  selectObject: (id) => set({ selectedId: id }),
  
  // ============================================
  // 🎯 SNAP İŞLEMLERİ
  // ============================================
  
  /**
   * Belirli bir snap ayarını aç/kapat
   */
  toggleSnap: (snapType) => {
    set((state) => ({
      snapSettings: {
        ...state.snapSettings,
        [snapType]: !state.snapSettings[snapType]
      }
    }));
  },
  
  /**
   * Snap ayarlarını güncelle
   */
  updateSnapSettings: (settings) => {
    set((state) => ({
      snapSettings: { ...state.snapSettings, ...settings }
    }));
  },
  
  /**
   * Grid snap toggle (geriye dönük uyumluluk)
   */
  toggleSnapToGrid: () => {
    set((state) => ({
      snapSettings: {
        ...state.snapSettings,
        snapToGrid: !state.snapSettings.snapToGrid
      }
    }));
  },
  
  // ============================================
  // DİĞER AYARLAR
  // ============================================
  
  setGridSize: (size) => {
    set((state) => ({
      gridSize: size,
      snapSettings: { ...state.snapSettings, gridSize: size }
    }));
  },
  
  setCurrentDiameter: (diameter) => set({ currentDiameter: diameter }),
  
  // ============================================
  // UNDO/REDO SİSTEMİ
  // ============================================
  
  /**
   * Geçmişe kaydet
   */
  saveToHistory: () => {
    const { pipes, components, history, historyIndex } = get();
    
    // Mevcut index'ten sonrasını sil
    const newHistory = history.slice(0, historyIndex + 1);
    
    // Yeni durumu ekle
    newHistory.push({ 
      pipes: JSON.parse(JSON.stringify(pipes)), 
      components: JSON.parse(JSON.stringify(components))
    });
    
    // Maksimum 50 adım tut
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    set({ 
      history: newHistory,
      historyIndex: newHistory.length - 1
    });
  },
  
  /**
   * Geri al
   */
  undo: () => {
    const { history, historyIndex } = get();
    
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      
      set({
        pipes: JSON.parse(JSON.stringify(state.pipes)),
        components: JSON.parse(JSON.stringify(state.components)),
        historyIndex: newIndex
      });
    }
  },
  
  /**
   * İleri al
   */
  redo: () => {
    const { history, historyIndex } = get();
    
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      
      set({
        pipes: JSON.parse(JSON.stringify(state.pipes)),
        components: JSON.parse(JSON.stringify(state.components)),
        historyIndex: newIndex
      });
    }
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
      mode: 'select'
    });
    get().saveToHistory();
  }
}));