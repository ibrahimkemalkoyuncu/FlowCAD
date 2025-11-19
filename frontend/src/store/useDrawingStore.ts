// ============================================
// DRAWING STORE - Zustand ile State Yönetimi
// Konum: frontend/src/store/useDrawingStore.ts
// SNAP sistemi ile geliştirilmiş versiyon
// Son güncelleme: 2025-01-19
// Geliştirici: @ibrahimkemalkoyuncu
// ============================================

import { create } from 'zustand';
import { defaultSnapSettings, type SnapSettings } from '../utils/snapUtils';

// ============================================
// TYPE DEFINITIONS - Tip Tanımlamaları
// ============================================

/**
 * Çizim modları
 * Kullanıcının hangi araçla çalıştığını belirtir
 */
export type DrawingMode = 
  | 'select'   // Seçim modu - objeleri seç ve düzenle
  | 'pipe'     // Boru çizimi - iki nokta arası boru
  | 'elbow'    // Dirsek ekleme - 90° bağlantı
  | 'valve'    // Vana ekleme - kapatma vanası
  | 'meter'    // Sayaç ekleme - su sayacı
  | 'boiler'   // Kombi ekleme - ısıtma cihazı
  | 'delete';  // Silme modu - tıklayarak sil

/**
 * 3D uzayda bir nokta
 * X, Y, Z koordinatları (metre cinsinden)
 */
export interface Point3D {
  x: number;  // Sağ/Sol (Right/Left)
  y: number;  // Yukarı/Aşağı (Up/Down)
  z: number;  // İleri/Geri (Forward/Back)
}

/**
 * Boru segmenti
 * İki nokta arasında çizilmiş bir boru parçası
 */
export interface PipeSegment {
  id: string;           // Benzersiz kimlik
  start: Point3D;       // Başlangıç noktası
  end: Point3D;         // Bitiş noktası
  diameter: string;     // Boru çapı (örn: "1/2", "3/4")
  material: string;     // Malzeme tipi (örn: "PPR", "Bakır")
  length?: number;      // Uzunluk (metre) - otomatik hesaplanır
}

/**
 * Component (Cihaz) Instance
 * Sahnede yerleştirilmiş bir cihaz
 */
export interface ComponentInstance {
  id: string;                         // Benzersiz kimlik
  type: string;                       // Tip ('valve', 'meter', 'boiler', vb.)
  position: Point3D;                  // 3D pozisyon
  rotation: [number, number, number]; // Rotasyon (X, Y, Z radyan)
  componentId: number;                // Component veritabanı ID'si
  name: string;                       // Görünen isim
  properties?: Record<string, any>;   // Ek özellikler
}

// ============================================
// STORE INTERFACE - Store Arayüzü
// ============================================

interface DrawingState {
  // ============================================
  // STATE - Durum Değişkenleri
  // ============================================
  
  mode: DrawingMode;                  // Aktif çizim modu
  pipes: PipeSegment[];               // Tüm borular
  components: ComponentInstance[];    // Tüm componentler
  tempPoints: Point3D[];              // Geçici noktalar (çizim sırasında)
  selectedId: string | null;          // Seçili obje ID'si
  
  // 🎯 SNAP SETTINGS - Snap Ayarları
  snapSettings: SnapSettings;         // Snap yapılandırması
  
  // Grid ve çap ayarları
  gridSize: number;                   // Grid boyutu (eski uyumluluk için)
  currentDiameter: string;            // Seçili boru çapı
  
  // Undo/Redo sistemi
  history: Array<{                    // Geçmiş durumlar
    pipes: PipeSegment[];
    components: ComponentInstance[];
  }>;
  historyIndex: number;               // Geçmiş index'i
  
  // ============================================
  // COMPUTED PROPERTIES - Hesaplanan Özellikler
  // ============================================
  
  snapToGrid: boolean;                // Grid snap durumu (geriye dönük uyumluluk)
  
  // ============================================
  // ACTIONS - Eylemler
  // ============================================
  
  // Mod yönetimi
  setMode: (mode: DrawingMode) => void;
  
  // Geçici nokta yönetimi
  addTempPoint: (point: Point3D) => void;
  clearTempPoints: () => void;
  
  // Boru işlemleri
  completePipe: () => void;
  removePipe: (id: string) => void;
  
  // Component işlemleri
  addComponent: (component: ComponentInstance) => void;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, updates: Partial<ComponentInstance>) => void;
  
  // Seçim işlemleri
  selectObject: (id: string | null) => void;
  
  // 🎯 SNAP İŞLEMLERİ
  toggleSnap: (snapType: keyof SnapSettings) => void;
  updateSnapSettings: (settings: Partial<SnapSettings>) => void;
  toggleSnapToGrid: () => void;  // Geriye dönük uyumluluk
  
  // Diğer ayarlar
  setGridSize: (size: number) => void;
  setCurrentDiameter: (diameter: string) => void;
  
  // Undo/Redo
  undo: () => void;
  redo: () => void;
  clearAll: () => void;
  saveToHistory: () => void;
}

// ============================================
// STORE CREATION - Store Oluşturma
// ============================================

