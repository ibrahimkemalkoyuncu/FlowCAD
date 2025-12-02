// ============================================
// DXF EXPORTER SERVICE - DXF Dışa Aktarma Servisi
// Konum: frontend/src/services/dxfExporter.ts
// Çizimleri DXF formatına dönüştürür ve indirir
// ============================================

import type { ParsedDWG, DWGEntity, DWGLayer } from '../types/dwg';

// ============================================
// INTERFACE - Proje Verileri
// ============================================

export interface ProjectData {
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  pipes: Array<{
    id: string;
    startPoint: { x: number; y: number; z: number };
    endPoint: { x: number; y: number; z: number };
    diameter: string;
    length: number;
  }>;
  components: Array<{
    id: string;
    type: string;
    position: { x: number; y: number; z: number };
    rotation?: [number, number, number] | number;
  }>;
  dxfData?: ParsedDWG;
}

// ============================================
// DXF EXPORTER CLASS
// ============================================

class DXFExporterService {
  
  // ============================================
  // DXF HEADER - Dosya Başlığı
  // ============================================
  
  private generateHeader(): string {
    return `0
SECTION
2
HEADER
9
$ACADVER
1
AC1015
9
$INSUNITS
70
4
9
$MEASUREMENT
70
1
9
$EXTMIN
10
0.0
20
0.0
30
0.0
9
$EXTMAX
10
1000.0
20
1000.0
30
0.0
0
ENDSEC
`;
  }
  
  // ============================================
  // DXF TABLES - Katman Tanımları
  // ============================================
  
  private generateTables(layers: DWGLayer[]): string {
    let tables = `0
SECTION
2
TABLES
0
TABLE
2
LAYER
70
${layers.length + 1}
`;

    // Varsayılan katman
    tables += `0
LAYER
2
0
70
0
62
7
6
CONTINUOUS
`;

    // Kullanıcı katmanları
    layers.forEach(layer => {
      tables += `0
LAYER
2
${layer.name}
70
${layer.frozen ? 1 : 0}
62
${layer.color}
6
CONTINUOUS
`;
    });

    tables += `0
ENDTAB
0
ENDSEC
`;

    return tables;
  }
  
  // ============================================
  // DXF ENTITIES - Çizim Elemanları
  // ============================================
  
  private generateEntities(entities: DWGEntity[]): string {
    let entitiesSection = `0
SECTION
2
ENTITIES
`;

    entities.forEach(entity => {
      if (!entity.visible) return;
      
      switch (entity.type) {
        case 'LINE':
          if (entity.vertices && entity.vertices.length >= 2) {
            entitiesSection += this.generateLine(entity);
          }
          break;
        case 'CIRCLE':
          if (entity.position && entity.radius) {
            entitiesSection += this.generateCircle(entity);
          }
          break;
        case 'ARC':
          if (entity.position && entity.radius) {
            entitiesSection += this.generateArc(entity);
          }
          break;
        case 'POLYLINE':
          if (entity.vertices && entity.vertices.length >= 2) {
            entitiesSection += this.generatePolyline(entity);
          }
          break;
        case 'TEXT':
          if (entity.position && entity.text) {
            entitiesSection += this.generateText(entity);
          }
          break;
      }
    });

    entitiesSection += `0
ENDSEC
`;

    return entitiesSection;
  }
  
  // ============================================
  // ENTITY GENERATORS - Eleman Oluşturucular
  // ============================================
  
  private generateLine(entity: DWGEntity): string {
    const v = entity.vertices!;
    return `0
LINE
8
${entity.layer || '0'}
62
${entity.color || 7}
10
${v[0].x.toFixed(6)}
20
${v[0].y.toFixed(6)}
30
${v[0].z.toFixed(6)}
11
${v[1].x.toFixed(6)}
21
${v[1].y.toFixed(6)}
31
${v[1].z.toFixed(6)}
`;
  }
  
  private generateCircle(entity: DWGEntity): string {
    return `0
CIRCLE
8
${entity.layer || '0'}
62
${entity.color || 7}
10
${entity.position!.x.toFixed(6)}
20
${entity.position!.y.toFixed(6)}
30
${entity.position!.z.toFixed(6)}
40
${entity.radius!.toFixed(6)}
`;
  }
  
