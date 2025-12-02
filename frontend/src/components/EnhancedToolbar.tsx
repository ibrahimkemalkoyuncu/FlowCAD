// ============================================
// ENHANCED TOOLBAR - Apple-Inspired Minimal Design
// Konum: frontend/src/components/EnhancedToolbar.tsx
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
  onShowSnapPanel?: () => void;
  onOpenDXF?: () => void;
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
  onOpenDXF
}) => {
  
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
  
  const [isSnapPanelOpen, setIsSnapPanelOpen] = useState(false);
  
  // Tool definitions - minimal icons
  const tools = [
    { id: 'select', name: 'Seç', icon: '↖', shortcut: 'V' },
    { id: 'pipe', name: 'Boru', icon: '━', shortcut: 'P' },
    { id: 'valve', name: 'Vana', icon: '◉', shortcut: 'A' },
    { id: 'meter', name: 'Sayaç', icon: '▣', shortcut: 'M' },
    { id: 'boiler', name: 'Kombi', icon: '▢', shortcut: 'B' },
    { id: 'delete', name: 'Sil', icon: '×', shortcut: 'D' },
  ];
  
  const diameters = ['1/2"', '3/4"', '1"', '1 1/4"', '1 1/2"', '2"'];
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); undo(); }
        else if (e.key === 'y') { e.preventDefault(); redo(); }
        else if (e.key === 's') { e.preventDefault(); if (onShowProjectManager) onShowProjectManager(); }
        else if (e.key === 'o') { e.preventDefault(); if (onOpenDXF) onOpenDXF(); }
        else if (e.key === 'n') { e.preventDefault(); if (onNewProject) onNewProject(); }
      } else {
        const tool = tools.find(t => t.shortcut.toLowerCase() === e.key.toLowerCase());
        if (tool) { setMode(tool.id as any); clearTempPoints(); }
        if (e.key === 's' || e.key === 'S') { setIsSnapPanelOpen(!isSnapPanelOpen); if (onShowSnapPanel) onShowSnapPanel(); }
        if (e.key === 'g') toggleSnap('snapToGrid');
        if (e.key === 'Escape') { setMode('select'); clearTempPoints(); }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [undo, redo, setMode, toggleSnap, clearTempPoints, isSnapPanelOpen, onShowSnapPanel, onShowProjectManager, onNewProject, onOpenDXF]);
  
  const handleClearAll = () => {
    if (confirm('Tüm çizimleri silmek istediğinizden emin misiniz?')) {
      clearAll();
    }
  };
  
  const totalLength = pipes.reduce((sum, pipe) => sum + (pipe.length || 0), 0);
  
  // ============================================
  // RENDER - Apple-Inspired Design
  // ============================================
  
  return (
    <div className="bg-white/95 backdrop-blur-xl border-b border-black/5">
      
      {/* Main Toolbar */}
      <div className="flex items-center justify-between px-4 h-12 gap-3">
        
        {/* Left - File Actions */}
        <div className="flex items-center gap-1">
          {onNewProject && (
            <button
              onClick={onNewProject}
              className="px-3 py-1.5 text-[13px] font-medium text-[#1d1d1f] hover:bg-black/5 rounded-lg transition-all"
            >
              Yeni
            </button>
          )}
          {onOpenDXF && (
            <button
              onClick={onOpenDXF}
              className="px-3 py-1.5 text-[13px] font-medium text-[#1d1d1f] hover:bg-black/5 rounded-lg transition-all"
            >
              Aç
            </button>
          )}
          {onShowProjectManager && (
            <button
              onClick={onShowProjectManager}
              className="px-3 py-1.5 text-[13px] font-medium text-[#1d1d1f] hover:bg-black/5 rounded-lg transition-all"
            >
              Kaydet
            </button>
          )}
        </div>
        
        {/* Center - Drawing Tools */}
        <div className="flex items-center bg-[#f5f5f7] rounded-lg p-0.5">
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => { setMode(tool.id as any); clearTempPoints(); }}
              className={`
                px-3 py-1.5 rounded-md text-[13px] font-medium transition-all
                ${mode === tool.id 
                  ? 'bg-white text-[#1d1d1f] shadow-sm' 
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
                }
              `}
              title={`${tool.name} (${tool.shortcut})`}
            >
              <span className="text-base mr-1">{tool.icon}</span>
              <span className="hidden sm:inline">{tool.name}</span>
            </button>
          ))}
        </div>
        
        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          
          {/* Diameter Selector */}
          {mode === 'pipe' && (
            <select
              value={currentDiameter}
              onChange={(e) => setCurrentDiameter(e.target.value)}
              className="px-2 py-1 text-[13px] bg-[#f5f5f7] border-0 rounded-lg focus:ring-2 focus:ring-[#0071e3]"
            >
              {diameters.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          )}
          
          {/* Building */}
          {onShowBuilding && (
            <button
              onClick={onShowBuilding}
              className="px-3 py-1.5 text-[13px] font-medium text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/5 rounded-lg transition-all"
            >
              Bina
            </button>
          )}
          
          {/* Blueprint */}
          <button
            onClick={onShowBlueprints}
            className="px-3 py-1.5 text-[13px] font-medium text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/5 rounded-lg transition-all"
          >
            Klavuz
          </button>
          
          {/* Snap */}
          <button
            onClick={() => { setIsSnapPanelOpen(!isSnapPanelOpen); if (onShowSnapPanel) onShowSnapPanel(); }}
            className={`
              px-3 py-1.5 text-[13px] font-medium rounded-lg transition-all
              ${snapSettings.enabled ? 'bg-[#0071e3] text-white' : 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/5'}
            `}
          >
            Snap {snapSettings.enabled && '✓'}
          </button>
          
          {/* Undo/Redo */}
          <div className="flex items-center gap-0.5 bg-[#f5f5f7] rounded-lg p-0.5">
            <button
              onClick={undo}
              className="p-1.5 text-[#86868b] hover:text-[#1d1d1f] rounded transition-all"
              title="Geri Al (Ctrl+Z)"
            >
              ↶
            </button>
            <button
              onClick={redo}
              className="p-1.5 text-[#86868b] hover:text-[#1d1d1f] rounded transition-all"
              title="İleri Al (Ctrl+Y)"
            >
              ↷
            </button>
          </div>
          
          {/* Clear */}
          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 text-[13px] font-medium text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            Temizle
          </button>
          
          {/* Materials - Primary Action */}
          <button
            onClick={onShowMaterials}
            className="px-4 py-1.5 bg-[#0071e3] text-white text-[13px] font-medium rounded-full hover:bg-[#0077ed] transition-all"
          >
            Malzeme
          </button>
        </div>
      </div>
      
      {/* Status Bar - Minimal */}
      <div className="flex items-center gap-6 px-4 py-1.5 bg-[#f5f5f7] text-[11px] text-[#86868b]">
        <span>
          <strong className="text-[#1d1d1f]">{mode === 'select' ? 'Seçim' : mode === 'pipe' ? 'Boru' : mode === 'valve' ? 'Vana' : mode === 'meter' ? 'Sayaç' : mode === 'boiler' ? 'Kombi' : 'Silme'}</strong>
        </span>
        <span>Boru: <strong className="text-[#1d1d1f]">{pipes.length}</strong></span>
        <span>Cihaz: <strong className="text-[#1d1d1f]">{components.length}</strong></span>
        <span>Uzunluk: <strong className="text-[#1d1d1f]">{totalLength.toFixed(1)}m</strong></span>
        {mode === 'pipe' && <span>Çap: <strong className="text-[#0071e3]">{currentDiameter}</strong></span>}
        <span className="ml-auto">
          Snap: <strong className={snapSettings.enabled ? 'text-[#0071e3]' : 'text-[#86868b]'}>{snapSettings.enabled ? 'Açık' : 'Kapalı'}</strong>
        </span>
      </div>
    </div>
  );
};

export default EnhancedToolbar;