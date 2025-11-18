// ============================================
// src/components/InteractiveScene3D.tsx - İyileştirilmiş Versiyon
// ============================================
import React from 'react';
import { Grid, OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useDrawingStore, type Point3D, type PipeSegment, type ComponentInstance } from '../store/useDrawingStore';
import { BlueprintRenderer } from './BlueprintRenderer';
import { ComponentPlacer } from './ComponentPlacer';
import * as THREE from 'three';
import toast from 'react-hot-toast';

// ✅ CLICKABLE GROUND PLANE - İYİLEŞTİRİLMİŞ
const ClickableGroundPlane: React.FC = () => {
  const { mode, addTempPoint, completePipe, snapToGrid, gridSize, tempPoints } = useDrawingStore();
  const { camera, size } = useThree();

  const handleClick = (event: any) => {
    event.stopPropagation();
    
    // Sadece pipe modunda çalış
    if (mode !== 'pipe') return;

    // Mouse pozisyonunu normalize et
    const rect = event.target.getBoundingClientRect?.() || { left: 0, top: 0 };
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const mouse = new THREE.Vector2(
      (x / size.width) * 2 - 1,
      -(y / size.height) * 2 + 1
    );

    // Raycaster ile kesişim bul
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // Ground plane oluştur (Y=0 seviyesinde)
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectPoint = new THREE.Vector3();
    const intersection = raycaster.ray.intersectPlane(groundPlane, intersectPoint);

    if (intersection) {
      // Grid snap uygula
      let finalX = intersection.x;
      let finalZ = intersection.z;
      
      if (snapToGrid) {
        finalX = Math.round(intersection.x / gridSize) * gridSize;
        finalZ = Math.round(intersection.z / gridSize) * gridSize;
      }

      const point: Point3D = {
        x: finalX,
        y: 0, // ✅ Zemin seviyesinde sabit
        z: finalZ
      };

      console.log('Nokta eklendi:', point); // ✅ Debug için

      addTempPoint(point);
      
      // 2 nokta varsa boruyu tamamla
      const currentTempPoints = useDrawingStore.getState().tempPoints;
      
      if (currentTempPoints.length >= 2) {
        completePipe();
        const lastPipe = useDrawingStore.getState().pipes[useDrawingStore.getState().pipes.length - 1];
        if (lastPipe) {
          toast.success(`Boru eklendi! Uzunluk: ${lastPipe.length?.toFixed(2)}m`);
        }
      } else {
        toast('İlk nokta seçildi. İkinci noktayı seçin.', { 
          icon: '📍',
          duration: 2000 
        });
      }
    }
  };

  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, 0, 0]} // ✅ Y=0 tam zemin seviyesi
      onClick={handleClick}
      receiveShadow
    >
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial 
        color="#f0f0f0" 
        transparent 
        opacity={mode === 'pipe' ? 0.3 : 0.5} // ✅ Pipe modunda daha saydam
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// ✅ GROUND VISUAL (Sadece görsel, tıklanamaz)
const GroundVisual: React.FC = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial 
        color="#e5e7eb" 
        transparent 
        opacity={0.3}
      />
    </mesh>
  );
};

