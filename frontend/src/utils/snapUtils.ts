// ============================================
// SNAP UTILITIES - Gelişmiş Nokta Yakalama Sistemi
// Tüm snap fonksiyonlarını içerir
// ============================================

import type { Point3D, PipeSegment, ComponentInstance } from '../store/useDrawingStore';

// ============================================
// SNAP TİPLERİ VE AYARLAR
// ============================================

export interface SnapPoint {
  point: Point3D;
  type: 'endpoint' | 'midpoint' | 'intersection' | 'perpendicular' | 'center' | 'grid';
  distance: number;
  reference?: string; // Hangi nesneye ait olduğu bilgisi
}

export interface SnapSettings {
  enabled: boolean;              // Master snap açık/kapalı
  snapToEndpoints: boolean;      // Uç noktalara yapış
  snapToMidpoints: boolean;      // Orta noktalara yapış
  snapToIntersections: boolean;  // Kesişim noktalarına yapış
  snapToPerpendicular: boolean;  // Dik noktalara yapış
  snapToCenter: boolean;         // Merkez noktalara yapış
  snapToGrid: boolean;           // Grid noktalarına yapış
  snapRadius: number;            // Snap mesafesi (metre cinsinden)
  gridSize: number;              // Grid boyutu (metre)
}

// ============================================
// VARSAYILAN AYARLAR
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
// MESAFE HESAPLAMA FONKSİYONLARI
// ============================================

/**
 * İki 3D nokta arasındaki Öklid mesafesini hesaplar
 */
export const distance3D = (p1: Point3D, p2: Point3D): number => {
  return Math.sqrt(
    Math.pow(p2.x - p1.x, 2) +
    Math.pow(p2.y - p1.y, 2) +
    Math.pow(p2.z - p1.z, 2)
  );
};

// ============================================
// ENDPOINT SNAP - Uç Noktalara Yapışma
// Boru başlangıç/bitiş noktaları ve component merkezleri
// ============================================

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
        reference: `Boru ${pipe.id.slice(0, 8)} başlangıç`
      });
    }

    // Bitiş noktası
    const endDist = distance3D(mousePos, pipe.end);
    if (endDist <= snapRadius) {
      snapPoints.push({
        point: pipe.end,
        type: 'endpoint',
        distance: endDist,
        reference: `Boru ${pipe.id.slice(0, 8)} bitiş`
      });
    }
  });

  // Component merkezleri
  components.forEach((comp) => {
    const dist = distance3D(mousePos, comp.position);
    if (dist <= snapRadius) {
      snapPoints.push({
        point: comp.position,
        type: 'endpoint',
        distance: dist,
        reference: `${comp.name} merkezi`
      });
    }
  });

  return snapPoints;
};

// ============================================
// MIDPOINT SNAP - Orta Noktalara Yapışma
// Boru orta noktalarını hesaplar
// ============================================

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
        reference: `Boru ${pipe.id.slice(0, 8)} orta nokta`
      });
    }
  });

  return snapPoints;
};

// ============================================
// INTERSECTION SNAP - Kesişim Noktalarına Yapışma
// İki çizginin kesişim noktasını bulur (2D - XZ düzleminde)
// ============================================

/**
 * İki çizgi segmentinin kesişim noktasını hesaplar
 * Parametrik denklem kullanarak hesaplama yapar
 */
const lineIntersection = (
  p1: Point3D, // İlk çizgi başlangıç
  p2: Point3D, // İlk çizgi bitiş
  p3: Point3D, // İkinci çizgi başlangıç
  p4: Point3D  // İkinci çizgi bitiş
): Point3D | null => {
  // Denominator (payda) hesapla
  const denom = (p4.z - p3.z) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.z - p1.z);
  
  // Paralel çizgiler kontrolü
  if (Math.abs(denom) < 0.001) return null;

  // Parametrik değerleri hesapla
  const ua = ((p4.x - p3.x) * (p1.z - p3.z) - (p4.z - p3.z) * (p1.x - p3.x)) / denom;
  const ub = ((p2.x - p1.x) * (p1.z - p3.z) - (p2.z - p1.z) * (p1.x - p3.x)) / denom;

  // Kesişim segment içinde mi kontrol et
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return null;

  // Kesişim noktasını hesapla
  return {
    x: p1.x + ua * (p2.x - p1.x),
    y: 0,
    z: p1.z + ua * (p2.z - p1.z)
  };
};

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
// GRID SNAP - Grid Noktalarına Yapışma
// En yakın grid noktasını bulur
// ============================================

export const findGridSnap = (
  mousePos: Point3D,
  gridSize: number
): SnapPoint => {
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
// ANA SNAP FONKSİYONU
// Tüm snap türlerini kontrol eder ve en uygununu döndürür
// ============================================

/**
 * Mouse pozisyonuna göre en uygun snap noktasını bulur
 * Öncelik sırası: endpoint > midpoint > intersection > grid
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

  // Grid snap her zaman ekle (en düşük öncelik)
  if (settings.snapToGrid) {
    allSnapPoints.push(findGridSnap(mousePos, settings.gridSize));
  }

  // Hiç snap noktası yoksa mouse pozisyonunu döndür
  if (allSnapPoints.length === 0) {
    return { snappedPoint: mousePos, snapInfo: null };
  }

  // Öncelik sırasına göre sırala
  const priorityOrder: SnapPoint['type'][] = [
    'endpoint',      // En yüksek öncelik
    'midpoint',
    'intersection',
    'perpendicular',
    'center',
    'grid'          // En düşük öncelik
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
  if (bestSnap.type !== 'grid' && bestSnap.distance > settings.snapRadius) {
    return { snappedPoint: mousePos, snapInfo: null };
  }

  return { snappedPoint: bestSnap.point, snapInfo: bestSnap };
};

// ============================================
// GÖRSELLEŞTIRME YARDIMCILARI
// Snap noktalarının renklerini ve ikonlarını döndürür
// ============================================

/**
 * Snap tipine göre renk döndürür
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