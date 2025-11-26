// ============================================
// PROJECT SELECTOR - Proje Seçici Modal
// Konum: frontend/src/components/ProjectSelector.tsx
// Editor içinden proje açmak için kullanılır
// ============================================

import React, { useEffect, useState } from 'react';
import { projectsApi } from '../services/api';
import type { Project } from '../types';

// ============================================
// INTERFACE - Component Props
// ============================================

interface ProjectSelectorProps {
  onClose: () => void;
  onSelect: (project: Project) => void;
}

// ============================================
// PROJECT SELECTOR COMPONENT
// ============================================

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({ onClose, onSelect }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // LIFECYCLE - Component Mount
  // ============================================

  useEffect(() => {
    loadProjects();
  }, []);

  // ============================================
  // API CALL - Projeleri Yükle
  // ============================================

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectsApi.getAll();
      setProjects(response.data || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Projeler yüklenirken bir hata oluştu.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // EVENT HANDLERS
  // ============================================

  const handleProjectSelect = (project: Project) => {
    onSelect(project);
    onClose();
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📂</span>
            <div>
              <h2 className="text-xl font-bold">Proje Aç</h2>
              <p className="text-sm text-blue-100">Açmak istediğiniz projeyi seçin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            title="Kapat"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Projeler yükleniyor...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Uyarı</h3>
                  <p className="mt-1 text-sm text-yellow-700">{error}</p>
                  <p className="mt-2 text-xs text-yellow-600">
                    API bağlantısı kurulamadı. Proje yüklenemedi.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && projects.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Henüz proje yok
              </h3>
              <p className="text-gray-500 mb-6">
                Açılacak proje bulunamadı
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Kapat
              </button>
            </div>
          )}

          {/* Projects Grid */}
          {!loading && projects.length > 0 && (
            <div className="grid gap-4 max-h-[50vh] overflow-y-auto">
              {projects.map(project => (
                <div 
                  key={project.id}
                  className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => handleProjectSelect(project)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-3xl">📁</div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                            {project.name}
                          </h3>
                          {project.description && (
                            <p className="text-gray-600 text-sm mt-1">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      <div>
                        📅 {new Date(project.updatedAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="mt-1 text-blue-600 group-hover:text-blue-700 font-medium">
                        Açmak için tıklayın →
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSelector;
