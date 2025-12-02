// ============================================
// MEASURE TOOL - AutoCAD Benzeri Ölçü Aracı
// Konum: frontend/src/components/MeasureTool.tsx
// Mesafe, açı ve alan ölçümü özellikleri
// ============================================

import React, { useState, useCallback, useEffect } from 'react';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Measurement {
  id: string;
  type: 'distance' | 'angle' | 'area' | 'radius';
  points: Point3D[];
  value: number;
  unit: string;
  timestamp: Date;
}

interface MeasureToolProps {
  onClose: () => void;
  containerRef?: React.RefObject<HTMLDivElement>;
}

// ============================================
// CONSTANTS
// ============================================

const MEASUREMENT_UNITS = {
  mm: { factor: 1000, label: 'mm', precision: 1 },
  cm: { factor: 100, label: 'cm', precision: 2 },
  m: { factor: 1, label: 'm', precision: 3 },
  inch: { factor: 39.3701, label: 'in', precision: 2 },
  foot: { factor: 3.28084, label: 'ft', precision: 3 },
};

const ANGLE_UNITS = {
  deg: { factor: 1, label: '°', precision: 2 },
  rad: { factor: Math.PI / 180, label: 'rad', precision: 4 },
  grad: { factor: 10 / 9, label: 'grad', precision: 2 },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const calculateDistance = (p1: Point3D, p2: Point3D): number => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

const calculateAngle = (p1: Point3D, vertex: Point3D, p2: Point3D): number => {
  const v1 = { x: p1.x - vertex.x, y: p1.y - vertex.y, z: p1.z - vertex.z };
  const v2 = { x: p2.x - vertex.x, y: p2.y - vertex.y, z: p2.z - vertex.z };
  
  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);
  
  if (mag1 === 0 || mag2 === 0) return 0;
  
  const cosAngle = Math.min(1, Math.max(-1, dot / (mag1 * mag2)));
  return Math.acos(cosAngle) * (180 / Math.PI);
};

const calculatePolygonArea = (points: Point3D[]): number => {
  if (points.length < 3) return 0;
  
  // Shoelace formula for 2D polygon (using X and Y)
  let area = 0;
  const n = points.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  
  return Math.abs(area) / 2;
};

const formatValue = (value: number, precision: number): string => {
  return value.toFixed(precision);
};

// ============================================
// MEASURE TOOL COMPONENT
// ============================================

