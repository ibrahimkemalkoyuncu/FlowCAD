// ============================================
// PROPERTY PANEL - Özellikler Paneli
// Konum: frontend/src/components/PropertyPanel.tsx
// Seçili objelerin özelliklerini gösterir ve düzenler
// ============================================

import React from 'react';
import { useDrawingStore } from '../store/useDrawingStore';

// ============================================
// PROPERTY PANEL COMPONENT
// ============================================

export const PropertyPanel: React.FC = () => {
  const { 
    selectedId, 
    pipes, 
    components, 
    updateComponent, 
    removePipe, 
    removeComponent 
  } = useDrawingStore();
  
  // Hiçbir şey seçili değilse
  if (!selectedId) {
    return (
      <div className="w-80 bg-white border-l shadow-lg p-6 h-full">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <div className="text-gray-400 text-sm">
            Düzenlemek için bir obje seçin
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Boru veya cihaza tıklayın
          </div>
        </div>
      </div>
    );
  }
  
  // Seçili objeyi bul
  const selectedPipe = pipes.find(p => p.id === selectedId);
  const selectedComponent = components.find(c => c.id === selectedId);
  
  // ============================================
  // BORU ÖZELLİKLERİ PANELI
  // ============================================
  
  if (selectedPipe) {
    return (
      <div className="w-80 bg-white border-l shadow-lg p-4 overflow-y-auto h-full">
        {/* Başlık */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg mb-4 -mx-4 -mt-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span>🔧</span>
            <span>Boru Özellikleri</span>
          </h3>
        </div>
        
        <div className="space-y-4">
          {/* ID */}
          <div>
            <label className="text-xs text-gray-600 font-medium block mb-1">ID</label>
            <div className="font-mono text-xs bg-gray-100 px-3 py-2 rounded border">
              {selectedPipe.id.slice(0, 16)}...
            </div>
          </div>
          
          {/* Çap */}
          <div>
            <label className="text-xs text-gray-600 font-medium block mb-1">Çap</label>
            <div className="font-semibold text-blue-600 text-lg">
              {selectedPipe.diameter}
            </div>
          </div>
          
          {/* Uzunluk */}
          <div>
            <label className="text-xs text-gray-600 font-medium block mb-1">Uzunluk</label>
            <div className="font-semibold text-green-600 text-lg">
              {selectedPipe.length?.toFixed(2)} m
            </div>
          </div>
          
          {/* Malzeme */}
          <div>
            <label className="text-xs text-gray-600 font-medium block mb-1">Malzeme</label>
            <div className="font-medium text-gray-800">
              {selectedPipe.material || 'PPR'}
            </div>
          </div>
          
          {/* Koordinatlar */}
          <div>
            <label className="text-xs text-gray-600 font-medium block mb-2">Koordinatlar</label>
            <div className="bg-gray-50 p-3 rounded border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Başlangıç (X, Z):</span>
                <span className="font-mono font-medium">
                  {selectedPipe.start.x.toFixed(2)}, {selectedPipe.start.z.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bitiş (X, Z):</span>
                <span className="font-mono font-medium">
                  {selectedPipe.end.x.toFixed(2)}, {selectedPipe.end.z.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Sil butonu */}
          <button
            onClick={() => removePipe(selectedId)}
            className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium shadow-md flex items-center justify-center gap-2"
          >
            <span>🗑️</span>
            <span>Boruyu Sil</span>
          </button>
        </div>
      </div>
    );
  }
  
  // ============================================
  // CİHAZ ÖZELLİKLERİ PANELI
  // ============================================
  
  if (selectedComponent) {
    return (
      <div className="w-80 bg-white border-l shadow-lg p-4 overflow-y-auto h-full">
        {/* Başlık */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-lg mb-4 -mx-4 -mt-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span>⚙️</span>
            <span>Cihaz Özellikleri</span>
          </h3>
        </div>
        
        <div className="space-y-4">
          {/* İsim */}
          <div>
            <label className="text-xs text-gray-600 font-medium block mb-1">İsim</label>
            <input
              type="text"
              value={selectedComponent.name}
              onChange={(e) => updateComponent(selectedId, { name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          
          {/* Tip */}
          <div>
            <label className="text-xs text-gray-600 font-medium block mb-1">Tip</label>
            <div className="font-medium capitalize bg-purple-50 px-3 py-2 rounded border border-purple-200 text-purple-700">
              {selectedComponent.type}
            </div>
          </div>
          
          {/* Pozisyon */}
          <div>
            <label className="text-xs text-gray-600 font-medium block mb-2">Pozisyon (X, Y, Z)</label>
            <div className="space-y-2">
              <input
                type="number"
                value={selectedComponent.position.x.toFixed(2)}
                onChange={(e) => updateComponent(selectedId, {
                  position: { ...selectedComponent.position, x: parseFloat(e.target.value) }
                })}
                className="w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-purple-500"
                placeholder="X koordinatı"
                step="0.1"
              />
              <input
                type="number"
                value={selectedComponent.position.y.toFixed(2)}
                onChange={(e) => updateComponent(selectedId, {
                  position: { ...selectedComponent.position, y: parseFloat(e.target.value) }
                })}
                className="w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-purple-500"
                placeholder="Y koordinatı"
                step="0.1"
              />
              <input
                type="number"
                value={selectedComponent.position.z.toFixed(2)}
                onChange={(e) => updateComponent(selectedId, {
                  position: { ...selectedComponent.position, z: parseFloat(e.target.value) }
                })}
                className="w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-purple-500"
                placeholder="Z koordinatı"
                step="0.1"
              />
            </div>
          </div>
          
          {/* Sil butonu */}
          <button
            onClick={() => removeComponent(selectedId)}
            className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium shadow-md flex items-center justify-center gap-2"
          >
            <span>🗑️</span>
            <span>Cihazı Sil</span>
          </button>
        </div>
      </div>
    );
  }
  
  return null;
};

export default PropertyPanel;