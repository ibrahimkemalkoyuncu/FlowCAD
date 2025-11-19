// ============================================
// EDITOR PAGE - Ana Çizim Editörü Sayfası
// Konum: frontend/src/pages/EditorPage.tsx
// SNAP sistemi ile geliştirilmiş, tamamen çalışan versiyon
// Son güncelleme: 2025-01-19 11:32:28 UTC
// Geliştirici: @ibrahimkemalkoyuncu
// ============================================

import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Toaster, toast } from 'react-hot-toast';
import { SceneContent } from '../components/InteractiveScene3D';
import { EnhancedToolbar } from '../components/EnhancedToolbar';
import { MaterialCalculator } from '../components/MaterialCalculator';
import { BlueprintPanel } from '../components/BlueprintPanel';
import { PropertyPanel } from '../components/PropertyPanel';
import { SnapPanel } from '../components/SnapPanel';

// ============================================
// EDITOR PAGE COMPONENT
// Ana çizim editörü sayfası
// ============================================

export const EditorPage: React.FC = () => {
  
  // ============================================
  // STATE MANAGEMENT
  // Panel görünürlük durumları
  // ============================================
  
  const [showMaterials, setShowMaterials] = useState(false);
  const [showBlueprints, setShowBlueprints] = useState(false);
  const [showSnapPanel, setShowSnapPanel] = useState(false);

  // ============================================
  // EVENT HANDLERS
  // ============================================

  /**
   * Ana sayfaya dönüş
   * Kullanıcıdan onay ister
   */
  const handleProjectManagerClick = () => {
    toast((t) => (
      <div className="text-center">
        <p className="font-medium mb-3">
          Ana sayfaya dönmek istediğinizden emin misiniz?
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Kaydedilmemiş değişiklikler kaybolacak.
        </p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => {
              window.location.href = '/';
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
      style: {
        background: '#fff',
        color: '#000',
        padding: '20px',
      }
    });
  };

  /**
   * Yeni proje oluştur
   * Sayfayı yeniler
   */
  const handleNewProject = () => {
    toast((t) => (
      <div className="text-center">
        <p className="font-medium mb-3">
          Yeni proje oluşturulsun mu?
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Mevcut çalışma kaybolacak.
        </p>
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
      style: {
        background: '#fff',
        color: '#000',
        padding: '20px',
      }
    });
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      
      {/* ============================================
          TOAST NOTIFICATION SYSTEM
          Tüm bildirimler için
          ============================================ */}
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 2000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {/* ============================================
          ENHANCED TOOLBAR
          Tüm çizim araçları ve kontroller
          ============================================ */}
      <EnhancedToolbar 
        onShowBlueprints={() => setShowBlueprints(!showBlueprints)}
        onShowMaterials={() => setShowMaterials(!showMaterials)}
        onShowProjectManager={handleProjectManagerClick}
        onNewProject={handleNewProject}
        onShowSnapPanel={() => setShowSnapPanel(!showSnapPanel)}
      />
      
      {/* ============================================
          MAIN CONTENT AREA
          3D Canvas ve paneller
          ============================================ */}
      <div className="flex-1 relative overflow-hidden">
        
        {/* ============================================
            3D CANVAS
            React Three Fiber ile 3D render
            ============================================ */}
        <Canvas
          camera={{ 
            position: [10, 10, 10], 
            fov: 50 
          }}
          shadows
          className="w-full h-full"
          gl={{ 
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true
          }}
        >
          <SceneContent />
        </Canvas>
        
        {/* ============================================
            PROPERTY PANEL
            Sağ tarafta - Obje özellikleri
            ============================================ */}
        <div className="absolute top-0 right-0 h-full">
          <PropertyPanel />
        </div>
        
        {/* ============================================
            SNAP PANEL
            Sağ üst köşede - Snap ayarları
            ============================================ */}
        {showSnapPanel && (
          <div className="absolute top-4 right-96 z-50">
            <SnapPanel onClose={() => setShowSnapPanel(false)} />
          </div>
        )}
        
        {/* ============================================
            BLUEPRINT PANEL (MODAL)
            Klavuz/plan yükleme
            ============================================ */}
        {showBlueprints && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <BlueprintPanel onClose={() => setShowBlueprints(false)} />
            </div>
          </div>
        )}
        
        {/* ============================================
            MATERIAL CALCULATOR (MODAL)
            Malzeme listesi ve fiyat hesaplama
            ============================================ */}
        {showMaterials && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40">
            <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden">
              <MaterialCalculator onClose={() => setShowMaterials(false)} />
            </div>
          </div>
        )}

        {/* ============================================
            KEYBOARD SHORTCUTS HELP
            Sağ alt köşe - Kısayol yardımı
            ============================================ */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-4 text-xs border border-gray-200 z-30 max-w-xs">
          
          {/* Başlık */}
          <div className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2">
            <span className="text-lg">⌨️</span>
            <span>Klavye Kısayolları</span>
          </div>
          
          {/* Çizim Araçları */}
          <div className="mb-3">
            <p className="text-gray-500 text-xs font-semibold mb-1.5 uppercase">
              Çizim Araçları
            </p>
            <div className="space-y-1.5 text-gray-700">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono text-xs min-w-[50px] text-center">
                  V
                </kbd>
                <span>Seçim Modu</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono text-xs min-w-[50px] text-center">
                  P
                </kbd>
                <span>Boru Çizimi</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono text-xs min-w-[50px] text-center">
                  A
                </kbd>
                <span>Vana Ekle</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono text-xs min-w-[50px] text-center">
                  M
                </kbd>
                <span>Sayaç Ekle</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono text-xs min-w-[50px] text-center">
                  B
                </kbd>
                <span>Kombi Ekle</span>
              </div>
            </div>
          </div>

          {/* SNAP Kısayolları */}
          <div className="mb-3 pt-3 border-t">
            <p className="text-orange-600 text-xs font-semibold mb-1.5 uppercase flex items-center gap-1">
              <span>🧲</span>
              <span>Snap Sistemi</span>
            </p>
            <div className="space-y-1.5 text-gray-700">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-orange-50 rounded border border-orange-300 font-mono text-xs min-w-[50px] text-center">
                  S
                </kbd>
                <span>Snap Panel</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-orange-50 rounded border border-orange-300 font-mono text-xs min-w-[50px] text-center">
                  G
                </kbd>
                <span>Grid Snap</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-orange-50 rounded border border-orange-300 font-mono text-xs min-w-[50px] text-center">
                  E
                </kbd>
                <span>Endpoint</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-orange-50 rounded border border-orange-300 font-mono text-xs min-w-[50px] text-center">
                  Q
                </kbd>
                <span>Midpoint</span>
              </div>
            </div>
          </div>

          {/* Genel Kısayollar */}
          <div className="pt-3 border-t">
            <p className="text-gray-500 text-xs font-semibold mb-1.5 uppercase">
              Genel
            </p>
            <div className="space-y-1.5 text-gray-700">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono text-xs min-w-[50px] text-center">
                  Esc
                </kbd>
                <span>İptal</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono text-xs min-w-[50px] text-center">
                  Ctrl+Z
                </kbd>
                <span>Geri Al</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono text-xs min-w-[50px] text-center">
                  Ctrl+Y
                </kbd>
                <span>İleri Al</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// EXPORT
// ============================================

export default EditorPage;