// ============================================
// Scene3D.tsx - 3D Canvas Component (Tam ve Çalışır Halde)
// ============================================
import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// ============================================
// Pipe Component - Boru
// ============================================
interface PipeProps {
  start: [number, number, number];
  end: [number, number, number];
  radius?: number;
  color?: string;
}

const Pipe: React.FC<PipeProps> = ({ 
  start, 
  end, 
  radius = 0.1, 
  color = '#fbbf24' 
}) => {
  const ref = useRef<THREE.Mesh>(null);
  
  // Başlangıç ve bitiş noktaları
  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);
  
  // Yön ve uzunluk hesapla
  const direction = endVec.clone().sub(startVec);
  const length = direction.length();
  
  // Orta nokta (boru buraya yerleştirilecek)
  const midpoint = startVec.clone().add(direction.clone().multiplyScalar(0.5));
  
  // Rotasyon için quaternion hesapla
  const orientation = new THREE.Matrix4();
  orientation.lookAt(startVec, endVec, new THREE.Object3D().up);
  orientation.multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
  const quaternion = new THREE.Quaternion();
  quaternion.setFromRotationMatrix(orientation);
  
  return (
    <mesh 
      ref={ref} 
      position={midpoint} 
      quaternion={quaternion}
      castShadow
      receiveShadow
    >
      <cylinderGeometry args={[radius, radius, length, 16]} />
      <meshStandardMaterial 
        color={color} 
        metalness={0.7}
        roughness={0.3}
      />
    </mesh>
  );
};

// ============================================
// ComponentBox Component - Cihaz Kutusu
// ============================================
interface ComponentBoxProps {
  position: [number, number, number];
  color?: string;
}

const ComponentBox: React.FC<ComponentBoxProps> = ({ 
  position, 
  color = '#ef4444'
}) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <mesh 
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial 
        color={hovered ? '#3b82f6' : color} 
        metalness={0.5}
        roughness={0.5}
      />
    </mesh>
  );
};

// ============================================
// Main Scene3D Component
// ============================================
export const Scene3D: React.FC = () => {
  return (
    <div className="w-full h-full">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[10, 10, 10]} />
        <OrbitControls />
        
        {/* Lights */}
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1} 
          castShadow 
        />
        
        {/* Grid */}
        <Grid 
          args={[20, 20]} 
          cellSize={1} 
          cellThickness={0.5}
          cellColor="#6b7280"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#3b82f6"
          fadeDistance={50}
          fadeStrength={1}
          followCamera={false}
        />
        
        {/* Example pipe - Yatay boru */}
        <Pipe 
          start={[0, 0, 0]} 
          end={[5, 0, 0]} 
          radius={0.1}
        />
        
        {/* Example component - Sayaç */}
        <ComponentBox position={[5, 0, 0]} />
        
        {/* İkinci boru örneği - Dikey */}
        <Pipe 
          start={[0, 0, 0]}     // Başlangıç noktası
          end={[0, 3, 0]}       // Bitiş noktası
          radius={0.08}         // Kalınlık
          color="#f59e0b"       // Renk
        />
        
        {/* İkinci component - Kombi */}
        <ComponentBox 
          position={[0, 3, 0]} 
          color="#10b981"
        />
      </Canvas>
    </div>
  );
};

export default Scene3D;