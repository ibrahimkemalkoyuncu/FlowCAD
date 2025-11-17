// ============================================
// EnhancedToolbar.tsx - Gelişmiş Toolbar Bileşeni
// Tam ve Çalışır Halde
// ============================================
import React, { useEffect } from 'react';
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
    snapToGrid, 
    toggleSnapToGrid,
    currentDiameter,
    setCurrentDiameter,
    undo,
    redo,
    clearAll,
    pipes,
    components,
    clearTempPoints
  } = useDrawingStore();
  
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
      // Ctrl/Cmd tuşu ile kombinasyonlar
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
        
        // Grid snap toggle
        if (e.key === 'g' || e.key === 'G') {
          toggleSnapToGrid();
        }
        
        // Escape - iptal
        if (e.key === 'Escape') {
          setMode('select');
          clearTempPoints();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [undo, redo, setMode, toggleSnapToGrid, clearTempPoints, tools, onShowProjectManager, onNewProject]);
  
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
        
        {/* Çap seçici (sadece boru modunda) */}
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
          
          {/* Grid Snap */}
          <button
            onClick={toggleSnapToGrid}
            className={`
              px-3 py-2 rounded transition-colors font-medium
              ${snapToGrid 
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            title="Grid Snap (G)"
          >
            🔲 Grid
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
          Grid Snap: <span className={`font-semibold ${snapToGrid ? 'text-green-600' : 'text-gray-400'}`}>
            {snapToGrid ? 'Açık ✓' : 'Kapalı'}
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