// ✅ PIPE RENDERER - İYİLEŞTİRİLMİŞ
const PipeRenderer: React.FC = () => {
  const { pipes, selectedId, selectObject } = useDrawingStore();
  
  return (
    <>
      {pipes.map((pipe) => {
        const position = getPipePosition(pipe);
        const rotation = getPipeRotation(pipe);
        const length = getPipeLength(pipe);
        
        return (
          <group key={pipe.id}>
            {/* Ana boru */}
            <mesh 
              position={position} 
              rotation={rotation}
              onClick={(e) => {
                e.stopPropagation();
                selectObject(pipe.id);
                toast(`Boru seçildi: ${pipe.length?.toFixed(2)}m`, { icon: '🔧' });
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'default';
              }}
            >
              <cylinderGeometry args={[0.05, 0.05, length, 16]} />
              <meshStandardMaterial 
                color={pipe.id === selectedId ? '#3b82f6' : '#6b7280'} 
                metalness={0.5}
                roughness={0.3}
              />
            </mesh>
            
            {/* Başlangıç noktası marker */}
            <mesh position={[pipe.start.x, pipe.start.y, pipe.start.z]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshBasicMaterial color="#10b981" />
            </mesh>
            
            {/* Bitiş noktası marker */}
            <mesh position={[pipe.end.x, pipe.end.y, pipe.end.z]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
          </group>
        );
      })}
    </>
  );
};

// ✅ COMPONENT RENDERER - İYİLEŞTİRİLMİŞ
const ComponentRenderer: React.FC = () => {
  const { components, selectedId, selectObject } = useDrawingStore();
  
  return (
    <>
      {components.map((component) => (
        <mesh 
          key={component.id} 
          position={[component.position.x, component.position.y, component.position.z]}
          rotation={component.rotation as [number, number, number]}
          onClick={(e) => {
            e.stopPropagation();
            selectObject(component.id);
            toast(`${component.name} seçildi`, { icon: '⚙️' });
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'default';
          }}
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

// ✅ TEMP PIPE RENDERER - PREVIEW GÖSTER
const TempPipeRenderer: React.FC = () => {
  const { tempPoints, mode } = useDrawingStore();
  
  if (mode !== 'pipe') return null;
  
  return (
    <>
      {/* Geçici noktalar */}
      {tempPoints.map((point, index) => (
        <mesh key={index} position={[point.x, point.y + 0.05, point.z]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.8} />
          {/* Nokta numarası */}
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </mesh>
      ))}
      
      {/* Geçici boru önizlemesi */}
      {tempPoints.length > 1 && (
        <>
          {tempPoints.slice(0, -1).map((point, index) => {
            const nextPoint = tempPoints[index + 1];
            const position: [number, number, number] = [
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
              <mesh key={`temp-${index}`} position={position} rotation={rotation}>
                <cylinderGeometry args={[0.06, 0.06, length, 16]} />
                <meshBasicMaterial 
                  color="#3b82f6" 
                  transparent 
                  opacity={0.6}
                  wireframe={false}
                />
              </mesh>
            );
          })}
        </>
      )}
      
      {/* İlk nokta seçildiyse yardımcı metin */}
      {tempPoints.length === 1 && (
        <mesh position={[tempPoints[0].x, 1, tempPoints[0].z]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      )}
    </>
  );
};

// ✅ MOUSE FOLLOWER - Boru modunda fare takip
const MouseFollower: React.FC = () => {
  const { mode, tempPoints, snapToGrid, gridSize } = useDrawingStore();
  const { camera, size } = useThree();
  const [mousePos, setMousePos] = React.useState<Point3D | null>(null);

  React.useEffect(() => {
    if (mode !== 'pipe' || tempPoints.length === 0) {
      setMousePos(null);
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const mouse = new THREE.Vector2(
        (event.clientX / size.width) * 2 - 1,
        -(event.clientY / size.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersectPoint = new THREE.Vector3();
      const intersection = raycaster.ray.intersectPlane(groundPlane, intersectPoint);

      if (intersection) {
        let finalX = intersection.x;
        let finalZ = intersection.z;
        
        if (snapToGrid) {
          finalX = Math.round(intersection.x / gridSize) * gridSize;
          finalZ = Math.round(intersection.z / gridSize) * gridSize;
        }

        setMousePos({ x: finalX, y: 0, z: finalZ });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mode, tempPoints, snapToGrid, gridSize, camera, size]);

  if (!mousePos || tempPoints.length === 0) return null;

  const lastPoint = tempPoints[tempPoints.length - 1];
  const position: [number, number, number] = [
    (lastPoint.x + mousePos.x) / 2,
    (lastPoint.y + mousePos.y) / 2,
    (lastPoint.z + mousePos.z) / 2
  ];
  const length = Math.sqrt(
    Math.pow(mousePos.x - lastPoint.x, 2) +
    Math.pow(mousePos.y - lastPoint.y, 2) +
    Math.pow(mousePos.z - lastPoint.z, 2)
  );
  const rotation = getRotationBetweenPoints(lastPoint, mousePos);

  return (
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={[0.04, 0.04, length, 12]} />
      <meshBasicMaterial 
        color="#fbbf24" 
        transparent 
        opacity={0.4}
        wireframe
      />
    </mesh>
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
        <cylinderGeometry args={[0.08, 0.08, getPipeLength(selectedPipe), 16]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.2} wireframe />
      </mesh>
    );
  }
  
  if (selectedComponent) {
    return (
      <mesh 
        position={[selectedComponent.position.x, selectedComponent.position.y, selectedComponent.position.z]}
        rotation={selectedComponent.rotation as [number, number, number]}
      >
        {getComponentGeometry(selectedComponent, 1.3)}
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.2} wireframe />
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
  
  const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (length === 0) return [0, 0, 0];
  
  // Y ekseninde rotasyon (yatay düzlem)
  const rotationY = Math.atan2(dx, dz);
  
  // X ekseninde rotasyon (dikey)
  const rotationX = Math.asin(dy / length);
  
  return [rotationX, rotationY, 0];
};

const getRotationBetweenPoints = (start: Point3D, end: Point3D): [number, number, number] => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dz = end.z - start.z;
  
  const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (length === 0) return [0, 0, 0];
  
  const rotationY = Math.atan2(dx, dz);
  const rotationX = Math.asin(dy / length);
  
  return [rotationX, rotationY, 0];
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
        minDistance={5}
        maxDistance={50}
      />
      
      {/* Lights */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[-10, 10, -10]} intensity={0.3} />
      
      {/* Grid */}
      <Grid 
        args={[50, 50]} 
        cellSize={1}
        cellThickness={0.6}
        cellColor="#9ca3af"
        sectionSize={5}
        sectionThickness={1.5}
        sectionColor="#3b82f6"
        fadeDistance={100}
        fadeStrength={1}
        followCamera={false}
      />
      
      {/* BLUEPRINTS */}
      <BlueprintRenderer />
      
      {/* Ground planes */}
      <GroundVisual />
      <ClickableGroundPlane />
      
      {/* Drawing components */}
      <PipeRenderer />
      <ComponentRenderer />
      <TempPipeRenderer />
      <MouseFollower />
      <SelectionHighlight />
      <ComponentPlacer />
    </>
  );
};

export { useDrawingStore, type Point3D };