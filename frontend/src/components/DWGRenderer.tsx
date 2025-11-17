// ============================================
// 5. src/components/DWGRenderer.tsx - 3D Render
// ============================================
import React from 'react';
import * as THREE from 'three';
import { Line, Text } from '@react-three/drei'; // Circle'ı kaldırdık
import { useBlueprintStore } from '../store/useBlueprintStore';

export const DWGRenderer: React.FC = () => {
  const { blueprints } = useBlueprintStore();
  
  return (
    <>
      {blueprints
        .filter(bp => bp.type === 'dxf' && bp.visible && (bp as any).dwgData)
        .map(blueprint => {
          const dwgData = (blueprint as any).dwgData;
          return (
            <group 
              key={blueprint.id}
              position={[blueprint.position.x, blueprint.position.y, blueprint.position.z]}
              rotation={[0, blueprint.rotation * Math.PI / 180, 0]}
              scale={blueprint.scale}
            >
              <DWGEntities entities={dwgData.entities} opacity={blueprint.opacity} />
            </group>
          );
        })}
    </>
  );
};

interface DWGEntitiesProps {
  entities: any[];
  opacity: number;
}

const DWGEntities: React.FC<DWGEntitiesProps> = ({ entities, opacity }) => {
  return (
    <>
      {entities.map((entity, index) => {
        if (!entity.visible) return null;

        switch (entity.type) {
          case 'LINE':
            return <DWGLine key={entity.id || index} entity={entity} opacity={opacity} />;
          case 'CIRCLE':
            return <DWGCircle key={entity.id || index} entity={entity} opacity={opacity} />;
          case 'ARC':
            return <DWGArc key={entity.id || index} entity={entity} opacity={opacity} />;
          case 'POLYLINE':
            return <DWGPolyline key={entity.id || index} entity={entity} opacity={opacity} />;
          case 'TEXT':
            return <DWGText key={entity.id || index} entity={entity} />; // opacity parametresini kaldırdık
          default:
            return null;
        }
      })}
    </>
  );
};

const DWGLine: React.FC<{ entity: any; opacity: number }> = ({ entity, opacity }) => {
  const points = entity.vertices.map((v: any) => new THREE.Vector3(v.x, v.z, -v.y));
  
  return (
    <Line
      points={points}
      color={getEntityColor(entity.color)}
      lineWidth={1}
      transparent
      opacity={opacity}
    />
  );
};

const DWGCircle: React.FC<{ entity: any; opacity: number }> = ({ entity, opacity }) => {
  return (
    <mesh
      position={[entity.position.x, entity.position.z, -entity.position.y]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <ringGeometry args={[entity.radius * 0.98, entity.radius, 64]} />
      <meshBasicMaterial
        color={getEntityColor(entity.color)}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const DWGArc: React.FC<{ entity: any; opacity: number }> = ({ entity, opacity }) => {
  const points: THREE.Vector3[] = [];
  const segments = 32;
  const startAngle = entity.startAngle * Math.PI / 180;
  const endAngle = entity.endAngle * Math.PI / 180;
  const angleRange = endAngle - startAngle;
  
  for (let i = 0; i <= segments; i++) {
    const angle = startAngle + (angleRange * i / segments);
    const x = entity.position.x + entity.radius * Math.cos(angle);
    const y = entity.position.y + entity.radius * Math.sin(angle);
    points.push(new THREE.Vector3(x, entity.position.z, -y));
  }
  
  return (
    <Line
      points={points}
      color={getEntityColor(entity.color)}
      lineWidth={1}
      transparent
      opacity={opacity}
    />
  );
};

const DWGPolyline: React.FC<{ entity: any; opacity: number }> = ({ entity, opacity }) => {
  const points = entity.vertices.map((v: any) => new THREE.Vector3(v.x, v.z, -v.y));
  
  return (
    <Line
      points={points}
      color={getEntityColor(entity.color)}
      lineWidth={1}
      transparent
      opacity={opacity}
    />
  );
};

const DWGText: React.FC<{ entity: any }> = ({ entity }) => { // opacity parametresini kaldırdık
  return (
    <Text
      position={[entity.position.x, entity.position.z + 0.1, -entity.position.y]}
      rotation={[-Math.PI / 2, 0, entity.rotation || 0]}
      fontSize={entity.height || 0.5}
      color={getEntityColor(entity.color)}
      anchorX="left"
      anchorY="bottom"
      outlineWidth={0.02}
      outlineColor="#000000"
    >
      {entity.text || ''}
    </Text>
  );
};

// AutoCAD renk tablosu
function getEntityColor(colorIndex: number): string {
  const acadColors: Record<number, string> = {
    1: '#FF0000', // Kırmızı
    2: '#FFFF00', // Sarı
    3: '#00FF00', // Yeşil
    4: '#00FFFF', // Cyan
    5: '#0000FF', // Mavi
    6: '#FF00FF', // Magenta
    7: '#FFFFFF', // Beyaz
    8: '#808080', // Gri
    9: '#C0C0C0', // Açık Gri
    250: '#333333', // Koyu
  };
  return acadColors[colorIndex] || '#888888';
}