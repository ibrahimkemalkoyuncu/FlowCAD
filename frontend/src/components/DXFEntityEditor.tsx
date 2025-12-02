// ============================================
// DXF ENTITY EDITOR - DXF Entity Düzenleme Paneli
// Konum: frontend/src/components/DXFEntityEditor.tsx
// AutoCAD benzeri DXF entity düzenleme özellikleri
// ============================================

import React, { useState, useMemo } from 'react';
import { useBlueprintStore } from '../store/useBlueprintStore';
import type { DWGEntity, ParsedDWG } from '../types/dwg';
import toast from 'react-hot-toast';

// ============================================
// INTERFACE
// ============================================

interface DXFEntityEditorProps {
  onClose: () => void;
}

// ============================================
// CONSTANTS
// ============================================

const ENTITY_TYPE_LABELS: Record<string, string> = {
  LINE: 'Çizgi',
  CIRCLE: 'Daire',
  ARC: 'Yay',
  POLYLINE: 'Polyline',
  TEXT: 'Metin',
  INSERT: 'Blok',
  DIMENSION: 'Ölçü'
};

const ENTITY_TYPE_ICONS: Record<string, string> = {
  LINE: '📏',
  CIRCLE: '⭕',
  ARC: '🌙',
  POLYLINE: '📐',
  TEXT: '📝',
  INSERT: '📦',
  DIMENSION: '📐'
};

// ============================================
// COMPONENT
// ============================================

