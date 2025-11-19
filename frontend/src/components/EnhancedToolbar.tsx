// ============================================
// EnhancedToolbar.tsx - SNAP SİSTEMİ İLE GELİŞTİRİLMİŞ
// ============================================
import React, { useEffect, useState } from 'react';
import { useDrawingStore } from '../store/useDrawingStore';

interface EnhancedToolbarProps {
  onShowBlueprints: () => void;
  onShowMaterials: () => void;
  onShowBuilding?: () => void;
  onShowProjectManager?: () => void;
  onNewProject?: () => void;
}

export const EnhancedToolbar: React.FC<EnhancedToolbarProps> = ({ 
  onShowBlueprints, 
  onShowMaterials,
  onShowBuilding,
  onShowProjectManager,
  onNewProject
}) => {
  const { 
    mode, 
    setMode, 
    snapSettings,
    toggleSnap,
    updateSnapSettings,
    currentDiameter,
    setCurrentDiameter,
    undo,
    redo,
    clearAll,
    pipes,
    components,
    clearTempPoints
  } = useDrawingStore();
  
  const [showSnapPanel, setShowSnapPanel] = useState(false);
  
  // Çizim araçları
  const tools = [
    { id: 'select', name: 'Seç', icon: '👆', shortcut: 'V' },
    { id: 'pipe', name: 'Boru', icon: '│', shortcut: 'P' },
    { id: 'valve', name: 'Vana', icon: '⊗', shortcut: 'A' },
    { id: 'meter', name: 'Sayaç', icon: '⊞', shortcut: 'M' },
    { id: 'boiler', name: 'Kombi', icon: '⊡', shortcut: 'B' },
    { id: 'delete', name: 'Sil', icon: '🗑️', shortcut: 'D' },
  ];
  
  // Boru çapları
  const diameters = ['1/2"', '3/4"', '1"', '1 1/4"'];
  
  // Klavye kısayolları
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd tuş kombinasyonları
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          undo();
        } else if (e.key === 'y') {
          e.preventDefault();
          redo();
        } else if (e.key === 's') {
          e.preventDefault();
          if (onShowProjectManager) onShowProjectManager();
        } else if (e.key === 'o') {
          e.preventDefault();
          if (onShowProjectManager) onShowProjectManager();
        } else if (e.key === 'n') {
          e.preventDefault();
          if (onNewProject) onNewProject();
        }
      } else {
        // Normal tuş kısayolları
        const tool = tools.find(t => t.shortcut.toLowerCase() === e.key.toLowerCase());
        if (tool) {
          setMode(tool.id as any);
          clearTempPoints();
        }
        
        // 🎯 SNAP KISAYOLLARI
        if (e.key === 's' || e.key === 'S') {
          setShowSnapPanel(!showSnapPanel);
        }
        if (e.key === 'g' || e.key === 'G') {
          toggleSnap('snapToGrid');
        }
        if (e.key === 'e' || e.key === 'E') {
          toggleSnap('snapToEndpoints');
        }
        if (e.key === 'q' || e.key === 'Q') {
          toggleSnap('snapToMidpoints');
        }
        if (e.key === 'i' || e.key === 'I') {
          toggleSnap('snapToIntersections');
        }
        
        // Escape - iptal
        if (e.key === 'Escape') {
          setMode('select');
          clearTempPoints();
          setShowSnapPanel(false);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [undo, redo, setMode, toggleSnap, clearTempPoints, tools, showSnapPanel]);
  
  // Tümünü temizle onayı
  const handleClearAll = () => {
    if (confirm('Tüm çizimleri silmek istediğinizden emin misiniz?')) {
      clearAll();
    }
  };
  
  // Toplam boru uzunluğu
  const totalLength = pipes.reduce((sum, pipe) => sum + (pipe.length || 0), 0);
  
  return (
    <div className="bg-white border-b shadow-sm">
      {/* Ana toolbar */}
      <div className="flex items-center justify-between p-3 gap-4">
        {/* Sol: Dosya işlemleri */}
        {(onNewProject || onShowProjectManager) && (
          <div className="flex gap-2">
            {onNewProject && (
              <button
                onClick={onNewProject}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors text-sm font-medium"
                title="Yeni Proje (Ctrl+N)"
              >
                📄 Yeni
              </button>
            )}
            
            {onShowProjectManager && (
              <>
                <button
                  onClick={onShowProjectManager}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors text-sm font-medium"
                  title="Proje Aç (Ctrl+O)"
                >
                  📂 Aç
                </button>
                
                <button
                  onClick={onShowProjectManager}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors text-sm font-medium"
                  title="Kaydet (Ctrl+S)"
                >
                  💾 Kaydet
                </button>
              </>
            )}
          </div>
        )}
        
        {/* Orta: Çizim araçları */}
        <div className="flex gap-1">
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => {
                setMode(tool.id as any);
                clearTempPoints();
              }}
              className={`
                px-4 py-2 rounded transition-all font-medium
                ${mode === tool.id 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }
              `}
              title={`${tool.name} (${tool.shortcut})`}
            >
              <span className="text-lg">{tool.icon}</span>
              <span className="ml-2 text-sm">{tool.name}</span>
            </button>
          ))}
        </div>
        
        {/* Çap seçici */}
        {mode === 'pipe' && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">Çap:</span>
            <select
              value={currentDiameter}
              onChange={(e) => setCurrentDiameter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {diameters.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        )}
        
        {/* Sağ: Özel butonlar */}
        <div className="flex gap-2">
          {/* Bina yönetimi */}
          {onShowBuilding && (
            <button
              onClick={onShowBuilding}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors font-medium"
              title="Bina Yönetimi (K)"
            >
              <span className="text-lg">🏢</span>
              <span className="ml-2 text-sm">Bina</span>
            </button>
          )}
          
          {/* Klavuz */}
          <button
            onClick={onShowBlueprints}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors font-medium"
            title="Klavuz Paneli"
          >
            <span className="text-lg">📋</span>
            <span className="ml-2 text-sm">Klavuz</span>
          </button>
          
          {/* 🎯 SNAP PANEL TOGGLE */}
          <button
            onClick={() => setShowSnapPanel(!showSnapPanel)}
            className={`
              px-4 py-2 rounded transition-colors font-medium
              ${showSnapPanel
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }
            `}
            title="Snap Ayarları (S)"
          >
            <span className="text-lg">🧲</span>
            <span className="ml-2 text-sm">Snap</span>
          </button>
          
          {/* Undo/Redo */}
          <button
            onClick={undo}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            title="Geri Al (Ctrl+Z)"
          >
            ↶ Geri
          </button>
          <button
            onClick={redo}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            title="İleri Al (Ctrl+Y)"
          >
            ↷ İleri
          </button>
          
          {/* Temizle */}
          <button
            onClick={handleClearAll}
            className="px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors"
            title="Tümünü Temizle"
          >
            🗑️ Temizle
          </button>
          
          {/* Malzeme Listesi */}
          <button
            onClick={onShowMaterials}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-medium shadow-sm"
            title="Malzeme Listesi"
          >
            📋 Malzeme Listesi
          </button>
        </div>
      </div>
      
      {/* 🎯 SNAP PANEL */}
      {showSnapPanel && (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-t border-b px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 text-sm">🧲 Snap Ayarları</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={snapSettings.enabled}
                onChange={() => toggleSnap('enabled')}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Master Snap</span>
            </label>
          </div>

          <div className="grid grid-cols-6 gap-2 mb-3">
            {/* Endpoint Snap */}
            <button
              onClick={() => toggleSnap('snapToEndpoints')}
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded transition-all text-xs
                ${snapSettings.snapToEndpoints
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white border border-gray-300 text-gray-600'
                }
              `}
              title="Uç Nokta (E)"
            >
              <span className="text-lg">□</span>
              <span className="font-medium">Endpoint</span>
            </button>

            {/* Midpoint Snap */}
            <button
              onClick={() => toggleSnap('snapToMidpoints')}
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded transition-all text-xs
                ${snapSettings.snapToMidpoints
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-white border border-gray-300 text-gray-600'
                }
              `}
              title="Orta Nokta (Q)"
            >
              <span className="text-lg">△</span>
              <span className="font-medium">Midpoint</span>
            </button>

            {/* Intersection Snap */}
            <button
              onClick={() => toggleSnap('snapToIntersections')}
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded transition-all text-xs
                ${snapSettings.snapToIntersections
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white border border-gray-300 text-gray-600'
                }
              `}
              title="Kesişim (I)"
            >
              <span className="text-lg">×</span>
              <span className="font-medium">Intersection</span>
            </button>

            {/* Perpendicular Snap */}
            <button
              onClick={() => toggleSnap('snapToPerpendicular')}
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded transition-all text-xs
                ${snapSettings.snapToPerpendicular
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-white border border-gray-300 text-gray-600'
                }
              `}
              title="Dik"
            >
              <span className="text-lg">⊥</span>
              <span className="font-medium">Perp.</span>
            </button>

            {/* Center Snap */}
            <button
              onClick={() => toggleSnap('snapToCenter')}
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded transition-all text-xs
                ${snapSettings.snapToCenter
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-white border border-gray-300 text-gray-600'
                }
              `}
              title="Merkez"
            >
              <span className="text-lg">○</span>
              <span className="font-medium">Center</span>
            </button>

            {/* Grid Snap */}
            <button
              onClick={() => toggleSnap('snapToGrid')}
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded transition-all text-xs
                ${snapSettings.snapToGrid
                  ? 'bg-gray-700 text-white shadow-md'
                  : 'bg-white border border-gray-300 text-gray-600'
                }
              `}
              title="Grid (G)"
            >
              <span className="text-lg">⊞</span>
              <span className="font-medium">Grid</span>
            </button>
          </div>

          <div className="flex gap-4">
            {/* Snap Radius */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Snap Mesafesi: <span className="text-blue-600 font-bold">{snapSettings.snapRadius.toFixed(1)}m</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={snapSettings.snapRadius}
                onChange={(e) => updateSnapSettings({ snapRadius: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Grid Size */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Grid Boyutu: <span className="text-blue-600 font-bold">{snapSettings.gridSize.toFixed(2)}m</span>
              </label>
              <input
                type="range"
                min="0.25"
                max="5"
                step="0.25"
                value={snapSettings.gridSize}
                onChange={(e) => updateSnapSettings({ gridSize: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* İstatistik çubuğu */}
      <div className="bg-gray-50 px-3 py-2 border-t flex gap-6 text-sm">
        <div className="text-gray-600">
          Mod: <span className="font-semibold text-gray-900">
            {mode === 'select' && '👆 Seçim'}
            {mode === 'pipe' && '🔧 Boru Çizimi'}
            {mode === 'valve' && '⊗ Vana Ekleme'}
            {mode === 'meter' && '⊞ Sayaç Ekleme'}
            {mode === 'boiler' && '⊡ Kombi Ekleme'}
            {mode === 'delete' && '🗑️ Silme'}
          </span>
        </div>
        
        <div className="text-gray-600">
          Borular: <span className="font-semibold text-gray-900">{pipes.length}</span>
        </div>
        
        <div className="text-gray-600">
          Cihazlar: <span className="font-semibold text-gray-900">{components.length}</span>
        </div>
        
        <div className="text-gray-600">
          Toplam Uzunluk: <span className="font-semibold text-gray-900">{totalLength.toFixed(2)}m</span>
        </div>
        
        <div className="text-gray-600">
          Snap: <span className={`font-semibold ${snapSettings.enabled ? 'text-green-600' : 'text-gray-400'}`}>
            {snapSettings.enabled ? 'AÇIK ✓' : 'KAPALI'}
          </span>
        </div>
        
        {mode === 'pipe' && (
          <div className="text-gray-600">
            Seçili Çap: <span className="font-semibold text-blue-600">{currentDiameter}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedToolbar;