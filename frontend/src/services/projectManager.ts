// ============================================
// PROJECT MANAGER SERVICE - Proje Kaydetme/Yükleme Servisi
// Konum: frontend/src/services/projectManager.ts
// Projeleri LocalStorage'a kaydeder ve yükler
// ============================================

import type { ParsedDWG } from '../types/dwg';

// ============================================
// INTERFACE - Proje Tipleri
// ============================================

export interface SavedProject {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  data: {
    pipes: SavedPipe[];
    components: SavedComponent[];
    dxfData?: ParsedDWG;
    snapSettings?: Record<string, unknown>;
    viewSettings?: ViewSettings;
  };
  metadata: {
    totalPipes: number;
    totalComponents: number;
    totalLength: number;
  };
}

export interface SavedPipe {
  id: string;
  startPoint: { x: number; y: number; z: number };
  endPoint: { x: number; y: number; z: number };
  diameter: string;
  length: number;
  color?: number;
  layer?: string;
}

export interface SavedComponent {
  id: string;
  type: string;
  position: { x: number; y: number; z: number };
  rotation: [number, number, number];
  scale?: number;
  properties?: Record<string, unknown>;
}

export interface ViewSettings {
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  gridVisible: boolean;
  snapEnabled: boolean;
}

// ============================================
// CONSTANTS
// ============================================

const STORAGE_KEY = 'flowcad_projects';
const CURRENT_PROJECT_KEY = 'flowcad_current_project';
const VERSION = '1.0.0';

// ============================================
// PROJECT MANAGER CLASS
// ============================================

class ProjectManagerService {
  
  // ============================================
  // STORAGE HELPERS
  // ============================================
  
