// ============================================
// 2. src/types/dwg.ts - DWG/DXF Tipleri
// ============================================
export interface DWGEntity {
  id: string;
  type: 'LINE' | 'CIRCLE' | 'ARC' | 'POLYLINE' | 'TEXT' | 'INSERT' | 'DIMENSION';
  layer: string;
  color: number;
  lineType?: string;
  lineWeight?: number;
  vertices?: { x: number; y: number; z: number }[];
  position?: { x: number; y: number; z: number };
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  text?: string;
  height?: number;
  rotation?: number;
  blockName?: string;
  visible: boolean;
}

export interface DWGLayer {
  name: string;
  color: number;
  visible: boolean;
  frozen: boolean;
  locked: boolean;
}

export interface DWGBlock {
  name: string;
  position: { x: number; y: number; z: number };
  entities: DWGEntity[];
}

export interface ParsedDWG {
  entities: DWGEntity[];
  layers: DWGLayer[];
  blocks: DWGBlock[];
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
  };
  units: string;
  version: string;
}