const MeasureTool: React.FC<MeasureToolProps> = ({ onClose }) => {
  // State
  const [measureMode, setMeasureMode] = useState<'distance' | 'angle' | 'area' | 'radius'>('distance');
  const [points, setPoints] = useState<Point3D[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [currentUnit, setCurrentUnit] = useState<keyof typeof MEASUREMENT_UNITS>('m');
  const [angleUnit, setAngleUnit] = useState<keyof typeof ANGLE_UNITS>('deg');
  const [isActive, setIsActive] = useState(false);
  const [inputMode, setInputMode] = useState<'click' | 'manual'>('manual');
  const [manualInput, setManualInput] = useState({ x: '', y: '', z: '' });

  // ============================================
  // POINT MANAGEMENT
  // ============================================

  const addPoint = useCallback((point: Point3D) => {
    setPoints(prev => {
      const newPoints = [...prev, point];
      
      // Auto-complete measurement based on mode
      if (measureMode === 'distance' && newPoints.length === 2) {
        const distance = calculateDistance(newPoints[0], newPoints[1]);
        const measurement: Measurement = {
          id: `measure_${Date.now()}`,
          type: 'distance',
          points: [...newPoints],
          value: distance,
          unit: currentUnit,
          timestamp: new Date(),
        };
        setMeasurements(prev => [...prev, measurement]);
        return [];
      }
      
      if (measureMode === 'angle' && newPoints.length === 3) {
        const angle = calculateAngle(newPoints[0], newPoints[1], newPoints[2]);
        const measurement: Measurement = {
          id: `measure_${Date.now()}`,
          type: 'angle',
          points: [...newPoints],
          value: angle,
          unit: angleUnit,
          timestamp: new Date(),
        };
        setMeasurements(prev => [...prev, measurement]);
        return [];
      }
      
      if (measureMode === 'radius' && newPoints.length === 2) {
        const radius = calculateDistance(newPoints[0], newPoints[1]);
        const measurement: Measurement = {
          id: `measure_${Date.now()}`,
          type: 'radius',
          points: [...newPoints],
          value: radius,
          unit: currentUnit,
          timestamp: new Date(),
        };
        setMeasurements(prev => [...prev, measurement]);
        return [];
      }
      
      return newPoints;
    });
  }, [measureMode, currentUnit, angleUnit]);

  const addManualPoint = () => {
    const x = parseFloat(manualInput.x) || 0;
    const y = parseFloat(manualInput.y) || 0;
    const z = parseFloat(manualInput.z) || 0;
    
    addPoint({ x, y, z });
    setManualInput({ x: '', y: '', z: '' });
  };

  const completeAreaMeasurement = () => {
    if (measureMode === 'area' && points.length >= 3) {
      const area = calculatePolygonArea(points);
      const measurement: Measurement = {
        id: `measure_${Date.now()}`,
        type: 'area',
        points: [...points],
        value: area,
        unit: `${currentUnit}²`,
        timestamp: new Date(),
      };
      setMeasurements(prev => [...prev, measurement]);
      setPoints([]);
    }
  };

  const clearPoints = () => {
    setPoints([]);
  };

  const deleteMeasurement = (id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
  };

  const clearAllMeasurements = () => {
    setMeasurements([]);
    setPoints([]);
  };

  // ============================================
  // KEYBOARD SHORTCUTS
  // ============================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return;
      
      if (e.key === 'Escape') {
        clearPoints();
      } else if (e.key === 'Enter' && measureMode === 'area') {
        completeAreaMeasurement();
      } else if (e.key === 'd' || e.key === 'D') {
        setMeasureMode('distance');
        clearPoints();
      } else if (e.key === 'a' || e.key === 'A') {
        setMeasureMode('angle');
        clearPoints();
      } else if (e.key === 'r' || e.key === 'R') {
        setMeasureMode('radius');
        clearPoints();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, measureMode, points]);

  // ============================================
  // LIVE MEASUREMENT DISPLAY
  // ============================================

  const getLiveMeasurement = (): string | null => {
    if (points.length === 0) return null;
    
    if (measureMode === 'distance' && points.length === 1) {
      return 'İkinci noktayı girin...';
    }
    
    if (measureMode === 'angle') {
      if (points.length === 1) return 'Köşe noktasını girin...';
      if (points.length === 2) return 'Üçüncü noktayı girin...';
    }
    
    if (measureMode === 'area') {
      if (points.length < 3) return `${points.length}/3+ nokta (Enter ile tamamla)`;
      return `${points.length} nokta (Enter ile tamamla)`;
    }
    
    if (measureMode === 'radius' && points.length === 1) {
      return 'Yarıçap noktasını girin...';
    }
    
    return null;
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📏</span>
            <div>
              <h2 className="text-xl font-bold">Ölçü Aracı</h2>
              <p className="text-blue-200 text-sm">Mesafe, açı ve alan ölçümü</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-500/30 hover:bg-blue-500/50 transition-colors"
            title="Kapat (ESC)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setMeasureMode('distance'); clearPoints(); }}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              measureMode === 'distance'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border hover:bg-gray-100'
            }`}
          >
            <span>📐</span>
            <span>Mesafe (D)</span>
          </button>
          <button
            onClick={() => { setMeasureMode('angle'); clearPoints(); }}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              measureMode === 'angle'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-white text-gray-700 border hover:bg-gray-100'
            }`}
          >
            <span>📐</span>
            <span>Açı (A)</span>
          </button>
          <button
            onClick={() => { setMeasureMode('area'); clearPoints(); }}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              measureMode === 'area'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-700 border hover:bg-gray-100'
            }`}
          >
            <span>⬛</span>
            <span>Alan</span>
          </button>
          <button
            onClick={() => { setMeasureMode('radius'); clearPoints(); }}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              measureMode === 'radius'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white text-gray-700 border hover:bg-gray-100'
            }`}
          >
            <span>⭕</span>
            <span>Yarıçap (R)</span>
          </button>
        </div>
      </div>

      {/* Unit Selection */}
      <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Uzunluk Birimi:</span>
          <select
            value={currentUnit}
            onChange={(e) => setCurrentUnit(e.target.value as keyof typeof MEASUREMENT_UNITS)}
            className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.entries(MEASUREMENT_UNITS).map(([key, unit]) => (
              <option key={key} value={key}>{unit.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Açı Birimi:</span>
          <select
            value={angleUnit}
            onChange={(e) => setAngleUnit(e.target.value as keyof typeof ANGLE_UNITS)}
            className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.entries(ANGLE_UNITS).map(([key, unit]) => (
              <option key={key} value={key}>{unit.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Giriş:</span>
          <button
            onClick={() => setInputMode('manual')}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              inputMode === 'manual' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Manuel
          </button>
          <button
            onClick={() => { setInputMode('click'); setIsActive(true); }}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              inputMode === 'click' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Tıklama
          </button>
        </div>
      </div>

      {/* Manual Point Input */}
      {inputMode === 'manual' && (
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[100px]">
              <label className="block text-xs text-gray-600 mb-1">X</label>
              <input
                type="number"
                value={manualInput.x}
                onChange={(e) => setManualInput(prev => ({ ...prev, x: e.target.value }))}
                placeholder="0.00"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 min-w-[100px]">
              <label className="block text-xs text-gray-600 mb-1">Y</label>
              <input
                type="number"
                value={manualInput.y}
                onChange={(e) => setManualInput(prev => ({ ...prev, y: e.target.value }))}
                placeholder="0.00"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 min-w-[100px]">
              <label className="block text-xs text-gray-600 mb-1">Z</label>
              <input
                type="number"
                value={manualInput.z}
                onChange={(e) => setManualInput(prev => ({ ...prev, z: e.target.value }))}
                placeholder="0.00"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={addManualPoint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span>➕</span>
              <span>Nokta Ekle</span>
            </button>
            {measureMode === 'area' && points.length >= 3 && (
              <button
                onClick={completeAreaMeasurement}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <span>✓</span>
                <span>Tamamla</span>
              </button>
            )}
          </div>
          
          {/* Current Points */}
          {points.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {points.map((point, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-white rounded border text-xs"
                >
                  P{index + 1}: ({point.x.toFixed(2)}, {point.y.toFixed(2)}, {point.z.toFixed(2)})
                </span>
              ))}
              <button
                onClick={clearPoints}
                className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200"
              >
                Temizle
              </button>
            </div>
          )}
          
          {/* Live Measurement Hint */}
          {getLiveMeasurement() && (
            <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
              <span className="animate-pulse">●</span>
              <span>{getLiveMeasurement()}</span>
            </div>
          )}
        </div>
      )}

      {/* Measurements List */}
      <div className="p-4 max-h-64 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-800">Ölçümler ({measurements.length})</h3>
          {measurements.length > 0 && (
            <button
              onClick={clearAllMeasurements}
              className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <span>🗑️</span>
              <span>Tümünü Temizle</span>
            </button>
          )}
        </div>
        
        {measurements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl mb-3 block">📏</span>
            <p>Henüz ölçüm yapılmadı</p>
            <p className="text-sm mt-1">Nokta girerek ölçüm yapın</p>
          </div>
        ) : (
          <div className="space-y-2">
            {measurements.map((measurement) => {
              const unitConfig = measurement.type === 'angle' 
                ? ANGLE_UNITS[angleUnit]
                : MEASUREMENT_UNITS[currentUnit];
              
              const displayValue = measurement.type === 'angle'
                ? measurement.value * (ANGLE_UNITS[angleUnit].factor)
                : measurement.value * (MEASUREMENT_UNITS[currentUnit].factor);
              
              const icon = {
                distance: '📐',
                angle: '📐',
                area: '⬛',
                radius: '⭕',
              }[measurement.type];
              
              const bgColor = {
                distance: 'bg-blue-50 border-blue-200',
                angle: 'bg-orange-50 border-orange-200',
                area: 'bg-green-50 border-green-200',
                radius: 'bg-purple-50 border-purple-200',
              }[measurement.type];
              
              const label = {
                distance: 'Mesafe',
                angle: 'Açı',
                area: 'Alan',
                radius: 'Yarıçap',
              }[measurement.type];

              return (
                <div
                  key={measurement.id}
                  className={`p-3 rounded-lg border ${bgColor} flex items-center justify-between group`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{icon}</span>
                    <div>
                      <div className="font-medium text-gray-800">
                        {formatValue(displayValue, unitConfig.precision)} {measurement.type === 'area' ? `${currentUnit}²` : unitConfig.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {label} • {measurement.points.length} nokta
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMeasurement(measurement.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 transition-all"
                    title="Sil"
                  >
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Measure Examples */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 mb-2">Hızlı Örnekler:</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setMeasureMode('distance');
              addPoint({ x: 0, y: 0, z: 0 });
              addPoint({ x: 5, y: 0, z: 0 });
            }}
            className="px-3 py-1.5 bg-white border rounded text-xs hover:bg-gray-100"
          >
            5m Yatay Çizgi
          </button>
          <button
            onClick={() => {
              setMeasureMode('angle');
              addPoint({ x: 1, y: 0, z: 0 });
              addPoint({ x: 0, y: 0, z: 0 });
              addPoint({ x: 0, y: 1, z: 0 });
            }}
            className="px-3 py-1.5 bg-white border rounded text-xs hover:bg-gray-100"
          >
            90° Açı
          </button>
          <button
            onClick={() => {
              setMeasureMode('area');
              addPoint({ x: 0, y: 0, z: 0 });
              addPoint({ x: 10, y: 0, z: 0 });
              addPoint({ x: 10, y: 10, z: 0 });
              addPoint({ x: 0, y: 10, z: 0 });
              completeAreaMeasurement();
            }}
            className="px-3 py-1.5 bg-white border rounded text-xs hover:bg-gray-100"
          >
            100m² Kare
          </button>
          <button
            onClick={() => {
              setMeasureMode('radius');
              addPoint({ x: 0, y: 0, z: 0 });
              addPoint({ x: 2.5, y: 0, z: 0 });
            }}
            className="px-3 py-1.5 bg-white border rounded text-xs hover:bg-gray-100"
          >
            2.5m Yarıçap
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex gap-4">
            <span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded">D</kbd> Mesafe</span>
            <span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded">A</kbd> Açı</span>
            <span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded">R</kbd> Yarıçap</span>
            <span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded">ESC</kbd> İptal</span>
          </div>
          <div className="text-gray-400">
            FlowCAD Ölçü Aracı v1.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeasureTool;
