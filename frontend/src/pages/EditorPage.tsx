import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { SceneContent } from '../components/InteractiveScene3D';  // ✅ SceneContent kullanın
import { EnhancedToolbar } from '../components/EnhancedToolbar';
import { MaterialCalculator } from '../components/MaterialCalculator';
import { BlueprintPanel } from '../components/BlueprintPanel';
import { PropertyPanel } from '../components/PropertyPanel';
import { DWGLayerManager } from '../components/DWGLayerManager';

export const EditorPage: React.FC = () => {
  const [showMaterials, setShowMaterials] = useState(false);
  const [showBlueprints, setShowBlueprints] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Toolbar */}
      <EnhancedToolbar 
        onShowBlueprints={() => setShowBlueprints(!showBlueprints)}
        onShowMaterials={() => setShowMaterials(!showMaterials)}
        onShowProjectManager={() => {
          if (confirm('Ana sayfaya dönmek istediğinizden emin misiniz?')) {
            window.location.href = '/';
          }
        }}
        onNewProject={() => {
          if (confirm('Yeni proje oluşturulsun mu?')) {
            window.location.reload();
          }
        }}
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