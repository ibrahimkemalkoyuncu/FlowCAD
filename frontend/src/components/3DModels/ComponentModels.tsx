// ============================================
// 3D Component Models - Gerçekçi Cihaz Modelleri
// ============================================
import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// ============================================
// KOMBİ MODELİ (Gerçekçi)
// ============================================
interface BoilerProps {
  position: [number, number, number];
  selected?: boolean;
  onClick?: (e: any) => void;
}

export const BoilerModel: React.FC<BoilerProps> = ({ position, selected, onClick }) => {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef} position={position} onClick={onClick}>
      {/* Ana gövde - Dikdörtgen kutu */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 1.5, 0.3]} />
        <meshStandardMaterial 
          color={selected ? '#3b82f6' : '#f0f0f0'} 
          metalness={0.3}
          roughness={0.5}
        />
      </mesh>

      {/* Ön panel */}
      <mesh position={[0, 0.75, 0.16]} castShadow>
        <boxGeometry args={[0.5, 1.3, 0.02]} />
        <meshStandardMaterial 
          color="#e5e7eb" 
          metalness={0.1}
          roughness={0.7}
        />
      </mesh>

      {/* Kontrol paneli (üstte) */}
      <mesh position={[0, 1.3, 0.17]} castShadow>
        <boxGeometry args={[0.4, 0.2, 0.03]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>

      {/* Dijital ekran */}
      <mesh position={[0, 1.3, 0.19]}>
        <planeGeometry args={[0.15, 0.08]} />
        <meshBasicMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
      </mesh>

      {/* ✅ GİRİŞ BAĞLANTISI (Sol alt - Soğuk Su) */}
      <group position={[-0.25, 0.2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.15, 8]} />
          <meshStandardMaterial color="#3b82f6" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Bağlantı ucu */}
        <mesh position={[0, -0.075, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#3b82f6" />
        </mesh>
      </group>

      {/* ✅ ÇIKIŞ BAĞLANTISI (Sağ alt - Sıcak Su) */}
      <group position={[0.25, 0.2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.15, 8]} />
          <meshStandardMaterial color="#ef4444" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Bağlantı ucu */}
        <mesh position={[0, -0.075, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* ✅ GAZ GİRİŞİ (Alt orta) */}
      <group position={[0, 0.1, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.1, 8]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, -0.05]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      </group>

      {/* Baca çıkışı (üstte) */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.2, 12]} />
        <meshStandardMaterial color="#6b7280" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Marka logosu (dekoratif) */}
      <mesh position={[0, 1.0, 0.18]}>
        <planeGeometry args={[0.2, 0.1]} />
        <meshBasicMaterial color="#1f2937" />
      </mesh>

      {/* Seçim highlight */}
      {selected && (
        <mesh position={[0, 0.75, 0]}>
          <boxGeometry args={[0.7, 1.6, 0.35]} />
          <meshBasicMaterial 
            color="#3b82f6" 
            transparent 
            opacity={0.2} 
            wireframe 
          />
        </mesh>
      )}
    </group>
  );
};

// ============================================
// SAYAÇ MODELİ (Gerçekçi)
// ============================================
interface MeterProps {
  position: [number, number, number];
  selected?: boolean;
  onClick?: (e: any) => void;
}