  private getAllProjects(): SavedProject[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      console.error('LocalStorage okunamadı');
      return [];
    }
  }
  
  private saveAllProjects(projects: SavedProject[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error('LocalStorage kaydetme hatası:', error);
      throw new Error('Proje kaydedilemedi. Depolama alanı dolu olabilir.');
    }
  }
  
  // ============================================
  // PROJECT CRUD OPERATIONS
  // ============================================
  
  /**
   * Yeni proje oluşturur veya mevcut projeyi günceller
   */
  saveProject(
    name: string,
    description: string,
    pipes: SavedPipe[],
    components: SavedComponent[],
    dxfData?: ParsedDWG,
    existingId?: string
  ): SavedProject {
    const projects = this.getAllProjects();
    const now = new Date().toISOString();
    
    // Toplam uzunluk hesapla
    const totalLength = pipes.reduce((sum, pipe) => sum + pipe.length, 0);
    
    // Mevcut proje güncelleme
    if (existingId) {
      const index = projects.findIndex(p => p.id === existingId);
      if (index !== -1) {
        const updatedProject: SavedProject = {
          ...projects[index],
          name,
          description,
          updatedAt: now,
          data: {
            pipes,
            components,
            dxfData
          },
          metadata: {
            totalPipes: pipes.length,
            totalComponents: components.length,
            totalLength
          }
        };
        projects[index] = updatedProject;
        this.saveAllProjects(projects);
        this.setCurrentProject(existingId);
        return updatedProject;
      }
    }
    
    // Yeni proje oluşturma
    const newProject: SavedProject = {
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      version: VERSION,
      data: {
        pipes,
        components,
        dxfData
      },
      metadata: {
        totalPipes: pipes.length,
        totalComponents: components.length,
        totalLength
      }
    };
    
    projects.push(newProject);
    this.saveAllProjects(projects);
    this.setCurrentProject(newProject.id);
    
    return newProject;
  }
  
  /**
   * Tüm projeleri listeler
   */
  listProjects(): SavedProject[] {
    return this.getAllProjects().sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }
  
  /**
   * Belirli bir projeyi yükler
   */
  loadProject(id: string): SavedProject | null {
    const projects = this.getAllProjects();
    const project = projects.find(p => p.id === id);
    if (project) {
      this.setCurrentProject(id);
    }
    return project || null;
  }
  
  /**
   * Projeyi siler
   */
  deleteProject(id: string): boolean {
    const projects = this.getAllProjects();
    const index = projects.findIndex(p => p.id === id);
    
    if (index !== -1) {
      projects.splice(index, 1);
      this.saveAllProjects(projects);
      
      // Eğer silinen proje şu anki proje ise, temizle
      if (this.getCurrentProjectId() === id) {
        localStorage.removeItem(CURRENT_PROJECT_KEY);
      }
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Proje adını değiştirir
   */
  renameProject(id: string, newName: string): SavedProject | null {
    const projects = this.getAllProjects();
    const index = projects.findIndex(p => p.id === id);
    
    if (index !== -1) {
      projects[index].name = newName;
      projects[index].updatedAt = new Date().toISOString();
      this.saveAllProjects(projects);
      return projects[index];
    }
    
    return null;
  }
  
  /**
   * Projeyi çoğaltır
   */
  duplicateProject(id: string): SavedProject | null {
    const original = this.loadProject(id);
    if (!original) return null;
    
    return this.saveProject(
      `${original.name} (Kopya)`,
      original.description,
      [...original.data.pipes],
      [...original.data.components],
      original.data.dxfData
    );
  }
  
  // ============================================
  // CURRENT PROJECT TRACKING
  // ============================================
  
  setCurrentProject(id: string): void {
    localStorage.setItem(CURRENT_PROJECT_KEY, id);
  }
  
  getCurrentProjectId(): string | null {
    return localStorage.getItem(CURRENT_PROJECT_KEY);
  }
  
  getCurrentProject(): SavedProject | null {
    const id = this.getCurrentProjectId();
    if (!id) return null;
    return this.loadProject(id);
  }
  
  // ============================================
  // EXPORT / IMPORT
  // ============================================
  
  /**
   * Projeyi JSON dosyası olarak dışa aktarır
   */
  exportProjectAsJSON(id: string): void {
    const project = this.loadProject(id);
    if (!project) {
      throw new Error('Proje bulunamadı');
    }
    
    const json = JSON.stringify(project, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.replace(/[^a-z0-9]/gi, '_')}.flowcad.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
  
  /**
   * JSON dosyasından proje içe aktarır
   */
  async importProjectFromJSON(file: File): Promise<SavedProject> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const imported = JSON.parse(content) as SavedProject;
          
          // Validasyon
          if (!imported.name || !imported.data) {
            throw new Error('Geçersiz proje dosyası');
          }
          
          // Yeni ID ile kaydet (çakışma önleme)
          const savedProject = this.saveProject(
            `${imported.name} (İçe Aktarıldı)`,
            imported.description || '',
            imported.data.pipes || [],
            imported.data.components || [],
            imported.data.dxfData
          );
          
          resolve(savedProject);
        } catch (error) {
          reject(new Error('Dosya okunamadı veya geçersiz format'));
        }
      };
      
      reader.onerror = () => reject(new Error('Dosya okunamadı'));
      reader.readAsText(file);
    });
  }
  
  // ============================================
  // AUTO-SAVE
  // ============================================
  
  /**
   * Otomatik kayıt için mevcut durumu kaydeder
   */
  autoSave(
    pipes: SavedPipe[],
    components: SavedComponent[],
    dxfData?: ParsedDWG
  ): void {
    const currentId = this.getCurrentProjectId();
    const currentProject = currentId ? this.loadProject(currentId) : null;
    
    if (currentProject) {
      // Mevcut projeyi güncelle
      this.saveProject(
        currentProject.name,
        currentProject.description,
        pipes,
        components,
        dxfData,
        currentId ?? undefined
      );
    } else {
      // Geçici proje olarak kaydet
      this.saveProject(
        `Otomatik Kayıt - ${new Date().toLocaleString('tr-TR')}`,
        'Otomatik olarak kaydedildi',
        pipes,
        components,
        dxfData
      );
    }
  }
  
  // ============================================
  // STORAGE INFO
  // ============================================
  
  /**
   * Depolama kullanım bilgisini döndürür
   */
  getStorageInfo(): { used: number; available: number; projectCount: number } {
    const projects = this.getAllProjects();
    const usedBytes = new Blob([JSON.stringify(projects)]).size;
    
    return {
      used: usedBytes,
      available: 5 * 1024 * 1024 - usedBytes, // ~5MB localStorage limit
      projectCount: projects.length
    };
  }
  
  /**
   * Tüm projeleri temizler (dikkatli kullanın!)
   */
  clearAllProjects(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRENT_PROJECT_KEY);
  }
}

export const projectManager = new ProjectManagerService();
