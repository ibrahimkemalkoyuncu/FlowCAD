// ============================================
// PROJECT LIST - Proje Listesi Bileşeni
// Konum: frontend/src/components/ProjectList.tsx
// Apple-Inspired Minimal Design
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
  // RENDER - Loading State (Apple Style)
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gray-200 border-t-[#0071e3] rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-[#86868b] text-[15px] font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER - Main UI (Apple Style)
  // ============================================

  return (
    <div className="min-h-screen bg-[#fafafa]">
      
      {/* ============================================
          HEADER - Apple-Style Navigation
          ============================================ */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-black/5 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <span className="text-[24px] font-semibold tracking-tight text-[#1d1d1f]">
                FlowCAD
              </span>
            </div>

            {/* Action Button */}
            <button
              onClick={handleNewProject}
              className="px-5 py-2 bg-[#0071e3] text-white text-[14px] font-medium rounded-full hover:bg-[#0077ed] transition-all duration-200"
            >
              Yeni Proje
            </button>
          </div>
        </div>
      </header>

      {/* ============================================
          HERO - Minimal Welcome
          ============================================ */}
      <section className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-[40px] sm:text-[56px] font-semibold tracking-tight text-[#1d1d1f] leading-tight">
            Profesyonel tesisat
            <br />
            <span className="bg-gradient-to-r from-[#0071e3] to-[#5856d6] bg-clip-text text-transparent">
              çizim deneyimi.
            </span>
          </h1>
          <p className="mt-6 text-[17px] sm:text-[21px] text-[#86868b] max-w-2xl mx-auto leading-relaxed">
            DXF dosyalarını açın, düzenleyin ve kaydedin. 
            AutoCAD uyumlu, modern ve hızlı.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleNewProject}
              className="px-8 py-3.5 bg-[#0071e3] text-white text-[17px] font-medium rounded-full hover:bg-[#0077ed] transition-all duration-200"
            >
              Başla
            </button>
            <a
              href="#projeler"
              className="px-8 py-3.5 text-[#0071e3] text-[17px] font-medium rounded-full hover:bg-[#0071e3]/5 transition-all duration-200"
            >
              Projelerime Git →
            </a>
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURES - Simple Grid
          ============================================ */}
      <section className="pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: '📐', title: 'DXF Desteği' },
              { icon: '✏️', title: 'Kolay Düzenleme' },
              { icon: '📊', title: 'Raporlama' },
              { icon: '💾', title: 'Otomatik Kayıt' },
            ].map((feature, i) => (
              <div 
                key={i}
                className="bg-white rounded-2xl p-6 text-center border border-black/5 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <div className="text-[15px] font-medium text-[#1d1d1f]">{feature.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          PROJECTS SECTION
          ============================================ */}
      <main id="projeler" className="max-w-5xl mx-auto px-6 pb-16 sm:pb-24">
        
        {/* Error State */}
        {error && (
          <div className="mb-8 bg-[#fff8e5] rounded-2xl p-5 border border-[#f5d565]">
            <p className="text-[15px] text-[#946800]">{error}</p>
          </div>
        )}

        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-[28px] font-semibold text-[#1d1d1f]">Projelerim</h2>
          <p className="text-[15px] text-[#86868b] mt-1">
            {projects.length > 0 
              ? `${projects.length} proje` 
              : 'Henüz proje yok'}
          </p>
        </div>

        {/* Empty State */}
        {projects.length === 0 && !error && (
          <div className="text-center py-20 bg-white rounded-3xl border border-black/5">
            <div className="w-16 h-16 bg-[#f5f5f7] rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📁</span>
            </div>
            <h3 className="text-[21px] font-semibold text-[#1d1d1f] mb-2">
              Proje bulunamadı
            </h3>
            <p className="text-[15px] text-[#86868b] mb-8 max-w-sm mx-auto">
              İlk projenizi oluşturarak başlayın.
            </p>
            <button
              onClick={handleNewProject}
              className="px-6 py-3 bg-[#0071e3] text-white text-[15px] font-medium rounded-full hover:bg-[#0077ed] transition-all duration-200"
            >
              Proje Oluştur
            </button>
          </div>
        )}

        {/* Projects Grid */}
        {projects.length > 0 && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => (
              <div 
                key={project.id}
                className="group bg-white rounded-2xl p-6 border border-black/5 hover:shadow-xl hover:shadow-black/5 transition-all duration-300 cursor-pointer"
                onClick={() => onSelect(project)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0071e3] to-[#5856d6] rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">📁</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project.id);
                    }}
                    className="p-2 text-[#86868b] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
                
                <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-1 truncate">
                  {project.name}
                </h3>
                
                <p className="text-[13px] text-[#86868b] line-clamp-2 min-h-[2rem]">
                  {project.description || 'Açıklama yok'}
                </p>
                
                <div className="mt-4 pt-4 border-t border-black/5 text-[13px] text-[#86868b]">
                  {new Date(project.updatedAt).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ============================================
          FOOTER - Minimal
          ============================================ */}
      <footer className="border-t border-black/5 bg-[#f5f5f7]">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[12px] text-[#86868b]">
              © 2024 FlowCAD
            </p>
            <p className="text-[12px] text-[#86868b]">
              v1.0 • AutoCAD Uyumlu
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProjectList;