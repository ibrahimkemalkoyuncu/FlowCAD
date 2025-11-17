// src/services/dwgParser.ts
import DxfParser from 'dxf-parser';
import type { DWGEntity, DWGLayer, DWGBlock, ParsedDWG } from '../types/dwg';

class DWGParserService {
  private parser: DxfParser;

  constructor() {
    this.parser = new DxfParser();
  }

  // DXF/DWG dosyasını parse et
  async parseDWG(fileContent: string): Promise<ParsedDWG> {
    try {
      const dxf = this.parser.parseSync(fileContent);
      
      if (!dxf) {
        throw new Error('DXF parse edilemedi');
      }

      console.log('DXF parsed:', dxf);

      // Entities'leri dönüştür
      const entities = this.convertEntities(dxf.entities || []);
      
      // Layers'ları dönüştür
      const layers = this.convertLayers(dxf.tables?.layer?.layers || {});
      
      // Blocks'ları dönüştür
      const blocks = this.convertBlocks(dxf.blocks || {});
      
      // Bounds hesapla
      const bounds = this.calculateBounds(entities);

      return {
        entities,
        layers,
        blocks,
        bounds,
        units: dxf.header?.$INSUNITS || 'Meters',
        version: dxf.header?.$ACADVER || 'Unknown'
      };
    } catch (error) {
      console.error('DWG parse error:', error);
      throw new Error('DWG dosyası okunamadı: ' + (error as Error).message);
    }
  }

  // Entities'leri dönüştür
  private convertEntities(entities: any[]): DWGEntity[] {
    return entities.map((entity, index) => {
      const baseEntity = {
        id: `entity_${index}_${Date.now()}`,
        layer: entity.layer || '0',
        color: entity.color || 7,
        lineType: entity.lineTypeName,
        lineWeight: entity.lineweight,
        visible: true
      };

      switch (entity.type) {
        case 'LINE':
          return {
            ...baseEntity,
            type: 'LINE',
            vertices: [
              { x: entity.vertices[0].x, y: entity.vertices[0].y, z: entity.vertices[0].z || 0 },
              { x: entity.vertices[1].x, y: entity.vertices[1].y, z: entity.vertices[1].z || 0 }
            ]
          } as DWGEntity;

        case 'CIRCLE':
          return {
            ...baseEntity,
            type: 'CIRCLE',
            position: { 
              x: entity.center.x, 
              y: entity.center.y, 
              z: entity.center.z || 0 
            },
            radius: entity.radius
          } as DWGEntity;

        case 'ARC':
          return {
            ...baseEntity,
            type: 'ARC',
            position: { 
              x: entity.center.x, 
              y: entity.center.y, 
              z: entity.center.z || 0 
            },
            radius: entity.radius,
            startAngle: entity.startAngle,
            endAngle: entity.endAngle
          } as DWGEntity;

        case 'LWPOLYLINE':
        case 'POLYLINE':
          return {
            ...baseEntity,
            type: 'POLYLINE',
            vertices: entity.vertices.map((v: any) => ({
              x: v.x,
              y: v.y,
              z: v.z || 0
            }))
          } as DWGEntity;

        case 'TEXT':
        case 'MTEXT':
          return {
            ...baseEntity,
            type: 'TEXT',
            position: {
              x: entity.startPoint?.x || entity.position?.x || 0,
              y: entity.startPoint?.y || entity.position?.y || 0,
              z: entity.startPoint?.z || entity.position?.z || 0
            },
            text: entity.text,
            height: entity.textHeight || entity.height || 1,
            rotation: entity.rotation || 0
          } as DWGEntity;

        case 'INSERT':
          return {
            ...baseEntity,
            type: 'INSERT',
            position: {
              x: entity.position.x,
              y: entity.position.y,
              z: entity.position.z || 0
            },
            blockName: entity.name,
            rotation: entity.rotation || 0
          } as DWGEntity;

        case 'DIMENSION':
          return {
            ...baseEntity,
            type: 'DIMENSION',
            vertices: entity.vertices?.map((v: any) => ({
              x: v.x,
              y: v.y,
              z: v.z || 0
            })) || []
          } as DWGEntity;

        default:
          console.warn('Unsupported entity type:', entity.type);
          return null;
      }
    }).filter(e => e !== null) as DWGEntity[];
  }

