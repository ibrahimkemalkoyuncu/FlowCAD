// ============================================
// EDITOR PAGE - Ana Çizim Editörü Sayfası
// Konum: frontend/src/pages/EditorPage.tsx
// SNAP sistemi ile geliştirilmiş, tamamen çalışan versiyon
// React Router navigation düzeltildi
// Sağ tıklama context menu eklendi
// ============================================

import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Toaster, toast } from 'react-hot-toast';
import { SceneContent } from '../components/InteractiveScene3D';
import EnhancedToolbar from '../components/EnhancedToolbar';
import BlueprintPanel from '../components/BlueprintPanel';
import BlueprintAddModal from '../components/BlueprintAddModal';
import PropertyPanel from '../components/PropertyPanel';
import MaterialCalculator from '../components/MaterialCalculator';
import SnapPanel from '../components/SnapPanel';
import ContextMenu from '../components/ContextMenu';
import { useBlueprintStore } from '../store/useBlueprintStore';
import { blueprintApi } from '../services/blueprintApi';
import { dwgParser } from '../services/dwgParser';

// ============================================
// EDITOR PAGE COMPONENT
// ============================================

export const EditorPage: React.FC = () => {
  const { addBlueprint } = useBlueprintStore();
  
  // Panel görünürlük durumları
  const [showMaterials, setShowMaterials] = useState(false);
  const [showBlueprints, setShowBlueprints] = useState(false);
  const [showBlueprintAddModal, setShowBlueprintAddModal] = useState(false);
  const [showSnapPanel, setShowSnapPanel] = useState(false);
  const [showGrid, setShowGrid] = useState(true); // Grid visibility toggle
  
  // Context menu state - Sağ tıklama menüsü
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  
  // File input ref for DWG/DXF files
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // ============================================
  // EVENT HANDLERS
  // ============================================

  // Sağ tıklama handler - Context menu açar
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  // Context menu kapat
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  // Dosya aç - DWG/DXF file picker (AutoCAD style)
  const handleOpenFile = () => {
    fileInputRef.current?.click();
  };

  // DWG/DXF dosyası seçildiğinde
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension !== '.dwg' && fileExtension !== '.dxf') {
      toast.error('Sadece DWG veya DXF dosyaları desteklenir!');
      return;
    }

    const loadingToast = toast.loading('DXF dosyası işleniyor...');

    try {
      // Parse DXF/DWG file content
      const content = await file.text();
      let parsedDWG = await dwgParser.parseDWG(content);
      
      // Scale (AutoCAD typically uses mm, we use meters - increased for better visibility)
      const scale = 0.1;
      parsedDWG = dwgParser.scaleDWG(parsedDWG, scale);
      
      // Center the drawing
      parsedDWG = dwgParser.centerDWG(parsedDWG);
      
      // Upload file to server (for storage/backup)
      const result = await blueprintApi.upload(file);
      
      // Get API base URL for constructing full URL
      const apiUrl = import.meta.env.VITE_API_URL || 'https://localhost:7121';
      
      // Create blueprint from parsed data
      const blueprint: any = {
        id: `blueprint_${Date.now()}`,
        name: file.name,
        type: fileExtension === '.dxf' ? 'dxf' : 'dwg',
        url: `${apiUrl}${result.url}`,
        width: parsedDWG.bounds.maxX - parsedDWG.bounds.minX,
        height: parsedDWG.bounds.maxY - parsedDWG.bounds.minY,
        scale: 1,
        position: { x: 0, y: 0.1, z: 0 },
        rotation: 0,
        opacity: 1.0,
        visible: true,
        locked: false,
        dwgData: parsedDWG // Attach parsed geometry data
      };
      
      addBlueprint(blueprint);
      toast.success(`${file.name} yüklendi! ${parsedDWG.entities.length} entity bulundu.`, { id: loadingToast });
      
      // Show blueprints panel
      setShowBlueprints(true);
      
    } catch (error) {
      console.error('File processing error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Bilinmeyen hata';
      toast.error(`Dosya işlenirken hata: ${errorMsg}`, { id: loadingToast });
    }
    
    // Reset input
    e.target.value = '';
  };

  // Yeni proje oluşturma onayı
  const handleNewProject = () => {
    toast((t) => (
      <div className="text-center">
        <p className="font-medium mb-3">Yeni proje oluşturulsun mu?</p>
        <p className="text-sm text-gray-600 mb-4">Mevcut çalışma kaybolacak.</p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => {
              window.location.reload();
              toast.dismiss(t.id);
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            Yeni Proje
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            İptal
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      style: { background: '#fff', color: '#000', padding: '20px' }
    });
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="h-screen flex flex-col bg-gray-100" onContextMenu={handleContextMenu}>
      {/* Toast Notifications */}
      <Toaster position="top-center" />

      {/* Hidden file input for DWG/DXF */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".dwg,.dxf"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* Context Menu - Sağ tıklama menüsü */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={handleCloseContextMenu}
          onShowBlueprints={() => setShowBlueprints(true)}
          onShowBlueprintAddModal={() => setShowBlueprintAddModal(true)}
          onShowMaterials={() => setShowMaterials(true)}
          onShowSnapPanel={() => setShowSnapPanel(true)}
        />
      )}

      {/* Toolbar */}
      <EnhancedToolbar
        onShowBlueprints={() => setShowBlueprints(!showBlueprints)}
        onShowMaterials={() => setShowMaterials(!showMaterials)}
        onShowProjectManager={handleOpenFile}
        onNewProject={handleNewProject}
        onShowSnapPanel={() => setShowSnapPanel(!showSnapPanel)}
        onToggleGrid={() => setShowGrid(!showGrid)}
        showGrid={showGrid}
      />

      {/* Main 3D Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        <Canvas
          camera={{ position: [10, 10, 10], fov: 50 }}
          shadows
          className="w-full h-full"
        >
          <SceneContent showGrid={showGrid} />
        </Canvas>

        {/* Property Panel - Sağda */}
        <div className="absolute top-0 right-0 h-full">
          <PropertyPanel />
        </div>

        {/* Snap Panel - Modal */}
        {showSnapPanel && (
          <div className="absolute top-4 right-96 z-50">
            <SnapPanel onClose={() => setShowSnapPanel(false)} />
          </div>
        )}

        {/* Blueprint Panel - Modal */}
        {showBlueprints && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <BlueprintPanel onClose={() => setShowBlueprints(false)} />
            </div>
          </div>
        )}

        {/* Material Calculator - Modal */}
        {showMaterials && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40">
            <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden">
              <MaterialCalculator onClose={() => setShowMaterials(false)} />
            </div>
          </div>
        )}

        {/* Blueprint Add Modal - Klavuz Ekle penceresi (Issue #7) */}
        {showBlueprintAddModal && (
          <BlueprintAddModal onClose={() => setShowBlueprintAddModal(false)} />
        )}

        {/* Keyboard Shortcuts Help */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-4 text-xs border border-gray-200 z-30 max-w-xs">
          <div className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2">
            <span className="text-lg">⌨️</span>
            <span>Klavye Kısayolları</span>
          </div>
          <div className="space-y-1.5 text-gray-700">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 rounded border text-xs">V</kbd>
              <span>Seçim</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 rounded border text-xs">P</kbd>
              <span>Boru</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-orange-50 rounded border text-xs">S</kbd>
              <span>Snap Panel</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 rounded border text-xs">Esc</kbd>
              <span>İptal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;