export const MeterModel: React.FC<MeterProps> = ({ position, selected, onClick }) => {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef} position={position} onClick={onClick}>
      {/* Ana gövde */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.5, 0.2]} />
        <meshStandardMaterial 
          color={selected ? '#3b82f6' : '#1f2937'} 
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>

      {/* Cam ekran */}
      <mesh position={[0, 0.35, 0.11]} castShadow>
        <boxGeometry args={[0.3, 0.25, 0.02]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transparent
          opacity={0.3}
          metalness={0.9}
          roughness={0.1}
          clearcoat={1}
        />
      </mesh>

      {/* Dijital gösterge */}
      <mesh position={[0, 0.35, 0.13]}>
        <planeGeometry args={[0.25, 0.15]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Sayılar (LED gösterge efekti) */}
      <mesh position={[0, 0.35, 0.14]}>
        <planeGeometry args={[0.2, 0.08]} />
        <meshBasicMaterial 
          color="#ff0000" 
          emissive="#ff0000" 
          emissiveIntensity={0.5} 
        />
      </mesh>

      {/* ✅ GİRİŞ BAĞLANTISI (Sol) */}
      <group position={[-0.25, 0.3, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.15, 8]} />
          <meshStandardMaterial color="#3b82f6" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Bağlantı ucu */}
        <mesh position={[0, -0.075, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#3b82f6" />
        </mesh>
      </group>

      {/* ✅ ÇIKIŞ BAĞLANTISI (Sağ) */}
      <group position={[0.25, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.15, 8]} />
          <meshStandardMaterial color="#ef4444" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Bağlantı ucu */}
        <mesh position={[0, -0.075, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* Montaj dirseği (alt) */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.5, 0.05, 0.25]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>

      {/* Vida delikleri */}
      <mesh position={[-0.2, 0, 0.13]}>
        <cylinderGeometry args={[0.015, 0.015, 0.06, 8]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[0.2, 0, 0.13]}>
        <cylinderGeometry args={[0.015, 0.015, 0.06, 8]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>

      {/* Seçim highlight */}
      {selected && (
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.5, 0.6, 0.25]} />
          <meshBasicMaterial 
            color="#3b82f6" 
            transparent 
            opacity={0.2} 
            wireframe 
          />
        </mesh>
      )}
    </group>
  );
};

// ============================================
// VANA MODELİ (Küresel Vana)
// ============================================
interface ValveProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  selected?: boolean;
  onClick?: (e: any) => void;
}

export const ValveModel: React.FC<ValveProps> = ({ position, rotation = [0, 0, 0], selected, onClick }) => {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef} position={position} rotation={rotation} onClick={onClick}>
      {/* Küresel gövde */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial 
          color={selected ? '#3b82f6' : '#fbbf24'} 
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Kol */}
      <group position={[0, 0.15, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
          <meshStandardMaterial color="#ef4444" metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[0.08, 0.03, 0.03]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* ✅ GİRİŞ */}
      <group position={[-0.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.1, 8]} />
          <meshStandardMaterial color="#6b7280" metalness={0.7} />
        </mesh>
        <mesh position={[0, -0.05, 0]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshBasicMaterial color="#3b82f6" />
        </mesh>
      </group>

      {/* ✅ ÇIKIŞ */}
      <group position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.1, 8]} />
          <meshStandardMaterial color="#6b7280" metalness={0.7} />
        </mesh>
        <mesh position={[0, -0.05, 0]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* Seçim highlight */}
      {selected && (
        <mesh>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial 
            color="#3b82f6" 
            transparent 
            opacity={0.2} 
            wireframe 
          />
        </mesh>
      )}
    </group>
  );
};

// ============================================
// BAĞLANTI NOKTALARI BİLGİSİ
// ============================================
export const CONNECTION_POINTS = {
  boiler: {
    coldIn: { offset: [-0.25, 0.125, 0], type: 'input', color: '#3b82f6' },  // Sol alt
    hotOut: { offset: [0.25, 0.125, 0], type: 'output', color: '#ef4444' },  // Sağ alt
    gas: { offset: [0, 0.05, 0], type: 'input', color: '#fbbf24' }           // Alt orta
  },
  meter: {
    input: { offset: [-0.325, 0.3, 0], type: 'input', color: '#3b82f6' },    // Sol
    output: { offset: [0.325, 0.3, 0], type: 'output', color: '#ef4444' }    // Sağ
  },
  valve: {
    input: { offset: [-0.25, 0, 0], type: 'input', color: '#3b82f6' },
    output: { offset: [0.25, 0, 0], type: 'output', color: '#ef4444' }
  }
};

// ============================================
// YARDIMCI FONKSİYON: Bağlantı Noktası Hesaplama
// ============================================
export const getConnectionPoint = (
  componentType: string,
  componentPosition: [number, number, number],
  connectionType: 'input' | 'output' | 'gas'
): [number, number, number] => {
  const points = CONNECTION_POINTS[componentType as keyof typeof CONNECTION_POINTS];
  if (!points) return componentPosition;

  const point = Object.values(points).find(p => p.type === connectionType);
  if (!point) return componentPosition;

  return [
    componentPosition[0] + point.offset[0],
    componentPosition[1] + point.offset[1],
    componentPosition[2] + point.offset[2]
  ];
};