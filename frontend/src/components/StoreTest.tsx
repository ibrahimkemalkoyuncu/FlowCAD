// src/components/StoreTest.tsx
import React from 'react';
import { useDrawingStore } from '../store/useDrawingStore';

export const StoreTest: React.FC = () => {
  const store = useDrawingStore();
  
  return (
    <div className="fixed top-20 right-4 bg-yellow-100 border border-yellow-400 p-4 rounded-lg z-50">
      <h3 className="font-bold mb-2">Store Test</h3>
      <pre className="text-xs">
        {JSON.stringify({
          mode: store.mode,
          pipes: store.pipes.length,
          components: store.components.length,
          snapToGrid: store.snapToGrid,
          currentDiameter: store.currentDiameter
        }, null, 2)}
      </pre>
      <div className="flex gap-2 mt-2">
        <button 
          onClick={() => store.setMode('pipe')}
          className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
        >
          Pipe Modu
        </button>
        <button 
          onClick={() => store.toggleSnapToGrid()}
          className="px-2 py-1 bg-green-500 text-white text-xs rounded"
        >
          Grid Toggle
        </button>
      </div>
    </div>
  );
};