// ============================================
// SNAP UTILS - Snap Yardımcı Fonksiyonları
// Konum: frontend/src/utils/snapUtils.ts
// Nokta yakalama algoritmaları
// ============================================

import type { Point3D, PipeSegment, ComponentInstance } from '../store/useDrawingStore';

// ============================================
// SNAP SETTINGS INTERFACE
// ============================================

export interface SnapSettings {
  enabled: boolean;
  snapToGrid: boolean;
  snapToEndpoints: boolean;
  snapToMidpoints: boolean;
  snapToIntersections: boolean;
  snapToCenter: boolean;
  snapTolerance: number;
  gridSize: number;
}

// ============================================
// DEFAULT SNAP SETTINGS
// ============================================

export const defaultSnapSettings: SnapSettings = {
  enabled: true,
  snapToGrid: true,
  snapToEndpoints: true,
  snapToMidpoints: false,
  snapToIntersections: false,
  snapToCenter: true,
  snapTolerance: 0.5,
  gridSize: 1
};

// ============================================
// SNAP RESULT INTERFACE
// ============================================

export interface SnapResult {
  snappedPoint: Point3D;
  snapInfo: {
    type: 'endpoint' | 'midpoint' | 'intersection' | 'center' | 'grid' | 'none';
    reference: string;
  } | null;
}

// ============================================
// MAIN SNAP FUNCTION
// ============================================

export function findSnapPoint(
  mousePos: Point3D,
  pipes: PipeSegment[],
  components: ComponentInstance[],
  snapSettings: SnapSettings
): SnapResult {
  
  if (!snapSettings.enabled) {
    return {
      snappedPoint: mousePos,
      snapInfo: null
    };
  }

  const tolerance = snapSettings.snapTolerance || 0.5;
  let closestSnap: SnapResult | null = null;
  let minDistance = tolerance;

  // ============================================
  // ENDPOINT SNAP - Boru uç noktaları
  // ============================================
  
  if (snapSettings.snapToEndpoints) {
    pipes.forEach((pipe, pipeIndex) => {
      // Başlangıç noktası
      const distStart = distance3D(mousePos, pipe.start);
      if (distStart < minDistance) {
        minDistance = distStart;
        closestSnap = {
          snappedPoint: pipe.start,
          snapInfo: {
            type: 'endpoint',
            reference: `Boru #${pipeIndex + 1} Başlangıç`
          }
        };
      }

      // Bitiş noktası
      const distEnd = distance3D(mousePos, pipe.end);
      if (distEnd < minDistance) {
        minDistance = distEnd;
        closestSnap = {
          snappedPoint: pipe.end,
          snapInfo: {
            type: 'endpoint',
            reference: `Boru #${pipeIndex + 1} Bitiş`
          }
        };
      }
    });
  }

  // ============================================
  // MIDPOINT SNAP - Orta noktalar
  // ============================================
  
  if (snapSettings.snapToMidpoints) {
    pipes.forEach((pipe, pipeIndex) => {
      const midpoint: Point3D = {
        x: (pipe.start.x + pipe.end.x) / 2,
        y: (pipe.start.y + pipe.end.y) / 2,
        z: (pipe.start.z + pipe.end.z) / 2
      };

      const dist = distance3D(mousePos, midpoint);
      if (dist < minDistance) {
        minDistance = dist;
        closestSnap = {
          snappedPoint: midpoint,
          snapInfo: {
            type: 'midpoint',
            reference: `Boru #${pipeIndex + 1} Orta`
          }
        };
      }
    });
  }

  // ============================================
  // COMPONENT CENTER SNAP - Cihaz merkezi
  // ============================================
  
  if (snapSettings.snapToCenter) {
    components.forEach((component, compIndex) => {
      const dist = distance3D(mousePos, component.position);
      if (dist < minDistance) {
        minDistance = dist;
        closestSnap = {
          snappedPoint: component.position,
          snapInfo: {
            type: 'center',
            reference: `${component.name} Merkezi #${compIndex + 1}`
          }
        };
      }
    });
  }

  // ============================================
  // GRID SNAP - Grid yakalama
  // ============================================
  
  if (snapSettings.snapToGrid && !closestSnap) {
    const gridSize = snapSettings.gridSize || 1;
    const snappedPoint: Point3D = {
      x: Math.round(mousePos.x / gridSize) * gridSize,
      y: mousePos.y,
      z: Math.round(mousePos.z / gridSize) * gridSize
    };

    return {
      snappedPoint,
      snapInfo: {
        type: 'grid',
        reference: `Grid ${gridSize}m`
      }
    };
  }

  // ============================================
  // RETURN RESULT
  // ============================================
  
  return closestSnap || {
    snappedPoint: mousePos,
    snapInfo: null
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * 3D mesafe hesaplama
 */
function distance3D(p1: Point3D, p2: Point3D): number {
  return Math.sqrt(
    Math.pow(p2.x - p1.x, 2) +
    Math.pow(p2.y - p1.y, 2) +
    Math.pow(p2.z - p1.z, 2)
  );
}

/**
 * İki boru kesişim noktası bulma (2D - Y ekseni ihmal edilir)
 */
export function findPipeIntersection(
  pipe1: PipeSegment,
  pipe2: PipeSegment
): Point3D | null {
  // Basitleştirilmiş 2D kesişim (Y eksenini ihmal et)
  const x1 = pipe1.start.x;
  const z1 = pipe1.start.z;
  const x2 = pipe1.end.x;
  const z2 = pipe1.end.z;
  
  const x3 = pipe2.start.x;
  const z3 = pipe2.start.z;
  const x4 = pipe2.end.x;
  const z4 = pipe2.end.z;
  
  const denom = (x1 - x2) * (z3 - z4) - (z1 - z2) * (x3 - x4);
  
  if (Math.abs(denom) < 0.0001) {
    return null; // Paralel veya çakışık
  }
  
  const t = ((x1 - x3) * (z3 - z4) - (z1 - z3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (z1 - z3) - (z1 - z2) * (x1 - x3)) / denom;
  
  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: x1 + t * (x2 - x1),
      y: 0,
      z: z1 + t * (z2 - z1)
    };
  }
  
  return null;
}