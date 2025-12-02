// ============================================
// EDITOR PAGE - Ana Çizim Editörü Sayfası
// Konum: frontend/src/pages/EditorPage.tsx
// SNAP sistemi ile geliştirilmiş, tamamen çalışan versiyon
// React Router navigation düzeltildi
// AutoCAD benzeri özellikler eklendi
// DXF Entity düzenleme desteği eklendi
// Proje kaydetme/yükleme ve DXF dışa aktarma eklendi
// ============================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Toaster, toast } from 'react-hot-toast';
import { SceneContent } from '../components/InteractiveScene3D';
import EnhancedToolbar from '../components/EnhancedToolbar';
import BlueprintPanel from '../components/BlueprintPanel';
import PropertyPanel from '../components/PropertyPanel';
import MaterialCalculator from '../components/MaterialCalculator';
import SnapPanel from '../components/SnapPanel';
import { DWGUploader } from '../components/DWGUploader';
import CommandLine from '../components/CommandLine';
import CoordinateDisplay from '../components/CoordinateDisplay';
import LayerManager from '../components/LayerManager';
import DXFEntityEditor from '../components/DXFEntityEditor';
import ProjectSaveDialog from '../components/ProjectSaveDialog';
import MeasureTool from '../components/MeasureTool';
import UndoRedoPanel from '../components/UndoRedoPanel';
import { useDrawingStore } from '../store/useDrawingStore';
import type { ParsedDWG } from '../types/dwg';

// ============================================
// EDITOR PAGE COMPONENT
// ============================================

