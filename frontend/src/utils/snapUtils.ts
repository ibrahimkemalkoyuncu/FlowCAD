// ============================================
// SNAP UTILITIES - Gelişmiş Nokta Yakalama Sistemi
// Konum: frontend/src/utils/snapUtils.ts
// Tüm snap hesaplamalarını içerir
// Son güncelleme: 2025-01-19
// Yazar: FlowCAD Team
// ============================================

import type { Point3D, PipeSegment, ComponentInstance } from '../store/useDrawingStore';

// ============================================
// TYPE DEFINITIONS - Tip Tanımlamaları
// ============================================

/**
 * Snap noktası bilgisi
 * Her snap noktasının tipi, konumu ve mesafesi
 */
export interface SnapPoint {
  point: Point3D;
  type: 'endpoint' | 'midpoint' | 'intersection' | 'perpendicular' | 'center' | 'grid';
  distance: number;
  reference?: string; // Hangi nesneye ait (örn: "Boru pipe_123 başlangıç")
}

/**
 * Snap ayarları
 * Kullanıcının snap tercihlerini tutar
 */
export interface SnapSettings {
  enabled: boolean;              // Master snap açık/kapalı
  snapToEndpoints: boolean;      // Uç noktalara yapış
  snapToMidpoints: boolean;      // Orta noktalara yapış
  snapToIntersections: boolean;  // Kesişim noktalarına yapış
  snapToPerpendicular: boolean;  // Dik noktalara yapış (gelecek özellik)
  snapToCenter: boolean;         // Merkez noktalara yapış
  snapToGrid: boolean;           // Grid noktalarına yapış
  snapRadius: number;            // Snap etkili olacağı mesafe (metre)
  gridSize: number;              // Grid boyutu (metre)
}

// ============================================
// DEFAULT SETTINGS - Varsayılan Ayarlar
// ============================================

export const defaultSnapSettings: SnapSettings = {
  enabled: true,
  snapToEndpoints: true,
  snapToMidpoints: true,
  snapToIntersections: true,
  snapToPerpendicular: false,
  snapToCenter: true,
  snapToGrid: true,
  snapRadius: 0.5,  // 50cm yakınlıkta snap yap
  gridSize: 1       // 1 metre grid
};

// ============================================
// DISTANCE CALCULATION - Mesafe Hesaplama
// ============================================

/**
 * İki 3D nokta arasındaki Öklid mesafesini hesaplar
 * @param p1 - İlk nokta
 * @param p2 - İkinci nokta
 * @returns Mesafe (metre)
 */
export const distance3D = (p1: Point3D, p2: Point3D): number => {
  return Math.sqrt(
    Math.pow(p2.x - p1.x, 2) +
    Math.pow(p2.y - p1.y, 2) +
    Math.pow(p2.z - p1.z, 2)
  );
};

// ============================================
// ENDPOINT SNAP - Uç Nokta Yakalama
// ============================================

/**
 * Boru uç noktalarına ve component merkezlerine snap noktaları bulur
 * @param mousePos - Fare pozisyonu
 * @param pipes - Tüm borular
 * @param components - Tüm componentler
 * @param snapRadius - Snap mesafesi
 * @returns Bulunan snap noktaları dizisi
 */
export const findEndpointSnaps = (
  mousePos: Point3D,
  pipes: PipeSegment[],
  components: ComponentInstance[],
  snapRadius: number
): SnapPoint[] => {
  const snapPoints: SnapPoint[] = [];

  // Boru uç noktalarını kontrol et
  pipes.forEach((pipe) => {
    // Başlangıç noktası
    const startDist = distance3D(mousePos, pipe.start);
    if (startDist <= snapRadius) {
      snapPoints.push({
        point: pipe.start,
        type: 'endpoint',
        distance: startDist,
        reference: `Boru ${pipe.id.slice(0, 8)}... başlangıç`
      });
    }

    // Bitiş noktası
    const endDist = distance3D(mousePos, pipe.end);
    if (endDist <= snapRadius) {
      snapPoints.push({
        point: pipe.end,
        type: 'endpoint',
        distance: endDist,
        reference: `Boru ${pipe.id.slice(0, 8)}... bitiş`
      });
    }
  });

  // Component merkezleri
  components.forEach((comp) => {
    const dist = distance3D(mousePos, comp.position);
    if (dist <= snapRadius) {
      snapPoints.push({
        point: comp.position,
        type: 'center',
        distance: dist,
        reference: `${comp.name} merkezi`
      });
    }
  });

  return snapPoints;
};

// ============================================
// MIDPOINT SNAP - Orta Nokta Yakalama
// ============================================

/**
 * Boru orta noktalarına snap noktaları bulur
 * @param mousePos - Fare pozisyonu
 * @param pipes - Tüm borular
 * @param snapRadius - Snap mesafesi
 * @returns Bulunan snap noktaları dizisi
 */
