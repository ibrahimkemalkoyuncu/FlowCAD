// ============================================
// src/components/InteractiveScene3D.tsx
// ============================================
import React from 'react';
import { Grid, OrbitControls } from '@react-three/drei';
import { useDrawingStore, type Point3D, type PipeSegment, type ComponentInstance } from '../store/useDrawingStore';
import { BlueprintRenderer } from './BlueprintRenderer';
import { ComponentPlacer } from './ComponentPlacer';

// GroundPlane bileşeni
const GroundPlane: React.FC = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#f0f0f0" transparent opacity={0.5} />
    </mesh>
  );
};

// PipeRenderer bileşeni
const PipeRenderer: React.FC = () => {
  const { pipes, selectedId } = useDrawingStore();
  
  return (
    <>
      {pipes.map((pipe) => (
        <mesh key={pipe.id} position={getPipePosition(pipe)} rotation={getPipeRotation(pipe)}>
          <cylinderGeometry args={[0.05, 0.05, getPipeLength(pipe), 8]} />
          <meshStandardMaterial 
            color={pipe.id === selectedId ? '#3b82f6' : '#6b7280'} 
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>
      ))}
    </>
  );
};

// ComponentRenderer bileşeni
const ComponentRenderer: React.FC = () => {
  const { components, selectedId } = useDrawingStore();
  
  return (
    <>
      {components.map((component) => (
        <mesh 
          key={component.id} 
          position={[component.position.x, component.position.y, component.position.z]}
          rotation={component.rotation as [number, number, number]}
        >
          {getComponentGeometry(component)}
          <meshStandardMaterial 
            color={component.id === selectedId ? '#3b82f6' : '#ef4444'} 
            metalness={0.4}
            roughness={0.6}
          />
        </mesh>
      ))}
    </>
  );
};

// TempPipeRenderer bileşeni
const TempPipeRenderer: React.FC = () => {
  const { tempPoints } = useDrawingStore();
  
  return (
    <>
      {tempPoints.map((point, index) => (
        <mesh key={index} position={[point.x, point.y, point.z]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.7} />
        </mesh>
      ))}
      {tempPoints.length > 1 && (
        <>
          {tempPoints.slice(0, -1).map((point, index) => {
            const nextPoint = tempPoints[index + 1];
            const position = [
              (point.x + nextPoint.x) / 2,
              (point.y + nextPoint.y) / 2,
              (point.z + nextPoint.z) / 2
            ];
            const length = Math.sqrt(
              Math.pow(nextPoint.x - point.x, 2) +
              Math.pow(nextPoint.y - point.y, 2) +
              Math.pow(nextPoint.z - point.z, 2)
            );
            const rotation = getRotationBetweenPoints(point, nextPoint);
            
            return (
              <mesh key={`temp-${index}`} position={position as [number, number, number]} rotation={rotation}>
                <cylinderGeometry args={[0.05, 0.05, length, 8]} />
                <meshBasicMaterial color="#3b82f6" transparent opacity={0.5} />
              </mesh>
            );
          })}
        </>
      )}
    </>
  );
};

// SelectionHighlight bileşeni
const SelectionHighlight: React.FC = () => {
  const { selectedId, pipes, components } = useDrawingStore();
  
  if (!selectedId) return null;
  
  const selectedPipe = pipes.find(p => p.id === selectedId);
  const selectedComponent = components.find(c => c.id === selectedId);
  
  if (selectedPipe) {
    return (
      <mesh position={getPipePosition(selectedPipe)} rotation={getPipeRotation(selectedPipe)}>
        <cylinderGeometry args={[0.07, 0.07, getPipeLength(selectedPipe), 8]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} wireframe />
      </mesh>
    );
  }
  
  if (selectedComponent) {
    return (
      <mesh 
        position={[selectedComponent.position.x, selectedComponent.position.y, selectedComponent.position.z]}
        rotation={selectedComponent.rotation as [number, number, number]}
      >
        {getComponentGeometry(selectedComponent, 1.2)}
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} wireframe />
      </mesh>
    );
  }
  
  return null;
};

// Yardımcı fonksiyonlar
const getPipePosition = (pipe: PipeSegment): [number, number, number] => {
  return [
    (pipe.start.x + pipe.end.x) / 2,
    (pipe.start.y + pipe.end.y) / 2,
    (pipe.start.z + pipe.end.z) / 2
  ];
};

const getPipeLength = (pipe: PipeSegment): number => {
  return Math.sqrt(
    Math.pow(pipe.end.x - pipe.start.x, 2) +
    Math.pow(pipe.end.y - pipe.start.y, 2) +
    Math.pow(pipe.end.z - pipe.start.z, 2)
  );
};

const getPipeRotation = (pipe: PipeSegment): [number, number, number] => {
  const dx = pipe.end.x - pipe.start.x;
  const dy = pipe.end.y - pipe.start.y;
  const dz = pipe.end.z - pipe.start.z;
  
  return [0, Math.atan2(dz, dx), Math.atan2(dy, Math.sqrt(dx * dx + dz * dz))];
};

const getRotationBetweenPoints = (start: Point3D, end: Point3D): [number, number, number] => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dz = end.z - start.z;
  
  return [0, Math.atan2(dz, dx), Math.atan2(dy, Math.sqrt(dx * dx + dz * dz))];
};

const getComponentGeometry = (component: ComponentInstance, scale: number = 1) => {
  switch (component.type) {
    case 'meter':
      return <boxGeometry args={[0.6 * scale, 0.4 * scale, 0.3 * scale]} />;
    case 'valve':
      return <cylinderGeometry args={[0.2 * scale, 0.2 * scale, 0.4 * scale, 8]} />;
    case 'boiler':
      return <boxGeometry args={[1.2 * scale, 1.5 * scale, 0.6 * scale]} />;
    case 'elbow':
      return <torusGeometry args={[0.3 * scale, 0.08 * scale, 8, 16, Math.PI / 2]} />;
    default:
      return <boxGeometry args={[0.5 * scale, 0.5 * scale, 0.5 * scale]} />;
  }
};

// Ana SceneContent bileşeni
export const SceneContent: React.FC = () => {
  const { mode } = useDrawingStore();
  
  return (
    <>
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={mode === 'select'}
        maxPolarAngle={Math.PI / 2}
      />
      
      {/* Lights */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      
      {/* Grid */}
      <Grid args={[50, 50]} cellSize={1} />
      
      {/* BLUEPRINTS - En altta, grid üzerinde */}
      <BlueprintRenderer />
      
      {/* Ground plane */}
      <GroundPlane />
      
      {/* Drawing components */}
      <PipeRenderer />
      <ComponentRenderer />
      <TempPipeRenderer />
      <SelectionHighlight />
      <ComponentPlacer />
    </>
  );
};

export { useDrawingStore, type Point3D };