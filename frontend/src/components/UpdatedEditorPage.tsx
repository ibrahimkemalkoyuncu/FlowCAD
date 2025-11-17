// ============================================
// 13. UpdatedEditorPage.tsx - Güncellenmiş Editor
// ============================================
import React, { useState } from "react";
import { EnhancedToolbar } from "./EnhancedToolbar";
import { MaterialCalculator } from "./MaterialCalculator";
import { PropertyPanel } from "./PropertyPanel";
import { SceneContent } from "./InteractiveScene3D"; // InteractiveScene3D yerine SceneContent import et

// ============================================
export const UpdatedEditorPage: React.FC = () => {
  const [showMaterialCalc, setShowMaterialCalc] = useState(false);
  const [showBlueprints, setShowBlueprints] = useState(true);
  const [showMaterials, setShowMaterials] = useState(true);
  
  return (
    <div className="h-screen flex flex-col">
      <EnhancedToolbar 
        onShowBlueprints={() => setShowBlueprints(!showBlueprints)}
        onShowMaterials={() => setShowMaterials(!showMaterials)}
      />
      
      <div className="flex-1 flex">
        {/* 3D Canvas */}
        <div className="flex-1 relative">
          <SceneContent />
          
          {/* Shortcuts help */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur rounded-lg shadow-lg p-3 text-xs">
            <div className="font-semibold mb-2">Kısayollar</div>
            <div className="space-y-1 text-gray-600">
              <div><kbd className="px-1.5 py-0.5 bg-gray-200 rounded">V</kbd> Seç</div>
              <div><kbd className="px-1.5 py-0.5 bg-gray-200 rounded">P</kbd> Boru</div>
              <div><kbd className="px-1.5 py-0.5 bg-gray-200 rounded">G</kbd> Grid Snap</div>
              <div><kbd className="px-1.5 py-0.5 bg-gray-200 rounded">Esc</kbd> İptal</div>
              <div><kbd className="px-1.5 py-0.5 bg-gray-200 rounded">Ctrl+Z</kbd> Geri</div>
            </div>
          </div>
          
          {/* Material calc button */}
          <button
            onClick={() => setShowMaterialCalc(true)}
            className="absolute bottom-4 left-4 px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition-colors"
          >
            📋 Malzeme Listesi
          </button>
        </div>
        
        {/* Property panel */}
        <PropertyPanel />
      </div>
      
      {/* Material calculator modal */}
      {showMaterialCalc && (
        <MaterialCalculator onClose={() => setShowMaterialCalc(false)} />
      )}
    </div>
  );
};