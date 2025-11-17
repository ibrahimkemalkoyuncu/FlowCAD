// ============================================
// 5. src/components/BlueprintPanel.tsx - Kontrol Paneli

import React from "react";
import { useBlueprintStore } from "../store/useBlueprintStore";
import { BlueprintUploader } from "./BlueprintUploader";

// ============================================
export const BlueprintPanel: React.FC = () => {
  const { 
    blueprints, 
    selectedBlueprintId,
    selectBlueprint,
    removeBlueprint,
    toggleVisibility,
    toggleLock,
    setScale,
    setOpacity,
    setRotation,
    clearAllBlueprints
  } = useBlueprintStore();
  
  const [showUploader, setShowUploader] = React.useState(false);
  
  const selectedBlueprint = blueprints.find(b => b.id === selectedBlueprintId);
  
  return (
    <div className="w-72 bg-white border-l shadow-lg overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3">
        <h3 className="font-semibold text-lg">Klavuzlar</h3>
        <p className="text-xs text-purple-100 mt-1">Plan ve çizimler</p>
      </div>
      
      {/* Add button */}
      <div className="p-4 border-b">
        <button
          onClick={() => setShowUploader(true)}
          className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span>
          <span>Klavuz Yükle</span>
        </button>
      </div>
      
      {/* Blueprint list */}
      {blueprints.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-sm">Henüz klavuz yüklenmedi</p>
          <p className="text-xs mt-2">Plan veya çizim ekleyerek başlayın</p>
        </div>
      ) : (
        <div className="divide-y">
          {blueprints.map(blueprint => (
            <div
              key={blueprint.id}
              className={`
                p-4 cursor-pointer transition-colors
                ${selectedBlueprintId === blueprint.id 
                  ? 'bg-blue-50 border-l-4 border-blue-500' 
                  : 'hover:bg-gray-50'
                }
              `}
              onClick={() => selectBlueprint(blueprint.id)}
            >
              {/* Preview thumbnail */}
              {blueprint.type === 'image' && (
                <div className="mb-3 rounded overflow-hidden bg-gray-100">
                  <img 
                    src={blueprint.url} 
                    alt={blueprint.name}
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}
              
              {/* Info */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{blueprint.name}</h4>
                  <p className="text-xs text-gray-500 uppercase">{blueprint.type}</p>
                </div>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibility(blueprint.id);
                    }}
                    className={`p-1 rounded hover:bg-gray-200 ${!blueprint.visible && 'text-gray-400'}`}
                    title={blueprint.visible ? 'Gizle' : 'Göster'}
                  >
                    {blueprint.visible ? '👁️' : '👁️‍🗨️'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLock(blueprint.id);
                    }}
                    className={`p-1 rounded hover:bg-gray-200 ${blueprint.locked && 'text-yellow-600'}`}
                    title={blueprint.locked ? 'Kilidi Aç' : 'Kilitle'}
                  >
                    {blueprint.locked ? '🔒' : '🔓'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`${blueprint.name} silinsin mi?`)) {
                        removeBlueprint(blueprint.id);
                      }
                    }}
                    className="p-1 rounded hover:bg-red-100 text-red-600"
                    title="Sil"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              {/* Quick stats */}
              <div className="text-xs text-gray-600 space-y-1">
                <div>Ölçek: {(blueprint.scale * 100).toFixed(0)}%</div>
                <div>Opaklık: {(blueprint.opacity * 100).toFixed(0)}%</div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Selected blueprint controls */}
      {selectedBlueprint && (
        <div className="p-4 bg-blue-50 border-t-2 border-blue-200">
          <h4 className="font-semibold text-sm mb-3">Düzenle</h4>
          
          <div className="space-y-3">
            {/* Scale */}
            <div>
              <label className="text-xs text-gray-700 block mb-1">
                Ölçek: {(selectedBlueprint.scale * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="10"
                max="300"
                value={selectedBlueprint.scale * 100}
                onChange={(e) => setScale(selectedBlueprint.id, parseInt(e.target.value) / 100)}
                className="w-full"
              />
            </div>
            
            {/* Opacity */}
            <div>
              <label className="text-xs text-gray-700 block mb-1">
                Saydamlık: {(selectedBlueprint.opacity * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={selectedBlueprint.opacity * 100}
                onChange={(e) => setOpacity(selectedBlueprint.id, parseInt(e.target.value) / 100)}
                className="w-full"
              />
            </div>
            
            {/* Rotation */}
            <div>
              <label className="text-xs text-gray-700 block mb-1">
                Döndür: {selectedBlueprint.rotation}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={selectedBlueprint.rotation}
                onChange={(e) => setRotation(selectedBlueprint.id, parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Clear all */}
      {blueprints.length > 0 && (
        <div className="p-4 border-t">
          <button
            onClick={() => {
              if (confirm('Tüm klavuzlar silinsin mi?')) {
                clearAllBlueprints();
              }
            }}
            className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
          >
            Tümünü Temizle
          </button>
        </div>
      )}
      
      {/* Uploader modal */}
      {showUploader && (
        <BlueprintUploader onClose={() => setShowUploader(false)} />
      )}
    </div>
  );
};