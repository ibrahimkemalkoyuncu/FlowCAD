// ============================================
// LAYER MANAGER - AutoCAD Benzeri Katman Yöneticisi
// Konum: frontend/src/components/LayerManager.tsx
// Katman oluşturma, düzenleme ve yönetimi
// ============================================

import React, { useState } from 'react';
import toast from 'react-hot-toast';

// ============================================
// INTERFACES
// ============================================

export interface Layer {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  locked: boolean;
  lineType: 'continuous' | 'dashed' | 'dotted' | 'dashdot';
  lineWeight: number;
  isActive: boolean;
}

interface LayerManagerProps {
  onClose: () => void;
}

// ============================================
// DEFAULT LAYERS
// ============================================

const DEFAULT_LAYERS: Layer[] = [
  { id: '0', name: '0', color: '#FFFFFF', visible: true, locked: false, lineType: 'continuous', lineWeight: 0.25, isActive: true },
  { id: 'pipes', name: 'Borular', color: '#3B82F6', visible: true, locked: false, lineType: 'continuous', lineWeight: 0.35, isActive: false },
  { id: 'valves', name: 'Vanalar', color: '#EF4444', visible: true, locked: false, lineType: 'continuous', lineWeight: 0.25, isActive: false },
  { id: 'meters', name: 'Sayaçlar', color: '#10B981', visible: true, locked: false, lineType: 'continuous', lineWeight: 0.25, isActive: false },
  { id: 'dimensions', name: 'Ölçüler', color: '#F59E0B', visible: true, locked: false, lineType: 'continuous', lineWeight: 0.18, isActive: false },
  { id: 'text', name: 'Yazılar', color: '#8B5CF6', visible: true, locked: false, lineType: 'continuous', lineWeight: 0.18, isActive: false },
  { id: 'blueprint', name: 'Klavuz', color: '#6B7280', visible: true, locked: true, lineType: 'continuous', lineWeight: 0.09, isActive: false },
];

// ============================================
// COLOR PALETTE
// ============================================

const COLOR_PALETTE = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E', '#FFFFFF', '#94A3B8', '#000000'
];

// ============================================
// COMPONENT
// ============================================