export const useDrawingStore = create<DrawingState>((set, get) => ({
  
  // ============================================
  // INITIAL STATE - Başlangıç Durumu
  // ============================================
  
  mode: 'select',
  pipes: [],
  components: [],
  tempPoints: [],
  selectedId: null,
  
  // 🎯 Snap ayarları - Varsayılan değerler
  snapSettings: defaultSnapSettings,
  
  gridSize: 1,
  currentDiameter: '1/2"',
  history: [],
  historyIndex: -1,
  
  // Computed property - snapSettings'ten alınır
  get snapToGrid() {
    return get().snapSettings.snapToGrid;
  },
  
  // ============================================
  // MODE MANAGEMENT - Mod Yönetimi
  // ============================================
  
  /**
   * Çizim modunu değiştirir
   * Mod değişirken geçici noktalar ve seçim temizlenir
   */
  setMode: (mode) => {
    set({ 
      mode, 
      tempPoints: [], 
      selectedId: null 
    });
  },
  
  // ============================================
  // TEMPORARY POINTS - Geçici Nokta Yönetimi
  // ============================================
  
  /**
   * Geçici nokta ekler
   * NOT: Snap artık InteractiveScene3D'de uygulanıyor
   * Buraya gelen nokta zaten snap uygulanmış halde
   */
  addTempPoint: (point) => {
    const { tempPoints } = get();
    set({ tempPoints: [...tempPoints, point] });
  },
  
  /**
   * Tüm geçici noktaları temizler
   * Çizim iptal edildiğinde veya tamamlandığında kullanılır
   */
  clearTempPoints: () => {
    set({ tempPoints: [] });
  },
  
  // ============================================
  // PIPE OPERATIONS - Boru İşlemleri
  // ============================================
  
  /**
   * Geçici noktalardan boru oluşturur
   * En az 2 nokta gerekir
   * Ardışık noktalar arasında boru segmentleri oluşturulur
   */
  completePipe: () => {
    const { tempPoints, pipes, currentDiameter } = get();
    
    // En az 2 nokta olmalı
    if (tempPoints.length < 2) return;
    
    const newPipes: PipeSegment[] = [];
    
    // Ardışık noktalar arasında borular oluştur
    for (let i = 0; i < tempPoints.length - 1; i++) {
      const start = tempPoints[i];
      const end = tempPoints[i + 1];
      
      // Uzunluğu hesapla (3D Pisagor)
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
    
    // Geçmişe kaydet
    get().saveToHistory();
  },
  
  /**
   * ID'ye göre boru siler
   */
  removePipe: (id) => {
    set((state) => ({
      pipes: state.pipes.filter(p => p.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId
    }));
    get().saveToHistory();
  },
  
  // ============================================
  // COMPONENT OPERATIONS - Component İşlemleri
  // ============================================
  
  /**
   * Yeni component ekler
   */
  addComponent: (component) => {
    set((state) => ({
      components: [...state.components, component]
    }));
    get().saveToHistory();
  },
  
  /**
   * ID'ye göre component siler
   */
  removeComponent: (id) => {
    set((state) => ({
      components: state.components.filter(c => c.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId
    }));
    get().saveToHistory();
  },
  
  /**
   * Component özelliklerini günceller
   * Partial update - sadece verilen alanlar değişir
   */
  updateComponent: (id, updates) => {
    set((state) => ({
      components: state.components.map(c =>
        c.id === id ? { ...c, ...updates } : c
      )
    }));
  },
  
  // ============================================
  // SELECTION - Seçim İşlemleri
  // ============================================
  
  /**
   * Obje seçer veya seçimi kaldırır
   * @param id - Obje ID'si veya null (seçimi kaldır)
   */
  selectObject: (id) => {
    set({ selectedId: id });
  },
  
  // ============================================
  // 🎯 SNAP OPERATIONS - Snap İşlemleri
  // ============================================
  
  /**
   * Belirli bir snap ayarını aç/kapat yapar
   * @param snapType - Toggle edilecek snap tipi
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
   * Snap ayarlarını toplu günceller
   * @param settings - Güncellenecek ayarlar (partial)
   */
  updateSnapSettings: (settings) => {
    set((state) => ({
      snapSettings: { 
        ...state.snapSettings, 
        ...settings 
      }
    }));
  },
  
  /**
   * Grid snap'i aç/kapat (geriye dönük uyumluluk)
   * Eski kod ile uyumluluk için korundu
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
  // OTHER SETTINGS - Diğer Ayarlar
  // ============================================
  
  /**
   * Grid boyutunu ayarlar
   * Hem gridSize hem de snapSettings.gridSize güncellenir
   */
  setGridSize: (size) => {
    set((state) => ({
      gridSize: size,
      snapSettings: { 
        ...state.snapSettings, 
        gridSize: size 
      }
    }));
  },
  
  /**
   * Aktif boru çapını değiştirir
   */
  setCurrentDiameter: (diameter) => {
    set({ currentDiameter: diameter });
  },
  
  // ============================================
  // UNDO/REDO SYSTEM - Geri Al/İleri Al
  // ============================================
  
  /**
   * Mevcut durumu geçmişe kaydeder
   * Maksimum 50 adım tutulur
   */
  saveToHistory: () => {
    const { pipes, components, history, historyIndex } = get();
    
    // Mevcut index'ten sonrasını sil (yeni dal oluştur)
    const newHistory = history.slice(0, historyIndex + 1);
    
    // Yeni durumu ekle (deep copy)
    newHistory.push({ 
      pipes: JSON.parse(JSON.stringify(pipes)), 
      components: JSON.parse(JSON.stringify(components))
    });
    
    // Maksimum 50 adım tut (bellek optimizasyonu)
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    set({ 
      history: newHistory,
      historyIndex: newHistory.length - 1
    });
  },
  
  /**
   * Bir adım geri gider
   * En başta değilse bir önceki durumu yükler
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
   * Bir adım ileri gider
   * En sonda değilse bir sonraki durumu yükler
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
   * Tüm çizimleri temizler
   * Boş bir sahneye döner
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

// ============================================
// EXPORT
// ============================================

export default useDrawingStore;