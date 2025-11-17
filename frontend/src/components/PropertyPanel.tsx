// ============================================
// 11. PropertyPanel.tsx - Özellikler Paneli

import { useDrawingStore } from "./InteractiveScene3D";

// ============================================
export const PropertyPanel: React.FC = () => {
  const { selectedId, pipes, components, updateComponent, removePipe, removeComponent } = useDrawingStore();
  
  if (!selectedId) {
    return (
      <div className="w-64 bg-white border-l p-4">
        <div className="text-gray-500 text-sm text-center py-8">
          Düzenlemek için bir obje seçin
        </div>
      </div>
    );
  }
  
  const selectedPipe = pipes.find(p => p.id === selectedId);
  const selectedComponent = components.find(c => c.id === selectedId);
  
  if (selectedPipe) {
    return (
      <div className="w-64 bg-white border-l p-4 overflow-y-auto">
        <h3 className="font-semibold text-lg mb-4">Boru Özellikleri</h3>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600">Çap</label>
            <div className="font-medium">{selectedPipe.diameter}</div>
          </div>
          
          <div>
            <label className="text-xs text-gray-600">Uzunluk</label>
            <div className="font-medium">{selectedPipe.length?.toFixed(2)} m</div>
          </div>
          
          <div>
            <label className="text-xs text-gray-600">Malzeme</label>
            <div className="font-medium capitalize">{selectedPipe.material}</div>
          </div>
          
          <div>
            <label className="text-xs text-gray-600">Başlangıç</label>
            <div className="text-sm font-mono">
              X: {selectedPipe.start.x.toFixed(1)}<br/>
              Y: {selectedPipe.start.y.toFixed(1)}<br/>
              Z: {selectedPipe.start.z.toFixed(1)}
            </div>
          </div>
          
          <div>
            <label className="text-xs text-gray-600">Bitiş</label>
            <div className="text-sm font-mono">
              X: {selectedPipe.end.x.toFixed(1)}<br/>
              Y: {selectedPipe.end.y.toFixed(1)}<br/>
              Z: {selectedPipe.end.z.toFixed(1)}
            </div>
          </div>
          
          <button
            onClick={() => removePipe(selectedId)}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Boruyu Sil
          </button>
        </div>
      </div>
    );
  }
  
  if (selectedComponent) {
    return (
      <div className="w-64 bg-white border-l p-4 overflow-y-auto">
        <h3 className="font-semibold text-lg mb-4">Cihaz Özellikleri</h3>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600">Ad</label>
            <input
              type="text"
              value={selectedComponent.name}
              onChange={(e) => updateComponent(selectedId, { name: e.target.value })}
              className="w-full px-3 py-1.5 border rounded text-sm"
            />
          </div>
          
          <div>
            <label className="text-xs text-gray-600">Tip</label>
            <div className="font-medium capitalize">{selectedComponent.type}</div>
          </div>
          
          <div>
            <label className="text-xs text-gray-600">Pozisyon</label>
            <div className="space-y-1">
              <input
                type="number"
                value={selectedComponent.position.x}
                onChange={(e) => updateComponent(selectedId, {
                  position: { ...selectedComponent.position, x: parseFloat(e.target.value) }
                })}
                className="w-full px-2 py-1 border rounded text-sm"
                placeholder="X"
                step="0.1"
              />
              <input
                type="number"
                value={selectedComponent.position.y}
                onChange={(e) => updateComponent(selectedId, {
                  position: { ...selectedComponent.position, y: parseFloat(e.target.value) }
                })}
                className="w-full px-2 py-1 border rounded text-sm"
                placeholder="Y"
                step="0.1"
              />
              <input
                type="number"
                value={selectedComponent.position.z}
                onChange={(e) => updateComponent(selectedId, {
                  position: { ...selectedComponent.position, z: parseFloat(e.target.value) }
                })}
                className="w-full px-2 py-1 border rounded text-sm"
                placeholder="Z"
                step="0.1"
              />
            </div>
          </div>
          
          <button
            onClick={() => removeComponent(selectedId)}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Cihazı Sil
          </button>
        </div>
      </div>
    );
  }
  
  return null;
};
