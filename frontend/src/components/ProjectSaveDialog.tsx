// ============================================
// PROJECT SAVE DIALOG - Proje Kaydetme Diyaloğu
// Konum: frontend/src/components/ProjectSaveDialog.tsx
// Proje kaydetme, yükleme ve dışa aktarma işlemleri
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { projectManager, type SavedProject, type SavedPipe, type SavedComponent } from '../services/projectManager';
import { dxfExporter } from '../services/dxfExporter';
import { useDrawingStore } from '../store/useDrawingStore';
import type { ParsedDWG } from '../types/dwg';

// ============================================
// INTERFACE
// ============================================

interface ProjectSaveDialogProps {
  onClose: () => void;
  dxfData?: ParsedDWG;
  mode?: 'save' | 'load' | 'export';
}

// ============================================
// COMPONENT
// ============================================

export const ProjectSaveDialog: React.FC<ProjectSaveDialogProps> = ({ 
  onClose, 
  dxfData,
  mode: initialMode = 'save'
}) => {
  // State
  const [mode, setMode] = useState<'save' | 'load' | 'export'>(initialMode);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Store
  const { pipes, components } = useDrawingStore();
  
  // ============================================
  // EFFECTS
  // ============================================
  
  useEffect(() => {
    loadProjects();
    
    // Mevcut proje varsa, bilgilerini doldur
    const currentProject = projectManager.getCurrentProject();
    if (currentProject) {
      setProjectName(currentProject.name);
      setProjectDescription(currentProject.description);
      setSelectedProject(currentProject.id);
    }
  }, []);
  
  // ============================================
  // HANDLERS
  // ============================================
  
  const loadProjects = () => {
    setProjects(projectManager.listProjects());
  };
  
  const handleSave = async () => {
    if (!projectName.trim()) {
      toast.error('Proje adı gerekli');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Pipe verilerini dönüştür
      const savedPipes: SavedPipe[] = pipes.map(pipe => ({
        id: pipe.id,
        startPoint: pipe.start,
        endPoint: pipe.end,
        diameter: pipe.diameter,
        length: pipe.length
      }));
      
      // Component verilerini dönüştür
      const savedComponents: SavedComponent[] = components.map(comp => ({
        id: comp.id,
        type: comp.type,
        position: comp.position,
        rotation: comp.rotation
      }));
      
      const project = projectManager.saveProject(
        projectName.trim(),
        projectDescription.trim(),
        savedPipes,
        savedComponents,
        dxfData,
        selectedProject || undefined
      );
      
      toast.success(`"${project.name}" başarıyla kaydedildi`);
      loadProjects();
      setSelectedProject(project.id);
    } catch (error) {
      toast.error('Kaydetme hatası: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLoad = (project: SavedProject) => {
    setIsLoading(true);
    
    try {
      const loaded = projectManager.loadProject(project.id);
      if (!loaded) {
        throw new Error('Proje yüklenemedi');
      }
      
      // TODO: Store'a verileri yükle
      // Bu kısım store entegrasyonu gerektirir
      
      toast.success(`"${loaded.name}" yüklendi`);
      onClose();
    } catch (error) {
      toast.error('Yükleme hatası: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = (id: string, name: string) => {
    if (confirm(`"${name}" projesini silmek istediğinizden emin misiniz?`)) {
      projectManager.deleteProject(id);
      toast.success('Proje silindi');
      loadProjects();
      if (selectedProject === id) {
        setSelectedProject(null);
        setProjectName('');
        setProjectDescription('');
      }
    }
  };
  
  const handleDuplicate = (id: string) => {
    const duplicated = projectManager.duplicateProject(id);
    if (duplicated) {
      toast.success(`"${duplicated.name}" oluşturuldu`);
      loadProjects();
    }
  };
  
  const handleExportJSON = (id: string) => {
    try {
      projectManager.exportProjectAsJSON(id);
      toast.success('JSON dosyası indirildi');
    } catch (error) {
      toast.error('Dışa aktarma hatası');
    }
  };
  
  const handleExportDXF = () => {
    setIsLoading(true);
    
    try {
      // Mevcut çizimleri DXF olarak dışa aktar
      const savedPipes: SavedPipe[] = pipes.map(pipe => ({
        id: pipe.id,
        startPoint: { x: pipe.startPoint[0], y: pipe.startPoint[1], z: pipe.startPoint[2] },
        endPoint: { x: pipe.endPoint[0], y: pipe.endPoint[1], z: pipe.endPoint[2] },
        diameter: pipe.diameter,
        length: pipe.length
      }));
      
      const savedComponents: SavedComponent[] = components.map(comp => ({
        id: comp.id,
        type: comp.type,
        position: comp.position,
        rotation: comp.rotation
      }));
      
      const dxfContent = dxfExporter.exportProjectToDXF({
        name: projectName || 'FlowCAD_Export',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pipes: savedPipes,
        components: savedComponents,
        dxfData
      });
      
      dxfExporter.downloadDXF(dxfContent, projectName || 'FlowCAD_Export');
      toast.success('DXF dosyası indirildi');
    } catch (error) {
      toast.error('DXF dışa aktarma hatası: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    
    try {
      const imported = await projectManager.importProjectFromJSON(file);
      toast.success(`"${imported.name}" içe aktarıldı`);
      loadProjects();
    } catch (error) {
      toast.error('İçe aktarma hatası: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Filtrelenmiş projeler
  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Storage bilgisi
  const storageInfo = projectManager.getStorageInfo();
  const usedPercentage = (storageInfo.used / (5 * 1024 * 1024)) * 100;
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💾</span>
            <div>
              <h2 className="text-xl font-bold">Proje Yöneticisi</h2>
              <p className="text-blue-100 text-sm">Kaydet, Yükle veya Dışa Aktar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setMode('save')}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              mode === 'save' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            💾 Kaydet
          </button>
          <button
            onClick={() => setMode('load')}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              mode === 'load' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            📂 Yükle
          </button>
          <button
            onClick={() => setMode('export')}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              mode === 'export' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            📤 Dışa Aktar
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          
          {/* SAVE MODE */}
          {mode === 'save' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proje Adı *
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Örn: Kat 1 Tesisat Projesi"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Proje hakkında notlar..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
              
              {/* Proje Özeti */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2">Proje Özeti</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-white rounded p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{pipes.length}</div>
                    <div className="text-gray-500">Boru</div>
                  </div>
                  <div className="bg-white rounded p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">{components.length}</div>
                    <div className="text-gray-500">Cihaz</div>
                  </div>
                  <div className="bg-white rounded p-3 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {pipes.reduce((sum, p) => sum + p.length, 0).toFixed(1)}m
                    </div>
                    <div className="text-gray-500">Toplam Uzunluk</div>
                  </div>
                </div>
              </div>
              
              {/* Kaydet Butonu */}
              <button
                onClick={handleSave}
                disabled={isLoading || !projectName.trim()}
                className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  isLoading || !projectName.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    💾 {selectedProject ? 'Güncelle' : 'Kaydet'}
                  </>
                )}
              </button>
            </div>
          )}
          
          {/* LOAD MODE */}
          {mode === 'load' && (
            <div className="space-y-4">
              {/* Arama ve İçe Aktar */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Proje ara..."
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.flowcad.json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  📥 İçe Aktar
                </button>
              </div>
              
              {/* Proje Listesi */}
              {filteredProjects.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-3">📁</div>
                  <p>Kayıtlı proje bulunamadı</p>
                  <p className="text-sm mt-1">Yeni bir proje oluşturun veya JSON dosyası içe aktarın</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {filteredProjects.map(project => (
                    <div
                      key={project.id}
                      className={`border rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer ${
                        selectedProject === project.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedProject(project.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">{project.name}</h3>
                          {project.description && (
                            <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span>📅 {new Date(project.updatedAt).toLocaleDateString('tr-TR')}</span>
                            <span>🔧 {project.metadata.totalPipes} boru</span>
                            <span>⚙️ {project.metadata.totalComponents} cihaz</span>
                            <span>📏 {project.metadata.totalLength.toFixed(1)}m</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLoad(project);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="Yükle"
                          >
                            📂
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicate(project.id);
                            }}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Çoğalt"
                          >
                            📋
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportJSON(project.id);
                            }}
                            className="p-2 text-green-600 hover:bg-green-100 rounded transition-colors"
                            title="JSON Olarak İndir"
                          >
                            📤
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(project.id, project.name);
                            }}
                            className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Sil"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* EXPORT MODE */}
          {mode === 'export' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* DXF Dışa Aktarma */}
                <div className="border rounded-xl p-6 hover:border-blue-300 transition-colors">
                  <div className="text-4xl mb-3">📐</div>
                  <h3 className="text-lg font-bold text-gray-800">DXF Olarak Dışa Aktar</h3>
                  <p className="text-sm text-gray-500 mt-1 mb-4">
                    AutoCAD ve diğer CAD programlarında açılabilir
                  </p>
                  <button
                    onClick={handleExportDXF}
                    disabled={isLoading}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Hazırlanıyor...' : '📥 DXF İndir'}
                  </button>
                </div>
                
                {/* JSON Dışa Aktarma */}
                <div className="border rounded-xl p-6 hover:border-green-300 transition-colors">
                  <div className="text-4xl mb-3">📄</div>
                  <h3 className="text-lg font-bold text-gray-800">JSON Olarak Dışa Aktar</h3>
                  <p className="text-sm text-gray-500 mt-1 mb-4">
                    FlowCAD projesi olarak kaydet ve paylaş
                  </p>
                  <button
                    onClick={() => {
                      if (selectedProject) {
                        handleExportJSON(selectedProject);
                      } else {
                        // Önce kaydet sonra dışa aktar
                        handleSave();
                      }
                    }}
                    disabled={isLoading}
                    className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    📥 JSON İndir
                  </button>
                </div>
              </div>
              
              {/* Dışa Aktarma Bilgileri */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-3">📊 Dışa Aktarılacak Veriler</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="bg-white rounded p-3 text-center">
                    <div className="text-xl font-bold text-blue-600">{pipes.length}</div>
                    <div className="text-gray-500">Boru</div>
                  </div>
                  <div className="bg-white rounded p-3 text-center">
                    <div className="text-xl font-bold text-green-600">{components.length}</div>
                    <div className="text-gray-500">Cihaz</div>
                  </div>
                  <div className="bg-white rounded p-3 text-center">
                    <div className="text-xl font-bold text-orange-600">
                      {pipes.reduce((sum, p) => sum + p.length, 0).toFixed(1)}m
                    </div>
                    <div className="text-gray-500">Uzunluk</div>
                  </div>
                  <div className="bg-white rounded p-3 text-center">
                    <div className="text-xl font-bold text-purple-600">
                      {dxfData?.entities.length || 0}
                    </div>
                    <div className="text-gray-500">DXF Entity</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer - Storage Info */}
        <div className="border-t p-3 bg-gray-50 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <span>💾</span>
            <span>Depolama: {(storageInfo.used / 1024).toFixed(1)} KB kullanıldı</span>
          </div>
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${usedPercentage > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min(usedPercentage, 100)}%` }}
            />
          </div>
          <div className="text-gray-500">
            {projects.length} proje
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSaveDialog;
