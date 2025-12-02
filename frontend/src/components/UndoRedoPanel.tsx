// ============================================
// UNDO REDO PANEL - Geri Al/Yinele Paneli
// Konum: frontend/src/components/UndoRedoPanel.tsx
// AutoCAD benzeri Undo/Redo geçmişi görüntüleme
// ============================================

import React, { useState } from 'react';
import { useDrawingStore } from '../store/useDrawingStore';

// ============================================
// UNDO REDO PANEL COMPONENT
// ============================================

interface UndoRedoPanelProps {
  onClose: () => void;
}

const UndoRedoPanel: React.FC<UndoRedoPanelProps> = ({ onClose }) => {
  const { 
    history, 
    historyIndex, 
    undo, 
    redo, 
    pipes, 
    components 
  } = useDrawingStore();
  
  const [showDetails, setShowDetails] = useState(false);

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;
  const totalActions = history.length;
  const currentPosition = historyIndex + 1;

  // ============================================
  // ACTION HANDLERS
  // ============================================

  const handleUndo = () => {
    if (canUndo) {
      undo();
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      redo();
    }
  };

  const handleMultipleUndo = (count: number) => {
    for (let i = 0; i < count && historyIndex >= 0; i++) {
      undo();
    }
  };

  const handleMultipleRedo = (count: number) => {
    for (let i = 0; i < count && historyIndex < history.length - 1; i++) {
      redo();
    }
  };

  // ============================================
  // HISTORY ITEM DESCRIPTION
  // ============================================

  const getHistoryItemDescription = (item: { pipes: unknown[]; components: unknown[] }, index: number): string => {
    const prevItem = index > 0 ? history[index - 1] : { pipes: [], components: [] };
    
    const pipeDiff = item.pipes.length - prevItem.pipes.length;
    const componentDiff = item.components.length - prevItem.components.length;
    
    if (pipeDiff > 0) return `${pipeDiff} boru eklendi`;
    if (pipeDiff < 0) return `${Math.abs(pipeDiff)} boru silindi`;
    if (componentDiff > 0) return `${componentDiff} cihaz eklendi`;
    if (componentDiff < 0) return `${Math.abs(componentDiff)} cihaz silindi`;
    
    return 'Değişiklik';
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">↩️</span>
            <div>
              <h2 className="text-xl font-bold">Geri Al / Yinele</h2>
              <p className="text-indigo-200 text-sm">İşlem geçmişi ve geri alma</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-indigo-500/30 hover:bg-indigo-500/50 transition-colors"
            title="Kapat (ESC)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Current State Summary */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-2xl font-bold text-blue-600">{pipes.length}</div>
            <div className="text-xs text-gray-500">Boru</div>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-2xl font-bold text-green-600">{components.length}</div>
            <div className="text-xs text-gray-500">Cihaz</div>
          </div>
        </div>
        <div className="mt-3 text-center text-sm text-gray-600">
          İşlem Geçmişi: {currentPosition} / {totalActions}
        </div>
      </div>

      {/* Undo/Redo Buttons */}
      <div className="p-4 flex gap-3">
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
            canUndo
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span className="text-xl">↩️</span>
          <span>Geri Al</span>
        </button>
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
            canRedo
              ? 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span className="text-xl">↪️</span>
          <span>Yinele</span>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={() => handleMultipleUndo(5)}
          disabled={!canUndo}
          className={`flex-1 py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1 transition-all ${
            canUndo
              ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span>↩️</span>
          <span>5 Adım Geri</span>
        </button>
        <button
          onClick={() => handleMultipleRedo(5)}
          disabled={!canRedo}
          className={`flex-1 py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1 transition-all ${
            canRedo
              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span>↪️</span>
          <span>5 Adım İleri</span>
        </button>
      </div>

      {/* History Toggle */}
      <div className="px-4">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full py-2 px-4 bg-gray-100 rounded-lg text-sm text-gray-600 hover:bg-gray-200 transition-colors flex items-center justify-between"
        >
          <span>İşlem Geçmişi Detayları</span>
          <span className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
      </div>

      {/* History List */}
      {showDetails && (
        <div className="p-4 max-h-64 overflow-y-auto">
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-3 block">📝</span>
              <p>Henüz işlem yapılmadı</p>
              <p className="text-sm mt-1">Çizim yaparak başlayın</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item, index) => {
                const isCurrent = index === historyIndex;
                const isPast = index < historyIndex;
                const isFuture = index > historyIndex;
                
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border transition-all ${
                      isCurrent
                        ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/30'
                        : isPast
                        ? 'bg-gray-50 border-gray-200 opacity-75'
                        : 'bg-purple-50 border-purple-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          isCurrent
                            ? 'bg-indigo-600 text-white'
                            : isPast
                            ? 'bg-gray-400 text-white'
                            : 'bg-purple-400 text-white'
                        }`}>
                          {index + 1}
                        </span>
                        <span className={`text-sm font-medium ${
                          isCurrent ? 'text-indigo-700' : 'text-gray-600'
                        }`}>
                          {getHistoryItemDescription(item, index)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.pipes.length} boru, {item.components.length} cihaz
                      </div>
                    </div>
                    {isCurrent && (
                      <div className="mt-1 text-xs text-indigo-500 flex items-center gap-1">
                        <span>●</span>
                        <span>Mevcut durum</span>
                      </div>
                    )}
                    {isFuture && (
                      <div className="mt-1 text-xs text-purple-500 flex items-center gap-1">
                        <span>↪️</span>
                        <span>Yinelenebilir</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Keyboard Shortcuts */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded font-mono">Ctrl+Z</kbd>
            <span>Geri Al</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded font-mono">Ctrl+Y</kbd>
            <span>Yinele</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded font-mono">Ctrl+Shift+Z</kbd>
            <span>Yinele</span>
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 pb-4">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
            style={{
              width: totalActions > 0 ? `${(currentPosition / totalActions) * 100}%` : '0%'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default UndoRedoPanel;