export const EditorPage: React.FC = () => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  
  // Zustand store
  const { undo, redo, history, historyIndex } = useDrawingStore();
  
  // Panel görünürlük durumları
  const [showMaterials, setShowMaterials] = useState(false);
  const [showBlueprints, setShowBlueprints] = useState(false);
  const [showSnapPanel, setShowSnapPanel] = useState(false);
  const [showDWGUploader, setShowDWGUploader] = useState(false);
  const [showLayerManager, setShowLayerManager] = useState(false);
  const [showCommandLine, setShowCommandLine] = useState(true);
  const [showCoordinates, setShowCoordinates] = useState(true);
  const [showDXFEditor, setShowDXFEditor] = useState(false);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showMeasureTool, setShowMeasureTool] = useState(false);
  const [showUndoRedoPanel, setShowUndoRedoPanel] = useState(false);
  const [projectDialogMode, setProjectDialogMode] = useState<'save' | 'load' | 'export'>('save');
  const [currentDXFData, setCurrentDXFData] = useState<ParsedDWG | undefined>(undefined);

  // ============================================
  // KEYBOARD SHORTCUTS - Undo/Redo
  // ============================================
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ctrl+Z - Undo
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      if (historyIndex >= 0) {
        undo();
        toast.success('Geri alındı', { duration: 1500, icon: '↩️' });
      } else {
        toast.error('Geri alınacak işlem yok', { duration: 1500 });
      }
    }
    
    // Ctrl+Y or Ctrl+Shift+Z - Redo
    if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        redo();
        toast.success('Yinelendi', { duration: 1500, icon: '↪️' });
      } else {
        toast.error('Yinelenecek işlem yok', { duration: 1500 });
      }
    }
    
    // M - Measure Tool
    if (e.key === 'm' || e.key === 'M') {
      if (!e.ctrlKey && !e.altKey && !e.shiftKey) {
        // Ignore if typing in an input
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
          return;
        }
        setShowMeasureTool(prev => !prev);
      }
    }
  }, [undo, redo, historyIndex, history.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ============================================
  // EVENT HANDLERS
  // ============================================

  // Proje kaydetme
  const handleProjectManagerClick = () => {
    setProjectDialogMode('save');
    setShowProjectDialog(true);
  };
  
  // Proje yükleme
  const handleLoadProject = () => {
    setProjectDialogMode('load');
    setShowProjectDialog(true);
  };
  
  // DXF dışa aktarma
  const handleExportDXF = () => {
    setProjectDialogMode('export');
    setShowProjectDialog(true);
  };
  
  // DXF yüklendiğinde (gelecekte kullanılacak)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleDXFLoaded = (data: ParsedDWG) => {
    setCurrentDXFData(data);
    setShowDWGUploader(false);
    toast.success(`DXF yüklendi: ${data.entities.length} entity`);
  };
  
  // currentDXFData kullanımı için (lint warning'i önlemek için)
  void currentDXFData;
  void _handleDXFLoaded;

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
    <div className="h-screen flex flex-col bg-[#fafafa]">
      {/* Toast Notifications */}
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#1d1d1f',
          color: '#fff',
          borderRadius: '12px',
          fontSize: '14px',
          padding: '12px 20px',
        },
      }} />

      {/* Toolbar */}
      <EnhancedToolbar
        onShowBlueprints={() => setShowBlueprints(!showBlueprints)}
        onShowMaterials={() => setShowMaterials(!showMaterials)}
        onShowProjectManager={handleProjectManagerClick}
        onNewProject={handleNewProject}
        onShowSnapPanel={() => setShowSnapPanel(!showSnapPanel)}
        onOpenDXF={() => setShowDWGUploader(true)}
      />

      {/* Secondary Toolbar - Apple Style (Clean & Minimal) */}
      <div className="bg-[#f5f5f7] border-b border-black/5 px-4 py-1.5 flex items-center gap-3">
        <button
          onClick={() => setShowLayerManager(true)}
          className="px-3 py-1 text-[12px] font-medium text-[#86868b] hover:text-[#1d1d1f] hover:bg-white/60 rounded-md transition-all"
        >
          Katmanlar
        </button>
        <button
          onClick={() => setShowDXFEditor(true)}
          className="px-3 py-1 text-[12px] font-medium text-[#86868b] hover:text-[#1d1d1f] hover:bg-white/60 rounded-md transition-all"
        >
          DXF Düzenle
        </button>
        <button
          onClick={handleExportDXF}
          className="px-3 py-1 text-[12px] font-medium text-[#0071e3] hover:bg-[#0071e3]/10 rounded-md transition-all"
        >
          Dışa Aktar
        </button>
        <button
          onClick={handleLoadProject}
          className="px-3 py-1 text-[12px] font-medium text-[#86868b] hover:text-[#1d1d1f] hover:bg-white/60 rounded-md transition-all"
        >
          Proje Yükle
        </button>
        
        <div className="w-px h-4 bg-black/10" />
        
        {/* Undo/Redo */}
        <button
          onClick={() => {
            if (historyIndex >= 0) {
              undo();
              toast.success('Geri alındı', { duration: 1500 });
            }
          }}
          className={`px-2 py-1 text-[12px] rounded-md transition-all ${
            historyIndex >= 0 ? 'text-[#1d1d1f] hover:bg-white/60' : 'text-[#c7c7cc]'
          }`}
          disabled={historyIndex < 0}
        >
          ↶ Geri
        </button>
        <button
          onClick={() => {
            if (historyIndex < history.length - 1) {
              redo();
              toast.success('Yinelendi', { duration: 1500 });
            }
          }}
          className={`px-2 py-1 text-[12px] rounded-md transition-all ${
            historyIndex < history.length - 1 ? 'text-[#1d1d1f] hover:bg-white/60' : 'text-[#c7c7cc]'
          }`}
          disabled={historyIndex >= history.length - 1}
        >
          Yinele ↷
        </button>
        <button
          onClick={() => setShowUndoRedoPanel(true)}
          className="px-2 py-1 text-[12px] text-[#86868b] hover:text-[#1d1d1f] hover:bg-white/60 rounded-md transition-all"
        >
          Geçmiş
        </button>
        
        <div className="w-px h-4 bg-black/10" />
        
        {/* Measure Tool */}
        <button
          onClick={() => setShowMeasureTool(!showMeasureTool)}
          className={`px-3 py-1 text-[12px] font-medium rounded-md transition-all ${
            showMeasureTool ? 'bg-[#0071e3] text-white' : 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-white/60'
          }`}
        >
          Ölçü
        </button>
        <button
          onClick={() => setShowCoordinates(!showCoordinates)}
          className={`px-3 py-1 text-[12px] font-medium rounded-md transition-all ${
            showCoordinates ? 'bg-[#0071e3] text-white' : 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-white/60'
          }`}
        >
          Koordinat
        </button>
        <button
          onClick={() => setShowCommandLine(!showCommandLine)}
          className={`px-3 py-1 text-[12px] font-medium rounded-md transition-all ${
            showCommandLine ? 'bg-[#0071e3] text-white' : 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-white/60'
          }`}
        >
          Komut
        </button>
        
        <div className="flex-1" />
        
        <span className="text-[11px] text-[#86868b]">FlowCAD v1.0</span>
      </div>

      {/* Main 3D Canvas Area */}
      <div ref={canvasContainerRef} className={`flex-1 relative overflow-hidden ${showCommandLine ? 'pb-48' : ''}`}>
        <Canvas
          camera={{ position: [10, 10, 10], fov: 50 }}
          shadows
          className="w-full h-full"
        >
          <SceneContent />
        </Canvas>

        {/* Coordinate Display - Sol Alt */}
        {showCoordinates && (
          <CoordinateDisplay containerRef={canvasContainerRef} />
        )}

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
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40 p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <BlueprintPanel onClose={() => setShowBlueprints(false)} />
            </div>
          </div>
        )}

        {/* Material Calculator - Modal */}
        {showMaterials && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40 p-4">
            <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden">
              <MaterialCalculator onClose={() => setShowMaterials(false)} />
            </div>
          </div>
        )}

        {/* Layer Manager - Modal */}
        {showLayerManager && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40 p-4">
            <LayerManager onClose={() => setShowLayerManager(false)} />
          </div>
        )}

        {/* DXF Entity Editor - Modal */}
        {showDXFEditor && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40 p-4">
            <DXFEntityEditor onClose={() => setShowDXFEditor(false)} />
          </div>
        )}

        {/* DWG Uploader - Modal */}
        {showDWGUploader && (
          <DWGUploader onClose={() => setShowDWGUploader(false)} />
        )}

        {/* Project Save Dialog - Modal */}
        {showProjectDialog && (
          <ProjectSaveDialog
            onClose={() => setShowProjectDialog(false)}
            dxfData={currentDXFData}
            mode={projectDialogMode}
          />
        )}

        {/* Measure Tool - Modal */}
        {showMeasureTool && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40 p-4">
            <MeasureTool 
              onClose={() => setShowMeasureTool(false)} 
              containerRef={canvasContainerRef}
            />
          </div>
        )}

        {/* Undo/Redo Panel - Modal */}
        {showUndoRedoPanel && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40 p-4">
            <UndoRedoPanel onClose={() => setShowUndoRedoPanel(false)} />
          </div>
        )}

        {/* Keyboard Shortcuts Help - Apple Style (Clean & Minimal) */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-4 text-[12px] border border-black/5 z-30 max-w-[200px]">
          <div className="font-semibold text-[#1d1d1f] mb-3 text-[13px]">
            Kısayollar
          </div>
          <div className="space-y-2 text-[#86868b]">
            <div className="flex justify-between">
              <span>Kaydet</span>
              <kbd className="text-[11px] bg-[#f5f5f7] px-1.5 py-0.5 rounded">⌘S</kbd>
            </div>
            <div className="flex justify-between">
              <span>Aç</span>
              <kbd className="text-[11px] bg-[#f5f5f7] px-1.5 py-0.5 rounded">⌘O</kbd>
            </div>
            <div className="flex justify-between">
              <span>Geri Al</span>
              <kbd className="text-[11px] bg-[#f5f5f7] px-1.5 py-0.5 rounded">⌘Z</kbd>
            </div>
            <div className="flex justify-between">
              <span>Yinele</span>
              <kbd className="text-[11px] bg-[#f5f5f7] px-1.5 py-0.5 rounded">⌘Y</kbd>
            </div>
            <div className="flex justify-between">
              <span>Ölçü</span>
              <kbd className="text-[11px] bg-[#f5f5f7] px-1.5 py-0.5 rounded">M</kbd>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-black/5 text-[11px] text-[#86868b]">
            "HELP" yazarak tümünü görün
          </div>
        </div>
      </div>

      {/* Command Line - AutoCAD Style */}
      {showCommandLine && (
        <CommandLine
          onOpenDXF={() => setShowDWGUploader(true)}
          onShowMaterials={() => setShowMaterials(true)}
          onShowBlueprints={() => setShowBlueprints(true)}
          onNewProject={handleNewProject}
          onSaveProject={handleProjectManagerClick}
          onExportDXF={handleExportDXF}
          onShowMeasureTool={() => setShowMeasureTool(true)}
          onShowUndoRedoPanel={() => setShowUndoRedoPanel(true)}
        />
      )}
    </div>
  );
};

export default EditorPage;