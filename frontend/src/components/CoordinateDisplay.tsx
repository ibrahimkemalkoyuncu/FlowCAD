// ============================================
// COORDINATE DISPLAY - AutoCAD Benzeri Koordinat Göstergesi
// Konum: frontend/src/components/CoordinateDisplay.tsx
// Mouse pozisyonu ve koordinat bilgisi gösterir
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { useDrawingStore } from '../store/useDrawingStore';

// ============================================
// INTERFACE
// ============================================

interface CoordinateDisplayProps {
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

type DisplayMode = 'absolute' | 'relative' | 'polar';

// ============================================
// COMPONENT
// ============================================

export const CoordinateDisplay: React.FC<CoordinateDisplayProps> = ({ containerRef }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, z: 0 });
  const [displayMode, setDisplayMode] = useState<DisplayMode>('absolute');
  const [lastPoint, setLastPoint] = useState<{ x: number; z: number } | null>(null);
  
  const { tempPoints, mode } = useDrawingStore();

  // Update last point when tempPoints change
  useEffect(() => {
    if (tempPoints.length > 0) {
      const last = tempPoints[tempPoints.length - 1];
      setLastPoint({ x: last.x, z: last.z });
    } else {
      setLastPoint(null);
    }
  }, [tempPoints]);

  // Mouse move handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Calculate world coordinates from screen position
    // This is a simplified calculation - the actual calculation 
    // should use raycasting in the 3D scene
    const container = containerRef?.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 40 - 20; // Map to -20 to 20
      const z = ((e.clientY - rect.top) / rect.height) * 40 - 20;
      setMousePos({ x, y: 0, z: -z }); // Invert z for screen coordinates
    }
  }, [containerRef]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Calculate relative/polar values
  const getRelativeCoords = () => {
    if (!lastPoint) return { dx: 0, dz: 0 };
    return {
      dx: mousePos.x - lastPoint.x,
      dz: mousePos.z - lastPoint.z
    };
  };

  const getPolarCoords = () => {
    if (!lastPoint) return { distance: 0, angle: 0 };
    const dx = mousePos.x - lastPoint.x;
    const dz = mousePos.z - lastPoint.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dz, dx) * (180 / Math.PI);
    return { distance, angle: angle < 0 ? angle + 360 : angle };
  };

  const relative = getRelativeCoords();
  const polar = getPolarCoords();

  return (
    <div className="fixed bottom-52 left-4 z-40">
      {/* Coordinate Box */}
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700 overflow-hidden">
        {/* Header with mode selector */}
        <div className="flex items-center justify-between bg-gray-800 px-3 py-1.5 border-b border-gray-700">
          <span className="text-xs text-gray-400 font-medium">📍 Koordinatlar</span>
          <div className="flex gap-1">
            {(['absolute', 'relative', 'polar'] as DisplayMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setDisplayMode(m)}
                className={`
                  px-2 py-0.5 text-xs rounded transition-colors font-mono
                  ${displayMode === m 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }
                `}
              >
                {m === 'absolute' ? 'ABS' : m === 'relative' ? 'REL' : 'POL'}
              </button>
            ))}
          </div>
        </div>
        
        {/* Coordinate Values */}
        <div className="px-3 py-2 font-mono text-sm">
          {displayMode === 'absolute' && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-red-400 w-8">X:</span>
                <span className="text-white">{mousePos.x.toFixed(4)}</span>
                <span className="text-gray-500 text-xs">m</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 w-8">Y:</span>
                <span className="text-white">{mousePos.y.toFixed(4)}</span>
                <span className="text-gray-500 text-xs">m</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400 w-8">Z:</span>
                <span className="text-white">{mousePos.z.toFixed(4)}</span>
                <span className="text-gray-500 text-xs">m</span>
              </div>
            </div>
          )}

          {displayMode === 'relative' && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-red-400 w-8">ΔX:</span>
                <span className={`${relative.dx >= 0 ? 'text-white' : 'text-orange-400'}`}>
                  {relative.dx >= 0 ? '+' : ''}{relative.dx.toFixed(4)}
                </span>
                <span className="text-gray-500 text-xs">m</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400 w-8">ΔZ:</span>
                <span className={`${relative.dz >= 0 ? 'text-white' : 'text-orange-400'}`}>
                  {relative.dz >= 0 ? '+' : ''}{relative.dz.toFixed(4)}
                </span>
                <span className="text-gray-500 text-xs">m</span>
              </div>
              {!lastPoint && (
                <div className="text-gray-500 text-xs italic">
                  (Referans noktası yok)
                </div>
              )}
            </div>
          )}

          {displayMode === 'polar' && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-purple-400 w-8">D:</span>
                <span className="text-white">{polar.distance.toFixed(4)}</span>
                <span className="text-gray-500 text-xs">m</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 w-8">∠:</span>
                <span className="text-white">{polar.angle.toFixed(2)}</span>
                <span className="text-gray-500 text-xs">°</span>
              </div>
              {!lastPoint && (
                <div className="text-gray-500 text-xs italic">
                  (Referans noktası yok)
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Footer */}
        <div className="px-3 py-1.5 bg-gray-800 border-t border-gray-700 flex items-center justify-between text-xs">
          <span className={`
            font-medium
            ${mode === 'pipe' ? 'text-green-400' : 'text-gray-400'}
          `}>
            {mode === 'pipe' ? '✏️ Çizim Aktif' : '👆 Hazır'}
          </span>
          {lastPoint && (
            <span className="text-gray-500">
              Son: ({lastPoint.x.toFixed(2)}, {lastPoint.z.toFixed(2)})
            </span>
          )}
        </div>
      </div>

      {/* Grid & Snap Indicators */}
      <div className="mt-2 flex gap-2">
        <SnapIndicator />
      </div>
    </div>
  );
};

// ============================================
// SNAP INDICATOR SUB-COMPONENT
// ============================================

const SnapIndicator: React.FC = () => {
  const { snapSettings } = useDrawingStore();

  const indicators = [
    { key: 'snapToGrid', label: 'GRID', icon: '📐' },
    { key: 'snapToEndpoints', label: 'END', icon: '🔴' },
    { key: 'snapToMidpoints', label: 'MID', icon: '🟡' },
    { key: 'snapToIntersections', label: 'INT', icon: '❌' },
    { key: 'snapToCenter', label: 'CEN', icon: '⭕' },
    { key: 'snapToPerpendicular', label: 'PER', icon: '📏' },
  ];

  return (
    <div className="flex flex-wrap gap-1">
      {indicators.map(({ key, label, icon }) => {
        const isActive = snapSettings.enabled && snapSettings[key as keyof typeof snapSettings];
        return (
          <div
            key={key}
            className={`
              px-2 py-1 rounded text-xs font-mono flex items-center gap-1
              transition-colors
              ${isActive 
                ? 'bg-green-600/80 text-white' 
                : 'bg-gray-800/80 text-gray-500'
              }
            `}
            title={`${label}: ${isActive ? 'Açık' : 'Kapalı'}`}
          >
            <span>{icon}</span>
            <span className="hidden sm:inline">{label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default CoordinateDisplay;
