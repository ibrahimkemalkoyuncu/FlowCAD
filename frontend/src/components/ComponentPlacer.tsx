// ============================================
// 10. ComponentPlacer.tsx - Cihaz Yerleştirme
// ============================================
import { useFrame, useThree } from '@react-three/fiber';
import { useState } from 'react';
import { useDrawingStore, type Point3D } from '../store/useDrawingStore'; // ✅ DÜZELTİLDİ
import * as THREE from 'three';

export const ComponentPlacer: React.FC = () => {
  const { mode, addComponent } = useDrawingStore();
  const { camera, raycaster } = useThree();
  const [previewPos, setPreviewPos] = useState<Point3D | null>(null);
  
  useFrame((state) => {
    if (!['valve', 'meter', 'boiler', 'elbow'].includes(mode)) {
      setPreviewPos(null);
      return;
    }
    
    const mouse = state.pointer;
    raycaster.setFromCamera(mouse, camera);
    
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(groundPlane, intersectPoint);
    
    if (intersectPoint) {
      const { snapToGrid, gridSize } = useDrawingStore.getState();
      if (snapToGrid) {
        intersectPoint.x = Math.round(intersectPoint.x / gridSize) * gridSize;
        intersectPoint.y = Math.round(intersectPoint.y / gridSize) * gridSize;
        intersectPoint.z = Math.round(intersectPoint.z / gridSize) * gridSize;
      }
      setPreviewPos({ x: intersectPoint.x, y: intersectPoint.y, z: intersectPoint.z });
    }
  });
  
  const handleClick = (e: any) => {
    e.stopPropagation();
    if (!previewPos || !['valve', 'meter', 'boiler', 'elbow'].includes(mode)) return;
    
    const componentNames: Record<string, string> = {
      valve: 'Küresel Vana',
      meter: 'Sayaç',
      boiler: 'Kombi',
      elbow: 'Dirsek 90°'
    };
    
    addComponent({
      id: `component_${Date.now()}`,
      type: mode,
      position: previewPos,
      rotation: [0, 0, 0],
      componentId: 0,
      name: componentNames[mode] || mode
    });
  };
  
  if (!previewPos || !['valve', 'meter', 'boiler', 'elbow'].includes(mode)) return null;
  
  return (
    <mesh 
      position={[previewPos.x, previewPos.y, previewPos.z]} 
      onClick={handleClick}
    >
      {mode === 'valve' && <cylinderGeometry args={[0.2, 0.2, 0.4, 8]} />}
      {mode === 'meter' && <boxGeometry args={[0.6, 0.4, 0.3]} />}
      {mode === 'boiler' && <boxGeometry args={[1.2, 1.5, 0.6]} />}
      {mode === 'elbow' && <torusGeometry args={[0.3, 0.08, 8, 16, Math.PI / 2]} />}
      <meshBasicMaterial color="#3b82f6" transparent opacity={0.5} wireframe />
    </mesh>
  );
};