export const DXFEntityEditor: React.FC<DXFEntityEditorProps> = ({ onClose }) => {
  const { blueprints, updateBlueprint } = useBlueprintStore();
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLayer, setFilterLayer] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [editMode, setEditMode] = useState<'view' | 'edit'>('view');

  // DXF blueprints
  const dxfBlueprints = useMemo(() => 
    blueprints.filter(b => b.type === 'dxf' && (b as any).dwgData),
    [blueprints]
  );

  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>(
    dxfBlueprints[0]?.id || ''
  );

  const selectedBlueprint = blueprints.find(b => b.id === selectedBlueprintId);
  const dwgData = (selectedBlueprint as any)?.dwgData as ParsedDWG | undefined;

  // Filtered entities
  const filteredEntities = useMemo(() => {
    if (!dwgData) return [];
    
    return dwgData.entities.filter(entity => {
      if (filterType !== 'all' && entity.type !== filterType) return false;
      if (filterLayer !== 'all' && entity.layer !== filterLayer) return false;
      if (searchText && entity.type !== 'TEXT') {
        // Search in entity ID for non-text entities
        if (!entity.id.toLowerCase().includes(searchText.toLowerCase())) return false;
      }
      if (searchText && entity.type === 'TEXT') {
        if (!entity.text?.toLowerCase().includes(searchText.toLowerCase())) return false;
      }
      return true;
    });
  }, [dwgData, filterType, filterLayer, searchText]);

  // Unique entity types and layers
  const entityTypes = useMemo(() => {
    if (!dwgData) return [];
    const types = new Set(dwgData.entities.map(e => e.type));
    return Array.from(types);
  }, [dwgData]);

  const layers = useMemo(() => {
    if (!dwgData) return [];
    return dwgData.layers.map(l => l.name);
  }, [dwgData]);

  const selectedEntity = filteredEntities.find(e => e.id === selectedEntityId);

  // ============================================
  // ENTITY MODIFICATION HANDLERS
  // ============================================

  const updateEntity = (entityId: string, updates: Partial<DWGEntity>) => {
    if (!dwgData || !selectedBlueprint) return;

    const updatedEntities = dwgData.entities.map(entity =>
      entity.id === entityId ? { ...entity, ...updates } : entity
    );

    const updatedDwgData = { ...dwgData, entities: updatedEntities };
    updateBlueprint(selectedBlueprint.id, { 
      ...(selectedBlueprint as any),
      dwgData: updatedDwgData 
    } as any);

    toast.success('Entity güncellendi');
  };

  const deleteEntity = (entityId: string) => {
    if (!dwgData || !selectedBlueprint) return;

    if (!confirm('Bu entity silinecek. Devam etmek istiyor musunuz?')) return;

    const updatedEntities = dwgData.entities.filter(e => e.id !== entityId);
    const updatedDwgData = { ...dwgData, entities: updatedEntities };
    
    updateBlueprint(selectedBlueprint.id, {
      ...(selectedBlueprint as any),
      dwgData: updatedDwgData
    } as any);

    setSelectedEntityId(null);
    toast.success('Entity silindi');
  };

  const duplicateEntity = (entity: DWGEntity) => {
    if (!dwgData || !selectedBlueprint) return;

    const newEntity: DWGEntity = {
      ...entity,
      id: `${entity.id}_copy_${Date.now()}`,
      // Offset position slightly
      position: entity.position ? {
        x: entity.position.x + 1,
        y: entity.position.y + 1,
        z: entity.position.z
      } : undefined,
      vertices: entity.vertices?.map(v => ({
        x: v.x + 1,
        y: v.y + 1,
        z: v.z
      }))
    };

    const updatedEntities = [...dwgData.entities, newEntity];
    const updatedDwgData = { ...dwgData, entities: updatedEntities };
    
    updateBlueprint(selectedBlueprint.id, {
      ...(selectedBlueprint as any),
      dwgData: updatedDwgData
    } as any);

    setSelectedEntityId(newEntity.id);
    toast.success('Entity kopyalandı');
  };

  const toggleEntityVisibility = (entityId: string) => {
    const entity = dwgData?.entities.find(e => e.id === entityId);
    if (entity) {
      updateEntity(entityId, { visible: !entity.visible });
    }
  };

  const changeEntityLayer = (entityId: string, newLayer: string) => {
    updateEntity(entityId, { layer: newLayer });
  };

  const changeEntityColor = (entityId: string, newColor: number) => {
    updateEntity(entityId, { color: newColor });
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span>✏️</span>
              <span>DXF Entity Düzenleyici</span>
            </h3>
            <p className="text-sm text-blue-100 mt-1">
              DXF dosyalarındaki entity'leri düzenleyin
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

      {/* Blueprint Selector */}
      {dxfBlueprints.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-b flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">DXF Dosyası:</label>
          <select
            value={selectedBlueprintId}
            onChange={(e) => {
              setSelectedBlueprintId(e.target.value);
              setSelectedEntityId(null);
            }}
            className="flex-1 max-w-xs px-3 py-2 border rounded-lg bg-white text-sm"
          >
            {dxfBlueprints.map(bp => (
              <option key={bp.id} value={bp.id}>{bp.name}</option>
            ))}
          </select>
          <div className="text-sm text-gray-500">
            {dwgData ? `${dwgData.entities.length} entity` : 'Yükleniyor...'}
          </div>
        </div>
      )}

      {/* No DXF Warning */}
      {dxfBlueprints.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📐</span>
            </div>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">
              DXF Dosyası Bulunamadı
            </h4>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Düzenlemek için önce bir DXF dosyası yükleyin. "Aç" butonunu veya Ctrl+O kısayolunu kullanın.
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {dwgData && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Entity List */}
          <div className="w-1/2 border-r flex flex-col">
            {/* Filters */}
            <div className="p-4 border-b bg-gray-50 space-y-3">
              {/* Search */}
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Entity ara..."
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              
              {/* Type & Layer Filters */}
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="all">Tüm Tipler</option>
                  {entityTypes.map(type => (
                    <option key={type} value={type}>
                      {ENTITY_TYPE_ICONS[type]} {ENTITY_TYPE_LABELS[type] || type}
                    </option>
                  ))}
                </select>
                
                <select
                  value={filterLayer}
                  onChange={(e) => setFilterLayer(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="all">Tüm Katmanlar</option>
                  {layers.map(layer => (
                    <option key={layer} value={layer}>{layer}</option>
                  ))}
                </select>
              </div>
              
              <div className="text-xs text-gray-500">
                {filteredEntities.length} / {dwgData.entities.length} entity gösteriliyor
              </div>
            </div>

            {/* Entity List */}
            <div className="flex-1 overflow-y-auto">
              {filteredEntities.map(entity => (
                <div
                  key={entity.id}
                  onClick={() => setSelectedEntityId(entity.id)}
                  className={`
                    px-4 py-3 border-b cursor-pointer transition-colors
                    ${selectedEntityId === entity.id 
                      ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                      : 'hover:bg-gray-50'
                    }
                    ${!entity.visible ? 'opacity-50' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {ENTITY_TYPE_ICONS[entity.type] || '📍'}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-gray-800">
                          {ENTITY_TYPE_LABELS[entity.type] || entity.type}
                        </div>
                        <div className="text-xs text-gray-500">
                          Layer: {entity.layer}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleEntityVisibility(entity.id);
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                        title={entity.visible ? 'Gizle' : 'Göster'}
                      >
                        {entity.visible ? '👁️' : '🙈'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Entity preview info */}
                  {entity.type === 'TEXT' && entity.text && (
                    <div className="mt-1 text-xs text-gray-600 truncate">
                      "{entity.text}"
                    </div>
                  )}
                  {entity.type === 'LINE' && entity.vertices && entity.vertices.length >= 2 && (
                    <div className="mt-1 text-xs text-gray-600">
                      ({entity.vertices[0].x.toFixed(2)}, {entity.vertices[0].y.toFixed(2)}) → 
                      ({entity.vertices[1].x.toFixed(2)}, {entity.vertices[1].y.toFixed(2)})
                    </div>
                  )}
                  {entity.type === 'CIRCLE' && entity.radius && (
                    <div className="mt-1 text-xs text-gray-600">
                      r = {entity.radius.toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Entity Properties */}
          <div className="w-1/2 flex flex-col">
            {selectedEntity ? (
              <>
                {/* Property Header */}
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {ENTITY_TYPE_ICONS[selectedEntity.type] || '📍'}
                      </span>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {ENTITY_TYPE_LABELS[selectedEntity.type] || selectedEntity.type}
                        </h4>
                        <div className="text-xs text-gray-500">{selectedEntity.id}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditMode(editMode === 'view' ? 'edit' : 'view')}
                        className={`px-3 py-1.5 rounded text-sm font-medium ${
                          editMode === 'edit'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {editMode === 'edit' ? '✏️ Düzenleniyor' : '👁️ Görüntüleme'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Properties */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* General Properties */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-700 mb-3">Genel Özellikler</h5>
                    
                    {/* Layer */}
                    <div className="mb-3">
                      <label className="text-xs text-gray-500 block mb-1">Katman</label>
                      <select
                        value={selectedEntity.layer}
                        onChange={(e) => changeEntityLayer(selectedEntity.id, e.target.value)}
                        disabled={editMode !== 'edit'}
                        className="w-full px-3 py-2 border rounded text-sm bg-white disabled:opacity-50"
                      >
                        {layers.map(layer => (
                          <option key={layer} value={layer}>{layer}</option>
                        ))}
                      </select>
                    </div>

                    {/* Color */}
                    <div className="mb-3">
                      <label className="text-xs text-gray-500 block mb-1">Renk (AutoCAD Index)</label>
                      <input
                        type="number"
                        value={selectedEntity.color || 7}
                        onChange={(e) => changeEntityColor(selectedEntity.id, parseInt(e.target.value))}
                        disabled={editMode !== 'edit'}
                        min="0"
                        max="255"
                        className="w-full px-3 py-2 border rounded text-sm disabled:opacity-50"
                      />
                    </div>

                    {/* Visibility */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedEntity.visible}
                        onChange={() => toggleEntityVisibility(selectedEntity.id)}
                        disabled={editMode !== 'edit'}
                        className="w-4 h-4"
                      />
                      <label className="text-sm text-gray-700">Görünür</label>
                    </div>
                  </div>

                  {/* Geometry Properties */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-700 mb-3">Geometri</h5>
                    
                    {/* Position for point-based entities */}
                    {selectedEntity.position && (
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">X</label>
                          <input
                            type="number"
                            value={selectedEntity.position.x.toFixed(4)}
                            onChange={(e) => updateEntity(selectedEntity.id, {
                              position: { ...selectedEntity.position!, x: parseFloat(e.target.value) }
                            })}
                            disabled={editMode !== 'edit'}
                            step="0.1"
                            className="w-full px-2 py-1.5 border rounded text-sm disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Y</label>
                          <input
                            type="number"
                            value={selectedEntity.position.y.toFixed(4)}
                            onChange={(e) => updateEntity(selectedEntity.id, {
                              position: { ...selectedEntity.position!, y: parseFloat(e.target.value) }
                            })}
                            disabled={editMode !== 'edit'}
                            step="0.1"
                            className="w-full px-2 py-1.5 border rounded text-sm disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Z</label>
                          <input
                            type="number"
                            value={selectedEntity.position.z.toFixed(4)}
                            onChange={(e) => updateEntity(selectedEntity.id, {
                              position: { ...selectedEntity.position!, z: parseFloat(e.target.value) }
                            })}
                            disabled={editMode !== 'edit'}
                            step="0.1"
                            className="w-full px-2 py-1.5 border rounded text-sm disabled:opacity-50"
                          />
                        </div>
                      </div>
                    )}

                    {/* Radius for circles/arcs */}
                    {selectedEntity.radius !== undefined && (
                      <div className="mb-3">
                        <label className="text-xs text-gray-500 block mb-1">Yarıçap</label>
                        <input
                          type="number"
                          value={selectedEntity.radius.toFixed(4)}
                          onChange={(e) => updateEntity(selectedEntity.id, {
                            radius: parseFloat(e.target.value)
                          })}
                          disabled={editMode !== 'edit'}
                          step="0.1"
                          min="0"
                          className="w-full px-3 py-2 border rounded text-sm disabled:opacity-50"
                        />
                      </div>
                    )}

                    {/* Angles for arcs */}
                    {selectedEntity.type === 'ARC' && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Başlangıç Açısı (°)</label>
                          <input
                            type="number"
                            value={(selectedEntity.startAngle || 0).toFixed(2)}
                            onChange={(e) => updateEntity(selectedEntity.id, {
                              startAngle: parseFloat(e.target.value)
                            })}
                            disabled={editMode !== 'edit'}
                            className="w-full px-2 py-1.5 border rounded text-sm disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Bitiş Açısı (°)</label>
                          <input
                            type="number"
                            value={(selectedEntity.endAngle || 0).toFixed(2)}
                            onChange={(e) => updateEntity(selectedEntity.id, {
                              endAngle: parseFloat(e.target.value)
                            })}
                            disabled={editMode !== 'edit'}
                            className="w-full px-2 py-1.5 border rounded text-sm disabled:opacity-50"
                          />
                        </div>
                      </div>
                    )}

                    {/* Vertices for lines/polylines */}
                    {selectedEntity.vertices && selectedEntity.vertices.length > 0 && (
                      <div className="mb-3">
                        <label className="text-xs text-gray-500 block mb-2">Noktalar ({selectedEntity.vertices.length})</label>
                        <div className="max-h-40 overflow-y-auto space-y-2">
                          {selectedEntity.vertices.map((vertex, index) => (
                            <div key={index} className="grid grid-cols-3 gap-1 text-xs bg-white p-2 rounded">
                              <input
                                type="number"
                                value={vertex.x.toFixed(2)}
                                onChange={(e) => {
                                  const newVertices = [...selectedEntity.vertices!];
                                  newVertices[index] = { ...vertex, x: parseFloat(e.target.value) };
                                  updateEntity(selectedEntity.id, { vertices: newVertices });
                                }}
                                disabled={editMode !== 'edit'}
                                step="0.1"
                                className="px-1 py-1 border rounded disabled:opacity-50"
                              />
                              <input
                                type="number"
                                value={vertex.y.toFixed(2)}
                                onChange={(e) => {
                                  const newVertices = [...selectedEntity.vertices!];
                                  newVertices[index] = { ...vertex, y: parseFloat(e.target.value) };
                                  updateEntity(selectedEntity.id, { vertices: newVertices });
                                }}
                                disabled={editMode !== 'edit'}
                                step="0.1"
                                className="px-1 py-1 border rounded disabled:opacity-50"
                              />
                              <input
                                type="number"
                                value={vertex.z.toFixed(2)}
                                onChange={(e) => {
                                  const newVertices = [...selectedEntity.vertices!];
                                  newVertices[index] = { ...vertex, z: parseFloat(e.target.value) };
                                  updateEntity(selectedEntity.id, { vertices: newVertices });
                                }}
                                disabled={editMode !== 'edit'}
                                step="0.1"
                                className="px-1 py-1 border rounded disabled:opacity-50"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Text properties */}
                    {selectedEntity.type === 'TEXT' && (
                      <>
                        <div className="mb-3">
                          <label className="text-xs text-gray-500 block mb-1">Metin</label>
                          <textarea
                            value={selectedEntity.text || ''}
                            onChange={(e) => updateEntity(selectedEntity.id, { text: e.target.value })}
                            disabled={editMode !== 'edit'}
                            rows={3}
                            className="w-full px-3 py-2 border rounded text-sm disabled:opacity-50"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Yükseklik</label>
                            <input
                              type="number"
                              value={selectedEntity.height || 1}
                              onChange={(e) => updateEntity(selectedEntity.id, { height: parseFloat(e.target.value) })}
                              disabled={editMode !== 'edit'}
                              step="0.1"
                              className="w-full px-2 py-1.5 border rounded text-sm disabled:opacity-50"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Döndürme (°)</label>
                            <input
                              type="number"
                              value={selectedEntity.rotation || 0}
                              onChange={(e) => updateEntity(selectedEntity.id, { rotation: parseFloat(e.target.value) })}
                              disabled={editMode !== 'edit'}
                              className="w-full px-2 py-1.5 border rounded text-sm disabled:opacity-50"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 border-t bg-gray-50 flex justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => duplicateEntity(selectedEntity)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
                    >
                      📋 Kopyala
                    </button>
                  </div>
                  <button
                    onClick={() => deleteEntity(selectedEntity.id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                  >
                    🗑️ Sil
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <span className="text-4xl block mb-2">👆</span>
                  <p>Düzenlemek için bir entity seçin</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          💡 İpucu: Düzenleme modunu açmak için "Düzenleme" butonuna tıklayın
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

export default DXFEntityEditor;