export const LayerManager: React.FC<LayerManagerProps> = ({ onClose }) => {
  const [layers, setLayers] = useState<Layer[]>(DEFAULT_LAYERS);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [showNewLayerForm, setShowNewLayerForm] = useState(false);
  const [newLayerName, setNewLayerName] = useState('');

  // ============================================
  // HANDLERS
  // ============================================

  const toggleVisibility = (id: string) => {
    setLayers(layers.map(layer => 
      layer.id === id ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const toggleLock = (id: string) => {
    setLayers(layers.map(layer => 
      layer.id === id ? { ...layer, locked: !layer.locked } : layer
    ));
  };

  const setActiveLayer = (id: string) => {
    setLayers(layers.map(layer => ({
      ...layer,
      isActive: layer.id === id
    })));
    toast.success(`Aktif katman: ${layers.find(l => l.id === id)?.name}`);
  };

  const updateLayerColor = (id: string, color: string) => {
    setLayers(layers.map(layer => 
      layer.id === id ? { ...layer, color } : layer
    ));
    setShowColorPicker(null);
  };

  const startEditingName = (layer: Layer) => {
    setEditingLayerId(layer.id);
    setEditingName(layer.name);
  };

  const saveLayerName = () => {
    if (editingLayerId && editingName.trim()) {
      setLayers(layers.map(layer => 
        layer.id === editingLayerId ? { ...layer, name: editingName.trim() } : layer
      ));
    }
    setEditingLayerId(null);
    setEditingName('');
  };

  const createNewLayer = () => {
    if (!newLayerName.trim()) {
      toast.error('Katman adı boş olamaz');
      return;
    }

    if (layers.some(l => l.name.toLowerCase() === newLayerName.toLowerCase())) {
      toast.error('Bu isimde bir katman zaten var');
      return;
    }

    const newLayer: Layer = {
      id: `layer_${Date.now()}`,
      name: newLayerName.trim(),
      color: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)],
      visible: true,
      locked: false,
      lineType: 'continuous',
      lineWeight: 0.25,
      isActive: false
    };

    setLayers([...layers, newLayer]);
    setNewLayerName('');
    setShowNewLayerForm(false);
    toast.success(`"${newLayer.name}" katmanı oluşturuldu`);
  };

  const deleteLayer = (id: string) => {
    const layer = layers.find(l => l.id === id);
    if (!layer) return;

    if (layer.id === '0') {
      toast.error('"0" katmanı silinemez');
      return;
    }

    if (layer.isActive) {
      toast.error('Aktif katman silinemez');
      return;
    }

    if (confirm(`"${layer.name}" katmanını silmek istediğinizden emin misiniz?`)) {
      setLayers(layers.filter(l => l.id !== id));
      toast.success(`"${layer.name}" katmanı silindi`);
    }
  };

  const updateLineWeight = (id: string, weight: number) => {
    setLayers(layers.map(layer => 
      layer.id === id ? { ...layer, lineWeight: weight } : layer
    ));
  };

  const updateLineType = (id: string, lineType: Layer['lineType']) => {
    setLayers(layers.map(layer => 
      layer.id === id ? { ...layer, lineType } : layer
    ));
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 max-w-4xl w-full mx-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span>📑</span>
              <span>Katman Yöneticisi</span>
            </h3>
            <p className="text-sm text-white/80 mt-1">
              Katmanları oluşturun, düzenleyin ve yönetin
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-xl transition-colors"
            title="Kapat"
          >
            <span className="text-2xl leading-none">✕</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewLayerForm(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm flex items-center gap-2"
          >
            <span>➕</span>
            <span>Yeni Katman</span>
          </button>
          <button
            onClick={() => {
              const allVisible = layers.every(l => l.visible);
              setLayers(layers.map(l => ({ ...l, visible: !allVisible })));
            }}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
          >
            {layers.every(l => l.visible) ? '👁️ Tümünü Gizle' : '👁️ Tümünü Göster'}
          </button>
        </div>
        <div className="text-sm text-gray-500">
          {layers.length} katman | Aktif: {layers.find(l => l.isActive)?.name}
        </div>
      </div>

      {/* New Layer Form */}
      {showNewLayerForm && (
        <div className="px-4 py-3 bg-green-50 border-b flex items-center gap-3">
          <input
            type="text"
            value={newLayerName}
            onChange={(e) => setNewLayerName(e.target.value)}
            placeholder="Katman adı..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && createNewLayer()}
          />
          <button
            onClick={createNewLayer}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium"
          >
            Oluştur
          </button>
          <button
            onClick={() => { setShowNewLayerForm(false); setNewLayerName(''); }}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
          >
            İptal
          </button>
        </div>
      )}

      {/* Layer Table */}
      <div className="overflow-x-auto max-h-[60vh]">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 w-12">Aktif</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 w-12">👁️</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 w-12">🔒</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Katman Adı</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 w-20">Renk</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 w-32">Çizgi Tipi</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 w-28">Çizgi Kalınlığı</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 w-16">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {layers.map((layer) => (
              <tr
                key={layer.id}
                className={`
                  border-b hover:bg-gray-50 transition-colors
                  ${layer.isActive ? 'bg-blue-50' : ''}
                  ${selectedLayerId === layer.id ? 'ring-2 ring-blue-500 ring-inset' : ''}
                `}
                onClick={() => setSelectedLayerId(layer.id)}
              >
                {/* Active */}
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveLayer(layer.id); }}
                    className={`
                      w-6 h-6 rounded-full transition-all
                      ${layer.isActive 
                        ? 'bg-blue-500 text-white shadow-md' 
                        : 'bg-gray-200 hover:bg-gray-300'
                      }
                    `}
                  >
                    {layer.isActive && '✓'}
                  </button>
                </td>

                {/* Visibility */}
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleVisibility(layer.id); }}
                    className={`
                      text-lg transition-opacity
                      ${layer.visible ? 'opacity-100' : 'opacity-30'}
                    `}
                  >
                    {layer.visible ? '👁️' : '🙈'}
                  </button>
                </td>

                {/* Lock */}
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLock(layer.id); }}
                    className="text-lg"
                  >
                    {layer.locked ? '🔒' : '🔓'}
                  </button>
                </td>

                {/* Name */}
                <td className="px-4 py-3">
                  {editingLayerId === layer.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={saveLayerName}
                      onKeyDown={(e) => e.key === 'Enter' && saveLayerName()}
                      className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span
                      onDoubleClick={() => startEditingName(layer)}
                      className={`
                        cursor-pointer hover:text-blue-600
                        ${layer.isActive ? 'font-semibold text-blue-700' : ''}
                      `}
                    >
                      {layer.name}
                    </span>
                  )}
                </td>

                {/* Color */}
                <td className="px-4 py-3">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowColorPicker(showColorPicker === layer.id ? null : layer.id);
                      }}
                      className="w-8 h-8 rounded border-2 border-gray-300 shadow-sm hover:scale-110 transition-transform"
                      style={{ backgroundColor: layer.color }}
                    />
                    {showColorPicker === layer.id && (
                      <div className="absolute z-10 top-10 left-0 bg-white rounded-lg shadow-xl border p-2 grid grid-cols-5 gap-1">
                        {COLOR_PALETTE.map((color) => (
                          <button
                            key={color}
                            onClick={() => updateLayerColor(layer.id, color)}
                            className="w-6 h-6 rounded border hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </td>

                {/* Line Type */}
                <td className="px-4 py-3">
                  <select
                    value={layer.lineType}
                    onChange={(e) => updateLineType(layer.id, e.target.value as Layer['lineType'])}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-2 py-1 border rounded text-sm bg-white"
                  >
                    <option value="continuous">───────</option>
                    <option value="dashed">- - - - -</option>
                    <option value="dotted">· · · · ·</option>
                    <option value="dashdot">- · - · -</option>
                  </select>
                </td>

                {/* Line Weight */}
                <td className="px-4 py-3">
                  <select
                    value={layer.lineWeight}
                    onChange={(e) => updateLineWeight(layer.id, parseFloat(e.target.value))}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-2 py-1 border rounded text-sm bg-white"
                  >
                    <option value="0.09">0.09 mm</option>
                    <option value="0.13">0.13 mm</option>
                    <option value="0.18">0.18 mm</option>
                    <option value="0.25">0.25 mm</option>
                    <option value="0.35">0.35 mm</option>
                    <option value="0.50">0.50 mm</option>
                    <option value="0.70">0.70 mm</option>
                    <option value="1.00">1.00 mm</option>
                  </select>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
                    disabled={layer.id === '0' || layer.isActive}
                    className={`
                      p-1.5 rounded transition-colors
                      ${layer.id === '0' || layer.isActive
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-red-500 hover:bg-red-100'
                      }
                    `}
                    title={layer.id === '0' ? '"0" katmanı silinemez' : layer.isActive ? 'Aktif katman silinemez' : 'Sil'}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center">
        <div className="text-xs text-gray-500">
          💡 İpucu: Katman adını düzenlemek için çift tıklayın
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Kapat
        </button>
      </div>
    </div>
  );
};

export default LayerManager;
