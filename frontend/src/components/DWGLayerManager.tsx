// ============================================
// 6. src/components/DWGLayerManager.tsx - Katman Yönetimi
// ============================================
import React from 'react';
import { useBlueprintStore } from '../store/useBlueprintStore'; // Bu import'u ekle

export const DWGLayerManager: React.FC = () => {
  const { blueprints } = useBlueprintStore();
  const [selectedBlueprintId, setSelectedBlueprintId] = React.useState<string | null>(null);
  
  const dwgBlueprints = blueprints.filter(bp => bp.type === 'dxf' && (bp as any).dwgData);
  const selectedBlueprint = dwgBlueprints.find(bp => bp.id === selectedBlueprintId);
  const dwgData = selectedBlueprint ? (selectedBlueprint as any).dwgData : null;
  
  if (dwgBlueprints.length === 0) return null;
  
  return (
    <div className="absolute top-20 left-4 bg-white/95 backdrop-blur rounded-lg shadow-xl p-4 min-w-[250px] max-h-[500px] overflow-hidden flex flex-col">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span>📐</span> DWG Katmanlar
      </h3>
      
      {/* DWG Selector */}
      {dwgBlueprints.length > 1 && (
        <div className="mb-3">
          <select
            value={selectedBlueprintId || ''}
            onChange={(e) => setSelectedBlueprintId(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">DWG Seç...</option>
            {dwgBlueprints.map(bp => (
              <option key={bp.id} value={bp.id}>{bp.name}</option>
            ))}
          </select>
        </div>
      )}
      
      {/* Layers */}
      {dwgData && (
        <div className="flex-1 overflow-y-auto space-y-1">
          <div className="text-xs text-gray-500 mb-2">
            {dwgData.layers.length} katman
          </div>
          {dwgData.layers.map((layer: any, index: number) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                checked={layer.visible}
                onChange={() => {
                  // Layer visibility toggle
                  layer.visible = !layer.visible;
                }}
                className="w-4 h-4"
              />
              <div
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: getEntityColor(layer.color) }}
              ></div>
              <span className="text-sm flex-1">{layer.name}</span>
              {layer.frozen && <span className="text-xs text-blue-500">❄️</span>}
              {layer.locked && <span className="text-xs text-red-500">🔒</span>}
            </div>
          ))}
        </div>
      )}
      
      {/* Stats */}
      {dwgData && (
        <div className="mt-3 pt-3 border-t text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Toplam Entity:</span>
            <span className="font-semibold">{dwgData.entities.length}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// getEntityColor fonksiyonunu da eklemeyi unutmayalım
const getEntityColor = (colorNumber: number): string => {
  const colorMap: Record<number, string> = {
    1: '#FF0000', // Red
    2: '#FFFF00', // Yellow
    3: '#00FF00', // Green
    4: '#00FFFF', // Cyan
    5: '#0000FF', // Blue
    6: '#FF00FF', // Magenta
    7: '#FFFFFF', // White
    8: '#808080', // Gray
  };
  return colorMap[colorNumber] || '#000000';
};