  private generateArc(entity: DWGEntity): string {
    return `0
ARC
8
${entity.layer || '0'}
62
${entity.color || 7}
10
${entity.position!.x.toFixed(6)}
20
${entity.position!.y.toFixed(6)}
30
${entity.position!.z.toFixed(6)}
40
${entity.radius!.toFixed(6)}
50
${(entity.startAngle || 0).toFixed(6)}
51
${(entity.endAngle || 360).toFixed(6)}
`;
  }
  
  private generatePolyline(entity: DWGEntity): string {
    let polyline = `0
LWPOLYLINE
8
${entity.layer || '0'}
62
${entity.color || 7}
90
${entity.vertices!.length}
70
0
`;

    entity.vertices!.forEach(v => {
      polyline += `10
${v.x.toFixed(6)}
20
${v.y.toFixed(6)}
`;
    });

    return polyline;
  }
  
  private generateText(entity: DWGEntity): string {
    return `0
TEXT
8
${entity.layer || '0'}
62
${entity.color || 7}
10
${entity.position!.x.toFixed(6)}
20
${entity.position!.y.toFixed(6)}
30
${entity.position!.z.toFixed(6)}
40
${(entity.height || 2.5).toFixed(6)}
1
${entity.text}
50
${(entity.rotation || 0).toFixed(6)}
`;
  }
  
  // ============================================
  // DXF FOOTER - Dosya Sonu
  // ============================================
  
  private generateFooter(): string {
    return `0
EOF
`;
  }
  
  // ============================================
  // EXPORT METHODS - Dışa Aktarma Metodları
  // ============================================
  
  /**
   * ParsedDWG verisini DXF formatına dönüştürür
   */
  exportToDXF(parsedDWG: ParsedDWG): string {
    const header = this.generateHeader();
    const tables = this.generateTables(parsedDWG.layers);
    const entities = this.generateEntities(parsedDWG.entities);
    const footer = this.generateFooter();
    
    return header + tables + entities + footer;
  }
  
  /**
   * Proje verisini DXF formatına dönüştürür
   */
  exportProjectToDXF(project: ProjectData): string {
    const entities: DWGEntity[] = [];
    const layers: DWGLayer[] = [
      { name: 'PIPES', color: 5, visible: true, frozen: false, locked: false },
      { name: 'COMPONENTS', color: 1, visible: true, frozen: false, locked: false },
      { name: 'TEXT', color: 7, visible: true, frozen: false, locked: false }
    ];
    
    // Boruları LINE olarak ekle
    project.pipes.forEach((pipe, index) => {
      entities.push({
        id: `pipe_${index}`,
        type: 'LINE',
        layer: 'PIPES',
        color: 5,
        visible: true,
        vertices: [
          { x: pipe.startPoint.x, y: pipe.startPoint.y, z: pipe.startPoint.z },
          { x: pipe.endPoint.x, y: pipe.endPoint.y, z: pipe.endPoint.z }
        ]
      });
    });
    
    // Cihazları CIRCLE olarak ekle
    project.components.forEach((comp, index) => {
      entities.push({
        id: `comp_${index}`,
        type: 'CIRCLE',
        layer: 'COMPONENTS',
        color: 1,
        visible: true,
        position: comp.position,
        radius: 0.5
      });
      
      // Cihaz tipi etiketi
      entities.push({
        id: `comp_text_${index}`,
        type: 'TEXT',
        layer: 'TEXT',
        color: 7,
        visible: true,
        position: {
          x: comp.position.x + 0.7,
          y: comp.position.y + 0.3,
          z: comp.position.z
        },
        text: comp.type,
        height: 0.3,
        rotation: 0
      });
    });
    
    // Eğer mevcut DXF verisi varsa, onu da ekle
    if (project.dxfData) {
      entities.push(...project.dxfData.entities);
      layers.push(...project.dxfData.layers.filter(l => 
        !layers.some(existing => existing.name === l.name)
      ));
    }
    
    const parsedDWG: ParsedDWG = {
      entities,
      layers,
      blocks: [],
      bounds: { minX: 0, maxX: 100, minY: 0, maxY: 100, minZ: 0, maxZ: 0 },
      units: 'Meters',
      version: 'AC1015'
    };
    
    return this.exportToDXF(parsedDWG);
  }
  
  /**
   * DXF dosyasını indirir
   */
  downloadDXF(content: string, filename: string = 'drawing.dxf'): void {
    const blob = new Blob([content], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.dxf') ? filename : `${filename}.dxf`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}

export const dxfExporter = new DXFExporterService();
