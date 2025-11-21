// ============================================
// BLUEPRINT PANEL - Klavuz Yükleme Paneli
// Konum: frontend/src/components/BlueprintPanel.tsx
// onClose prop eklendi, TypeScript uyumluluğu sağlandı
// ============================================

import React from "react";
import { useBlueprintStore } from "../store/useBlueprintStore";
import { BlueprintUploader } from "./BlueprintUploader";

interface BlueprintPanelProps {
  onClose?: () => void;
}

const BlueprintPanel: React.FC<BlueprintPanelProps> = ({ onClose }) => {
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
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-4 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-xl">📋 Klavuzlar</h3>
          <p className="text-xs text-purple-100 mt-1">Plan ve çizimler</p>
        </div>

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            title="Paneli Kapat"
          >
            <span className="text-2xl leading-none">✕</span>
          </button>
        )}
      </div>

      {/* Add button */}
      <div className="p-4 border-b bg-gray-50">
        <button
          onClick={() => setShowUploader(true)}
          className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm"
        >
          <span className="text-xl">+</span>
          <span>Klavuz Yükle</span>
        </button>
      </div>

      {/* List */}
      {blueprints.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <div className="text-6xl mb-3">📋</div>
          <p className="text-sm font-medium">Henüz klavuz yüklenmedi</p>
          <p className="text-xs mt-2 text-gray-400">Plan veya çizim ekleyerek başlayın</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          <div className="divide-y">
            {blueprints.map((blueprint) => (
              <div
                key={blueprint.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${selectedBlueprintId === blueprint.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                onClick={() => selectBlueprint(blueprint.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">{blueprint.name}</h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Bu klavuzu silmek istediğinizden emin misiniz?')) {
                        removeBlueprint(blueprint.id);
                      }
                    }}
                    className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                    title="Sil"
                  >
                    🗑️
                  </button>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibility(blueprint.id);
                    }}
                    className={`px-2 py-1 rounded ${blueprint.visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {blueprint.visible ? '👁️ Görünür' : '🙈 Gizli'}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLock(blueprint.id);
                    }}
                    className={`px-2 py-1 rounded ${blueprint.locked ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {blueprint.locked ? '🔒 Kilitli' : '🔓 Serbest'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected blueprint settings */}
      {selectedBlueprint && (
        <div className="border-t bg-gray-50 p-4 space-y-3">
          <h4 className="font-semibold text-gray-800 mb-3">Klavuz Ayarları</h4>

          <div>
            <label className="text-xs text-gray-600 font-medium block mb-1">Ölçek: {selectedBlueprint.scale.toFixed(2)}</label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={selectedBlueprint.scale}
              onChange={(e) => setScale(selectedBlueprint.id, parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600 font-medium block mb-1">Opaklık: {(selectedBlueprint.opacity * 100).toFixed(0)}%</label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={selectedBlueprint.opacity}
              onChange={(e) => setOpacity(selectedBlueprint.id, parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600 font-medium block mb-1">Rotasyon: {selectedBlueprint.rotation}°</label>
            <input
              type="range"
              min="0"
              max="360"
              step="15"
              value={selectedBlueprint.rotation}
              onChange={(e) => setRotation(selectedBlueprint.id, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>
        </div>
      )}

      {/* Clear all */}
      {blueprints.length > 0 && (
        <div className="p-4 border-t">
          <button
            onClick={() => {
              if (confirm('Tüm klavuzları silmek istediğinizden emin misiniz?')) {
                clearAllBlueprints();
              }
            }}
            className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
          >
            🗑️ Tümünü Temizle
          </button>
        </div>
      )}

      {/* Blueprint uploader modal */}
      {showUploader && (
        <BlueprintUploader onClose={() => setShowUploader(false)} />
      )}
    </div>
  );
};

export default BlueprintPanel;