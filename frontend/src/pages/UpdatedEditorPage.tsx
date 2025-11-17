import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { SceneContent } from '../components/InteractiveScene3D';
import { EnhancedToolbar } from '../components/EnhancedToolbar';
import { PropertyPanel } from '../components/PropertyPanel';
import { BlueprintPanel } from '../components/BlueprintPanel';
import { MaterialCalculator } from '../components/MaterialCalculator';
import { StoreTest } from '../components/StoreTest';

export const UpdatedEditorPage: React.FC = () => {
  const [showMaterialCalc, setShowMaterialCalc] = useState(false);
  const [showBlueprintPanel, setShowBlueprintPanel] = useState(true);
  
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex-shrink-0"> {/* Toolbar sabit yükseklikte */}
        <EnhancedToolbar 
          onShowBlueprints={() => setShowBlueprintPanel(!showBlueprintPanel)}
          onShowMaterials={() => setShowMaterialCalc(true)}
        />
        <StoreTest /> {/* Test bileşenini ekle */}
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-0"> {/* min-h-0 kritik! */}
        {/* Blueprint Panel (Sol) */}
        {showBlueprintPanel && (
          <div className="w-80 h-full overflow-auto border-r border-gray-300 flex-shrink-0">
            <BlueprintPanel />
          </div>
        )}
        
        {/* 3D Canvas (Orta) - TAM EKRAN */}
        <div className="flex-1 relative min-w-0"> {/* min-w-0 kritik! */}
          <Canvas 
            shadows 
            style={{ 
              width: '100%', 
              height: '100%', 
              display: 'block',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }}
          >
            <SceneContent />
          </Canvas>
        </div>
        
        {/* Property Panel (Sağ) */}
        <div className="w-80 h-full overflow-auto border-l border-gray-300 flex-shrink-0">
          <PropertyPanel />
        </div>
      </div>
      
      {/* Material Calculator Modal */}
      {showMaterialCalc && (
        <MaterialCalculator onClose={() => setShowMaterialCalc(false)} />
      )}
    </div>
  );
};