export const findMidpointSnaps = (
  mousePos: Point3D,
  pipes: PipeSegment[],
  snapRadius: number
): SnapPoint[] => {
  const snapPoints: SnapPoint[] = [];

  pipes.forEach((pipe) => {
    // Orta noktayı hesapla
    const midpoint: Point3D = {
      x: (pipe.start.x + pipe.end.x) / 2,
      y: (pipe.start.y + pipe.end.y) / 2,
      z: (pipe.start.z + pipe.end.z) / 2
    };

    const dist = distance3D(mousePos, midpoint);
    if (dist <= snapRadius) {
      snapPoints.push({
        point: midpoint,
        type: 'midpoint',
        distance: dist,
        reference: `Boru ${pipe.id.slice(0, 8)}... orta nokta`
      });
    }
  });

  return snapPoints;
};

// ============================================
// INTERSECTION SNAP - Kesişim Yakalama
// ============================================

/**
 * İki çizgi segmentinin kesişim noktasını hesaplar (2D - XZ düzlemi)
 * Parametrik denklem kullanarak hesaplama yapar
 * @param p1 - İlk çizgi başlangıç
 * @param p2 - İlk çizgi bitiş
 * @param p3 - İkinci çizgi başlangıç
 * @param p4 - İkinci çizgi bitiş
 * @returns Kesişim noktası veya null (kesişim yoksa)
 */
const lineIntersection = (
  p1: Point3D,
  p2: Point3D,
  p3: Point3D,
  p4: Point3D
): Point3D | null => {
  // Denominator (payda) hesapla
  const denom = (p4.z - p3.z) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.z - p1.z);
  
  // Paralel çizgiler kontrolü (eğim aynıysa kesişim yok)
  if (Math.abs(denom) < 0.001) return null;

  // Parametrik değerleri hesapla (0-1 arası olmalı)
  const ua = ((p4.x - p3.x) * (p1.z - p3.z) - (p4.z - p3.z) * (p1.x - p3.x)) / denom;
  const ub = ((p2.x - p1.x) * (p1.z - p3.z) - (p2.z - p1.z) * (p1.x - p3.x)) / denom;

  // Kesişim segment içinde mi kontrol et
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return null;

  // Kesişim noktasını hesapla
  return {
    x: p1.x + ua * (p2.x - p1.x),
    y: 0, // Zemin seviyesinde
    z: p1.z + ua * (p2.z - p1.z)
  };
};

/**
 * Tüm boru çiftleri arasındaki kesişim noktalarını bulur
 * @param mousePos - Fare pozisyonu
 * @param pipes - Tüm borular
 * @param snapRadius - Snap mesafesi
 * @returns Bulunan kesişim snap noktaları
 */
export const findIntersectionSnaps = (
  mousePos: Point3D,
  pipes: PipeSegment[],
  snapRadius: number
): SnapPoint[] => {
  const snapPoints: SnapPoint[] = [];

  // Her boru çifti için kesişim kontrol et
  for (let i = 0; i < pipes.length; i++) {
    for (let j = i + 1; j < pipes.length; j++) {
      const intersection = lineIntersection(
        pipes[i].start,
        pipes[i].end,
        pipes[j].start,
        pipes[j].end
      );

      if (intersection) {
        const dist = distance3D(mousePos, intersection);
        if (dist <= snapRadius) {
          snapPoints.push({
            point: intersection,
            type: 'intersection',
            distance: dist,
            reference: `Kesişim noktası`
          });
        }
      }
    }
  }

  return snapPoints;
};

// ============================================
// GRID SNAP - Grid Noktası Yakalama
// ============================================

/**
 * En yakın grid noktasını bulur
 * Grid boyutuna göre yuvarlar
 * @param mousePos - Fare pozisyonu
 * @param gridSize - Grid boyutu
 * @returns Grid snap noktası
 */
export const findGridSnap = (
  mousePos: Point3D,
  gridSize: number
): SnapPoint => {
  // Grid noktasına yuvarla
  const gridPoint: Point3D = {
    x: Math.round(mousePos.x / gridSize) * gridSize,
    y: Math.round(mousePos.y / gridSize) * gridSize,
    z: Math.round(mousePos.z / gridSize) * gridSize
  };

  return {
    point: gridPoint,
    type: 'grid',
    distance: distance3D(mousePos, gridPoint),
    reference: `Grid (${gridPoint.x.toFixed(1)}, ${gridPoint.z.toFixed(1)})`
  };
};

// ============================================
// MAIN SNAP FUNCTION - Ana Snap Fonksiyonu
// ============================================

/**
 * Mouse pozisyonuna göre en uygun snap noktasını bulur
 * Tüm snap türlerini kontrol eder ve öncelik sırasına göre en iyisini döndürür
 * Öncelik: endpoint > midpoint > intersection > grid
 * 
 * @param mousePos - Fare pozisyonu
 * @param pipes - Tüm borular
 * @param components - Tüm componentler
 * @param settings - Snap ayarları
 * @returns Snap uygulanmış nokta ve snap bilgisi
 */
