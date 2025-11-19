import React from 'react';
import { Html } from '@react-three/drei';
import type { SnapPoint } from '../utils/snapUtils';
import { getSnapColor, getSnapIcon } from '../utils/snapUtils';

interface Props {
  snapInfo: SnapPoint | null;
}

export const SnapVisualizer: React.FC<Props> = ({ snapInfo }) => {
  if (!snapInfo) return null;

  const color = getSnapColor(snapInfo.type);
  const icon = getSnapIcon(snapInfo.type);

  return (
    <group position={[snapInfo.point.x, snapInfo.point.y + 0.1, snapInfo.point.z]}>
      {/* 3D Marker */}
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} />
      </mesh>
      
      {/* Ring effect */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.3, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>

      {/* Label */}
      <Html center distanceFactor={10}>
        <div className="bg-white px-2 py-1 rounded shadow-lg border-2 text-xs whitespace-nowrap"
             style={{ borderColor: color }}>
          <span style={{ color }} className="font-bold mr-1">{icon}</span>
          <span className="font-medium">{snapInfo.reference}</span>
        </div>
      </Html>
    </group>
  );
};