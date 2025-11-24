// ============================================
// 3. src/components/BlueprintRenderer.tsx - 3D'de Görüntüleme
// ============================================
import React, { useRef } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useBlueprintStore, type Blueprint } from '../store/useBlueprintStore';
import { DWGRenderer } from './DWGRenderer';

export const BlueprintRenderer: React.FC = () => {
  const { blueprints } = useBlueprintStore();
  
  return (
    <>
      {blueprints.map(blueprint => (
        blueprint.visible && blueprint.type === 'image' && (
          <BlueprintMesh key={blueprint.id} blueprint={blueprint} />
        )
      ))}
      {/* Use DWGRenderer for actual DXF/DWG rendering */}
      <DWGRenderer />
    </>
  );
};

interface BlueprintMeshProps {
  blueprint: Blueprint;
}

const BlueprintMesh: React.FC<BlueprintMeshProps> = ({ blueprint }) => {
  const { selectedBlueprintId, selectBlueprint } = useBlueprintStore();
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = React.useState(false);
  const isSelected = selectedBlueprintId === blueprint.id;
  
  // Load texture
  const texture = useTexture(blueprint.url);
  
  const handleClick = (e: any) => {
    if (blueprint.locked) return;
    e.stopPropagation();
    selectBlueprint(blueprint.id);
  };
  
  React.useEffect(() => {
    if (!blueprint.locked) {
      document.body.style.cursor = hovered ? 'move' : 'default';
    }
    return () => {
      document.body.style.cursor = 'default';
    };
  }, [hovered, blueprint.locked]);
  
  return (
    <group>
      <mesh
        ref={meshRef}
        position={[blueprint.position.x, blueprint.position.y + 0.01, blueprint.position.z]}
        rotation={[0, blueprint.rotation * Math.PI / 180, 0]}
        onClick={handleClick}
        onPointerOver={(e) => {
          if (!blueprint.locked) {
            e.stopPropagation();
            setHovered(true);
          }
        }}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry 
          args={[
            blueprint.width * blueprint.scale, 
            blueprint.height * blueprint.scale
          ]} 
        />
        <meshBasicMaterial 
          map={texture}
          transparent
          opacity={blueprint.opacity}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Selection border */}
      {isSelected && !blueprint.locked && (
        <lineSegments
          position={[blueprint.position.x, blueprint.position.y + 0.02, blueprint.position.z]}
          rotation={[0, blueprint.rotation * Math.PI / 180, 0]}
        >
          <edgesGeometry 
            args={[
              new THREE.PlaneGeometry(
                blueprint.width * blueprint.scale, 
                blueprint.height * blueprint.scale
              )
            ]} 
          />
          <lineBasicMaterial color="#3b82f6" linewidth={2} />
        </lineSegments>
      )}
    </group>
  );
};

// DXFRenderer placeholder removed - now using DWGRenderer component instead