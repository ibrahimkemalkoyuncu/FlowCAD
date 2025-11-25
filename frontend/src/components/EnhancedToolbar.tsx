// ============================================
// ENHANCED TOOLBAR - Gelişmiş Araç Çubuğu
// Konum: frontend/src/components/EnhancedToolbar.tsx
// SNAP sistemi toggle butonu eklendi
// Son güncelleme: 2025-01-19 12:07:28 UTC
// Geliştirici: @ibrahimkemalkoyuncu
// ============================================

import React, { useEffect, useState } from 'react';
import { useDrawingStore } from '../store/useDrawingStore';

// ============================================
// INTERFACE - Component Props
// ============================================

interface EnhancedToolbarProps {
  onShowBlueprints: () => void;
  onShowMaterials: () => void;
  onShowBuilding?: () => void;
  onShowProjectManager?: () => void;
  onNewProject?: () => void;
  onShowSnapPanel?: () => void;  // 🎯 YENİ: Snap panel toggle
  onToggleGrid?: () => void;     // Grid toggle
  showGrid?: boolean;            // Grid visibility state
}

// ============================================
// ENHANCED TOOLBAR COMPONENT
// ============================================

export const EnhancedToolbar: React.FC<EnhancedToolbarProps> = ({ 
  onShowBlueprints, 
  onShowMaterials,
  onShowBuilding,
  onShowProjectManager,
  onNewProject,
  onShowSnapPanel,
  onToggleGrid,
  showGrid = true
}) => {
  
  // ============================================
  // STORE - Zustand State
  // ============================================
  
  const { 
    mode, 
    setMode, 
    snapSettings,
    toggleSnap,
    currentDiameter,
    setCurrentDiameter,
    undo,
    redo,
    clearAll,
    pipes,
    components,
    clearTempPoints
  } = useDrawingStore();
  
  // Local state - Snap panel açık mı?
  const [isSnapPanelOpen, setIsSnapPanelOpen] = useState(false);
  
  // ============================================
  // TOOL DEFINITIONS - Araç Tanımları
  // ============================================
  
  const tools = [
    { id: 'select', name: 'Seç', icon: '👆', shortcut: 'V', color: 'blue' },
    { id: 'pipe', name: 'Boru', icon: '│', shortcut: 'P', color: 'blue' },
    { id: 'valve', name: 'Vana', icon: '⊗', shortcut: 'A', color: 'blue' },
    { id: 'meter', name: 'Sayaç', icon: '⊞', shortcut: 'M', color: 'blue' },
    { id: 'boiler', name: 'Kombi', icon: '⊡', shortcut: 'B', color: 'blue' },
    { id: 'delete', name: 'Sil', icon: '🗑️', shortcut: 'D', color: 'red' },
  ];
  
  // Boru çapları listesi
  const diameters = ['1/2"', '3/4"', '1"', '1 1/4"', '1 1/2"', '2"'];
  
  // ============================================
  // KEYBOARD SHORTCUTS - Klavye Kısayolları
  // ============================================
  
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      
      // ============================================
      // CTRL/CMD KOMBINASYONLARI
      // ============================================
      
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
      } 
      
      // ============================================
      // NORMAL KISAYOLLAR
      // ============================================
      
      else {
        // Araç kısayolları (V, P, A, M, B, D)
        const tool = tools.find(t => t.shortcut.toLowerCase() === e.key.toLowerCase());
        if (tool) {
          setMode(tool.id as any);
          clearTempPoints();
        }
        
        // 🎯 SNAP KISAYOLLARI
        if (e.key === 's' || e.key === 'S') {
          setIsSnapPanelOpen(!isSnapPanelOpen);
          if (onShowSnapPanel) onShowSnapPanel();
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
        
        // Escape - İptal
        if (e.key === 'Escape') {
          setMode('select');
          clearTempPoints();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [undo, redo, setMode, toggleSnap, clearTempPoints, isSnapPanelOpen, onShowSnapPanel, onShowProjectManager, onNewProject]);
  
  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  /**
   * Tümünü temizle - Onay ister
   */
  const handleClearAll = () => {
    if (confirm('Tüm çizimleri silmek istediğinizden emin misiniz?')) {
      clearAll();
    }
  };
  
  // Toplam boru uzunluğu hesapla
  const totalLength = pipes.reduce((sum, pipe) => sum + (pipe.length || 0), 0);
  
  // Aktif snap sayısı
  const activeSnapsCount = [
    snapSettings.snapToEndpoints,
    snapSettings.snapToMidpoints,
    snapSettings.snapToIntersections,
    snapSettings.snapToCenter,
    snapSettings.snapToGrid
  ].filter(Boolean).length;
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="bg-white border-b shadow-sm">
      
      {/* ============================================
          MAIN TOOLBAR - Ana Toolbar
          ============================================ */}
      
      <div className="flex items-center justify-between p-3 gap-4">
        
        {/* ============================================
            SOL - Dosya İşlemleri
            ============================================ */}
        
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
        
        {/* ============================================
            ORTA - Çizim Araçları
            ============================================ */}
        
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
        
        {/* ============================================
            ÇAP SEÇİCİ - Boru modunda görünür
            ============================================ */}
        
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
        
        {/* ============================================
            SAĞ - Özel Butonlar
            ============================================ */}
        
        <div className="flex gap-2">
          
          {/* Bina Yönetimi */}
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
          
          {/* Klavuz Panel */}
          <button
            onClick={onShowBlueprints}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors font-medium"
            title="Klavuz Paneli"
          >
            <span className="text-lg">📋</span>
            <span className="ml-2 text-sm">Klavuz</span>
          </button>
          
          {/* ============================================
              🎯 SNAP PANEL TOGGLE - Yeni Özellik
              ============================================ */}
          
          <button
            onClick={() => {
              setIsSnapPanelOpen(!isSnapPanelOpen);
              if (onShowSnapPanel) onShowSnapPanel();
            }}
            className={`
              px-4 py-2 rounded transition-all font-medium relative
              ${snapSettings.enabled
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }
            `}
            title="Snap Ayarları (S)"
          >
            <span className="text-lg">🧲</span>
            <span className="ml-2 text-sm">Snap</span>
            
            {/* Durum badge'i */}
            {snapSettings.enabled && (
              <span className="ml-1 text-xs bg-white/30 px-1.5 py-0.5 rounded">
                {activeSnapsCount}
              </span>
            )}
            
            {/* Aktif göstergesi */}
            {snapSettings.enabled && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
            )}
          </button>
          
          {/* 🎯 GRID TOGGLE - Izgara aç/kapat */}
          {onToggleGrid && (
            <button
              onClick={onToggleGrid}
              className={`
                px-4 py-2 rounded transition-all font-medium
                ${showGrid
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                }
              `}
              title="Izgarayı Aç/Kapat (G)"
            >
              <span className="text-lg">🎯</span>
              <span className="ml-2 text-sm">Grid</span>
            </button>
          )}
          
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
      
      {/* ============================================
          STATUS BAR - Durum Çubuğu
          ============================================ */}
      
      <div className="bg-gray-50 px-3 py-2 border-t flex gap-6 text-sm">
        
        {/* Aktif Mod */}
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
        
        {/* Boru Sayısı */}
        <div className="text-gray-600">
          Borular: <span className="font-semibold text-gray-900">{pipes.length}</span>
        </div>
        
        {/* Cihaz Sayısı */}
        <div className="text-gray-600">
          Cihazlar: <span className="font-semibold text-gray-900">{components.length}</span>
        </div>
        
        {/* Toplam Uzunluk */}
        <div className="text-gray-600">
          Toplam Uzunluk: <span className="font-semibold text-gray-900">{totalLength.toFixed(2)}m</span>
        </div>
        
        {/* 🎯 SNAP DURUM GÖSTERGESİ */}
        <div className="text-gray-600 flex items-center gap-2">
          <span>Snap:</span>
          <span className={`font-semibold flex items-center gap-1 ${snapSettings.enabled ? 'text-orange-600' : 'text-gray-400'}`}>
            {snapSettings.enabled ? (
              <>
                <span>🧲</span>
                <span>AÇIK</span>
                <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                  {activeSnapsCount} aktif
                </span>
              </>
            ) : (
              <span>KAPALI</span>
            )}
          </span>
        </div>
        
        {/* Seçili Çap (Boru modunda) */}
        {mode === 'pipe' && (
          <div className="text-gray-600">
            Seçili Çap: <span className="font-semibold text-blue-600">{currentDiameter}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// EXPORT
// ============================================

export default EnhancedToolbar;