// ============================================
// PROJECT LIST - Proje Listesi Bileşeni
// Konum: frontend/src/components/ProjectList.tsx
// Kullanıcının projelerini listeler
// ============================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsApi } from '../services/api';
import type { Project } from '../types';

// ============================================
// INTERFACE - Component Props
// ============================================

interface ProjectListProps {
  onSelect: (project: Project) => void;
}

// ============================================
// PROJECT LIST COMPONENT
// ============================================

export const ProjectList: React.FC<ProjectListProps> = ({ onSelect }) => {
  const navigate = useNavigate();
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
      // API yoksa bile devam et
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // EVENT HANDLERS
  // ============================================

  const handleDelete = async (id: number) => {
    if (!confirm('Bu projeyi silmek istediğinizden emin misiniz?')) return;
    
    try {
      await projectsApi.delete(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Proje silinirken bir hata oluştu.');
    }
  };

  const handleNewProject = () => {
    navigate('/editor');
  };

  // ============================================
  // RENDER - Loading State
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER - Main UI
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FlowCAD</h1>
              <p className="mt-1 text-sm text-gray-500">Tesisat Çizim Uygulaması</p>
            </div>
            <button
              onClick={handleNewProject}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm"
            >
              + Yeni Proje
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Uyarı</h3>
                <p className="mt-1 text-sm text-yellow-700">{error}</p>
                <p className="mt-2 text-xs text-yellow-600">
                  API bağlantısı kurulamadı. Yeni proje oluşturabilirsiniz.
                </p>
              </div>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Projelerim</h2>

        {/* Empty State */}
        {projects.length === 0 && !error && (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Henüz proje yok
            </h3>
            <p className="text-gray-500 mb-6">
              İlk projenizi oluşturarak başlayın
            </p>
            <button
              onClick={handleNewProject}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              İlk Projeyi Oluştur
            </button>
          </div>
        )}

        {/* Projects Grid */}
        {projects.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => (
              <div 
                key={project.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
                onClick={() => onSelect(project)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">📁</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project.id);
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Projeyi Sil"
                  >
                    🗑️
                  </button>
                </div>
                
                <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {project.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.description || 'Açıklama yok'}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    📅 {new Date(project.updatedAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectList;