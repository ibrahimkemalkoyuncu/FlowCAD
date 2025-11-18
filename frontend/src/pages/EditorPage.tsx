import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { SceneContent } from '../components/InteractiveScene3D';
import { EnhancedToolbar } from '../components/EnhancedToolbar';
import { MaterialCalculator } from '../components/MaterialCalculator';
import { BlueprintPanel } from '../components/BlueprintPanel';
import { PropertyPanel } from '../components/PropertyPanel';
import { DWGLayerManager } from '../components/DWGLayerManager';
import toast from 'react-hot-toast'; // ✅ YENİ EKLEME

export const EditorPage: React.FC = () => {
  const [showMaterials, setShowMaterials] = useState(false);
  const [showBlueprints, setShowBlueprints] = useState(false);

  const handleProjectManagerClick = () => {
    // ✅ Toast ile onaylama
    toast((t) => (
      <div className="text-center">
        <p className="font-medium mb-3">Ana sayfaya dönmek istediğinizden emin misiniz?</p>
        <p className="text-sm text-gray-600 mb-4">Kaydedilmemiş değişiklikler kaybolacak.</p>
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

  const handleNewProject = () => {
    // ✅ Toast ile onaylama
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
      style: {
        background: '#fff',
        color: '#000',
        padding: '20px',
      }
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Toolbar */}
      <EnhancedToolbar 
        onShowBlueprints={() => setShowBlueprints(!showBlueprints)}
        onShowMaterials={() => setShowMaterials(!showMaterials)}
        onShowProjectManager={handleProjectManagerClick} // ✅ DÜZELTİLDİ
        onNewProject={handleNewProject} // ✅ DÜZELTİLDİ
      />
      
      {/* Ana İçerik */}
      <div className="flex-1 relative overflow-hidden">
        {/* 3D Sahne */}
        <Canvas
          camera={{ position: [10, 10, 10], fov: 50 }}
          shadows
          className="w-full h-full"
        >
          <SceneContent />
        </Canvas>
        
        {/* Sağ Panel - Property Panel */}
        <PropertyPanel />
        
        {/* DWG Layer Manager */}
        <DWGLayerManager />
        
        {/* Blueprint Panel (Modal) */}
        {showBlueprints && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40">
            <div className="w-full max-w-4xl max-h-[90vh]">
              <BlueprintPanel onClose={() => setShowBlueprints(false)} />
            </div>
          </div>
        )}
        
        {/* Material Calculator (Modal) */}
        {showMaterials && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40">
            <div className="w-full max-w-5xl max-h-[90vh]">
              <MaterialCalculator onClose={() => setShowMaterials(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};