export const findSnapPoint = (
  mousePos: Point3D,
  pipes: PipeSegment[],
  components: ComponentInstance[],
  settings: SnapSettings
): { snappedPoint: Point3D; snapInfo: SnapPoint | null } => {
  
  // Snap kapalıysa direkt mouse pozisyonunu döndür
  if (!settings.enabled) {
    return { snappedPoint: mousePos, snapInfo: null };
  }

  const allSnapPoints: SnapPoint[] = [];

  // Endpoint snaps topla
  if (settings.snapToEndpoints) {
    allSnapPoints.push(
      ...findEndpointSnaps(mousePos, pipes, components, settings.snapRadius)
    );
  }

  // Midpoint snaps topla
  if (settings.snapToMidpoints) {
    allSnapPoints.push(
      ...findMidpointSnaps(mousePos, pipes, settings.snapRadius)
    );
  }

  // Intersection snaps topla
  if (settings.snapToIntersections) {
    allSnapPoints.push(
      ...findIntersectionSnaps(mousePos, pipes, settings.snapRadius)
    );
  }

  // Grid snap ekle (en düşük öncelik)
  if (settings.snapToGrid) {
    allSnapPoints.push(findGridSnap(mousePos, settings.gridSize));
  }

  // Hiç snap noktası yoksa mouse pozisyonunu döndür
  if (allSnapPoints.length === 0) {
    return { snappedPoint: mousePos, snapInfo: null };
  }

  // Öncelik sırasına göre sırala
  const priorityOrder: SnapPoint['type'][] = [
    'endpoint',      // En yüksek öncelik - boru uçları
    'center',        // Component merkezleri
    'midpoint',      // Orta noktalar
    'intersection',  // Kesişim noktaları
    'perpendicular', // Dik noktalar (henüz aktif değil)
    'grid'          // En düşük öncelik - grid
  ];
  
  allSnapPoints.sort((a, b) => {
    // Önce tip önceliğine göre sırala
    const priorityDiff = priorityOrder.indexOf(a.type) - priorityOrder.indexOf(b.type);
    if (priorityDiff !== 0) return priorityDiff;
    
    // Aynı tipse mesafeye göre sırala (yakın olan önce)
    return a.distance - b.distance;
  });

  const bestSnap = allSnapPoints[0];

  // Grid dışındaki snapler için radius kontrolü
  // Grid her zaman snap yapar ama diğerleri sadece radius içindeyse
  if (bestSnap.type !== 'grid' && bestSnap.distance > settings.snapRadius) {
    // Radius dışında, grid snap varsa onu kullan
    const gridSnap = allSnapPoints.find(s => s.type === 'grid');
    if (gridSnap && settings.snapToGrid) {
      return { snappedPoint: gridSnap.point, snapInfo: gridSnap };
    }
    // Grid de yoksa mouse pozisyonunu döndür
    return { snappedPoint: mousePos, snapInfo: null };
  }

  return { snappedPoint: bestSnap.point, snapInfo: bestSnap };
};

// ============================================
// VISUALIZATION HELPERS - Görselleştirme
// ============================================

/**
 * Snap tipine göre renk döndürür
 * UI'da snap noktalarını renkli göstermek için
 */
export const getSnapColor = (type: SnapPoint['type']): string => {
  const colors: Record<SnapPoint['type'], string> = {
    endpoint: '#3b82f6',      // Mavi - Uç noktalar
    midpoint: '#10b981',      // Yeşil - Orta noktalar
    intersection: '#f59e0b',  // Turuncu - Kesişimler
    perpendicular: '#8b5cf6', // Mor - Dik noktalar
    center: '#ef4444',        // Kırmızı - Merkezler
    grid: '#6b7280'           // Gri - Grid
  };
  return colors[type];
};

/**
 * Snap tipine göre ikon döndürür
 * UI'da snap tipini göstermek için
 */
export const getSnapIcon = (type: SnapPoint['type']): string => {
  const icons: Record<SnapPoint['type'], string> = {
    endpoint: '□',      // Kare - Uç noktalar
    midpoint: '△',      // Üçgen - Orta noktalar
    intersection: '×',  // Çarpı - Kesişimler
    perpendicular: '⊥', // Dik işareti
    center: '○',        // Daire - Merkezler
    grid: '⊞'          // Grid işareti
  };
  return icons[type];
};

/**
 * Snap tipine göre açıklama döndürür
 * Tooltip'ler için
 */
export const getSnapDescription = (type: SnapPoint['type']): string => {
  const descriptions: Record<SnapPoint['type'], string> = {
    endpoint: 'Uç Nokta',
    midpoint: 'Orta Nokta',
    intersection: 'Kesişim Noktası',
    perpendicular: 'Dik Nokta',
    center: 'Merkez Nokta',
    grid: 'Grid Noktası'
  };
  return descriptions[type];
};

// ============================================
// EXPORT ALL
// ============================================

export default {
  distance3D,
  findEndpointSnaps,
  findMidpointSnaps,
  findIntersectionSnaps,
  findGridSnap,
  findSnapPoint,
  getSnapColor,
  getSnapIcon,
  getSnapDescription,
  defaultSnapSettings
};