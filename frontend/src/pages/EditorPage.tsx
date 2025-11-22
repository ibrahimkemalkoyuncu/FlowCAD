// ============================================
// EDITOR PAGE - Ana Çizim Editörü Sayfası
// Konum: frontend/src/pages/EditorPage.tsx
// SNAP sistemi ile geliştirilmiş, tamamen çalışan versiyon
// React Router navigation düzeltildi
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Toaster, toast } from 'react-hot-toast';
import { SceneContent } from '../components/InteractiveScene3D';
import EnhancedToolbar from '../components/EnhancedToolbar';
import BlueprintPanel from '../components/BlueprintPanel';
import PropertyPanel from '../components/PropertyPanel';
import MaterialCalculator from '../components/MaterialCalculator';
import SnapPanel from '../components/SnapPanel';

// ============================================
// EDITOR PAGE COMPONENT
// ============================================

export const EditorPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Panel görünürlük durumları
  const [showMaterials, setShowMaterials] = useState(false);
  const [showBlueprints, setShowBlueprints] = useState(false);
  const [showSnapPanel, setShowSnapPanel] = useState(false);

  // ============================================
  // EVENT HANDLERS
  // ============================================

  // Proje yöneticisi dönüş onayı
  const handleProjectManagerClick = () => {
    toast((t) => (
      <div className="text-center">
        <p className="font-medium mb-3">Ana sayfaya dönmek istediğinizden emin misiniz?</p>
        <p className="text-sm text-gray-600 mb-4">Kaydedilmemiş değişiklikler kaybolacak.</p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => {
              navigate('/');
              toast.dismiss(t.id);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Evet, Dön
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
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Toast Notifications */}
      <Toaster position="top-center" />

      {/* Toolbar */}
      <EnhancedToolbar
        onShowBlueprints={() => setShowBlueprints(!showBlueprints)}
        onShowMaterials={() => setShowMaterials(!showMaterials)}
        onShowProjectManager={handleProjectManagerClick}
        onNewProject={handleNewProject}
        onShowSnapPanel={() => setShowSnapPanel(!showSnapPanel)}
      />

      {/* Main 3D Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        <Canvas
          camera={{ position: [10, 10, 10], fov: 50 }}
          shadows
          className="w-full h-full"
        >
          <SceneContent />
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