  // Layers'ları dönüştür
  private convertLayers(layers: any): DWGLayer[] {
    return Object.values(layers).map((layer: any) => ({
      name: layer.name,
      color: layer.color || 7,
      visible: !layer.visible || layer.visible === true,
      frozen: layer.frozen || false,
      locked: layer.locked || false
    }));
  }

  // Blocks'ları dönüştür
  private convertBlocks(blocks: any): DWGBlock[] {
    return Object.values(blocks).map((block: any) => ({
      name: block.name,
      position: {
        x: block.position?.x || 0,
        y: block.position?.y || 0,
        z: block.position?.z || 0
      },
      entities: this.convertEntities(block.entities || [])
    }));
  }

  // Bounds hesapla
  private calculateBounds(entities: DWGEntity[]): ParsedDWG['bounds'] {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = 0, maxZ = 0;

    entities.forEach(entity => {
      if (entity.vertices) {
        entity.vertices.forEach(v => {
          minX = Math.min(minX, v.x);
          maxX = Math.max(maxX, v.x);
          minY = Math.min(minY, v.y);
          maxY = Math.max(maxY, v.y);
          minZ = Math.min(minZ, v.z);
          maxZ = Math.max(maxZ, v.z);
        });
      }
      if (entity.position) {
        minX = Math.min(minX, entity.position.x);
        maxX = Math.max(maxX, entity.position.x);
        minY = Math.min(minY, entity.position.y);
        maxY = Math.max(maxY, entity.position.y);
        minZ = Math.min(minZ, entity.position.z);
        maxZ = Math.max(maxZ, entity.position.z);
      }
      if (entity.radius) {
        const pos = entity.position!;
        minX = Math.min(minX, pos.x - entity.radius);
        maxX = Math.max(maxX, pos.x + entity.radius);
        minY = Math.min(minY, pos.y - entity.radius);
        maxY = Math.max(maxY, pos.y + entity.radius);
      }
    });

    return { minX, maxX, minY, maxY, minZ, maxZ };
  }

  // DWG'yi ölçeklendir
  scaleDWG(parsed: ParsedDWG, scale: number): ParsedDWG {
    const scalePoint = (p: { x: number; y: number; z: number }) => ({
      x: p.x * scale,
      y: p.y * scale,
      z: p.z * scale
    });

    const scaledEntities = parsed.entities.map(entity => ({
      ...entity,
      vertices: entity.vertices?.map(scalePoint),
      position: entity.position ? scalePoint(entity.position) : undefined,
      radius: entity.radius ? entity.radius * scale : undefined,
      height: entity.height ? entity.height * scale : undefined
    }));

    return {
      ...parsed,
      entities: scaledEntities,
      bounds: {
        minX: parsed.bounds.minX * scale,
        maxX: parsed.bounds.maxX * scale,
        minY: parsed.bounds.minY * scale,
        maxY: parsed.bounds.maxY * scale,
        minZ: parsed.bounds.minZ * scale,
        maxZ: parsed.bounds.maxZ * scale
      }
    };
  }

  // DWG'yi merkeze al
  centerDWG(parsed: ParsedDWG): ParsedDWG {
    const centerX = (parsed.bounds.minX + parsed.bounds.maxX) / 2;
    const centerY = (parsed.bounds.minY + parsed.bounds.maxY) / 2;

    const offsetPoint = (p: { x: number; y: number; z: number }) => ({
      x: p.x - centerX,
      y: p.y - centerY,
      z: p.z
    });

    const centeredEntities = parsed.entities.map(entity => ({
      ...entity,
      vertices: entity.vertices?.map(offsetPoint),
      position: entity.position ? offsetPoint(entity.position) : undefined
    }));

    return {
      ...parsed,
      entities: centeredEntities,
      bounds: {
        minX: parsed.bounds.minX - centerX,
        maxX: parsed.bounds.maxX - centerX,
        minY: parsed.bounds.minY - centerY,
        maxY: parsed.bounds.maxY - centerY,
        minZ: parsed.bounds.minZ,
        maxZ: parsed.bounds.maxZ
      }
    };
  }
}

export const dwgParser = new DWGParserService();