// ============================================
// PROJECT LIST - Proje Listesi Bileşeni
// Konum: frontend/src/components/ProjectList.tsx
// Kullanıcının projelerini listeler
// Responsive ve Mobil Uyumlu Tasarım
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl">🔧</span>
            </div>
          </div>
          <p className="mt-6 text-gray-600 font-medium text-sm sm:text-base">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER - Main UI
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-x-hidden">
      
      {/* ============================================
          HEADER - Responsive Navigation
          ============================================ */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg sm:text-xl font-bold">FC</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  FlowCAD
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                  Profesyonel Tesisat Çizim Uygulaması
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={handleNewProject}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 flex items-center gap-2"
              >
                <span className="text-lg">➕</span>
                <span>Yeni Proje</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={mobileMenuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className="text-2xl" aria-hidden="true">{mobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div 
              id="mobile-menu"
              className="md:hidden py-4 border-t border-gray-100 animate-in slide-in-from-top duration-200"
            >
              <button
                onClick={() => {
                  handleNewProject();
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg flex items-center justify-center gap-2"
              >
                <span className="text-lg" aria-hidden="true">➕</span>
                <span>Yeni Proje Oluştur</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ============================================
          HERO SECTION - Welcome Banner
          ============================================ */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="text-center">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
            
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Hoş Geldiniz! 👋
              </h2>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
                FlowCAD ile profesyonel tesisat projelerinizi kolayca çizin, 
                düzenleyin ve yönetin.
              </p>

              {/* Feature Cards - Mobile Horizontal Scroll */}
              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 px-4 sm:px-0 sm:justify-center sm:flex-wrap snap-x snap-mandatory scrollbar-hide">
                <div className="flex-shrink-0 snap-center bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-lg border border-white/50 w-[140px] sm:w-auto">
                  <div className="text-3xl sm:text-4xl mb-2">📐</div>
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">DXF Desteği</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">AutoCAD uyumlu</p>
                </div>
                <div className="flex-shrink-0 snap-center bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-lg border border-white/50 w-[140px] sm:w-auto">
                  <div className="text-3xl sm:text-4xl mb-2">🔧</div>
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Kolay Çizim</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Sezgisel araçlar</p>
                </div>
                <div className="flex-shrink-0 snap-center bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-lg border border-white/50 w-[140px] sm:w-auto">
                  <div className="text-3xl sm:text-4xl mb-2">📊</div>
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Raporlama</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">PDF & Excel</p>
                </div>
                <div className="flex-shrink-0 snap-center bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-lg border border-white/50 w-[140px] sm:w-auto">
                  <div className="text-3xl sm:text-4xl mb-2">🎯</div>
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Snap Sistemi</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Hassas çizim</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          MAIN CONTENT - Projects Section
          ============================================ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        
        {/* Error State */}
        {error && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">⚠️</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-amber-800">Bağlantı Uyarısı</h3>
                <p className="mt-1 text-sm text-amber-700">{error}</p>
                <p className="mt-2 text-xs text-amber-600">
                  API bağlantısı kurulamadı. Yine de yeni proje oluşturabilirsiniz.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">📁 Projelerim</h2>
            <p className="text-sm text-gray-500 mt-1">
              {projects.length > 0 
                ? `${projects.length} proje bulundu` 
                : 'Henüz proje oluşturulmadı'}
            </p>
          </div>
          
          {/* Mobile New Project Button */}
          <button
            onClick={handleNewProject}
            className="md:hidden w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg flex items-center justify-center gap-2"
          >
            <span>➕</span>
            <span>Yeni Proje</span>
          </button>
        </div>

        {/* Empty State */}
        {projects.length === 0 && !error && (
          <div className="text-center py-12 sm:py-16 lg:py-20 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200">
            <div className="max-w-md mx-auto px-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-4xl sm:text-5xl">📋</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Henüz proje yok
              </h3>
              <p className="text-gray-500 text-sm sm:text-base mb-6">
                İlk tesisat projenizi oluşturarak FlowCAD'in güçlü özelliklerini keşfedin.
              </p>
              <button
                onClick={handleNewProject}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all font-medium shadow-lg shadow-blue-500/25 inline-flex items-center gap-2"
              >
                <span>🚀</span>
                <span>İlk Projeyi Oluştur</span>
              </button>
            </div>
          </div>
        )}

        {/* Projects Grid - Responsive */}
        {projects.length > 0 && (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => (
              <div 
                key={project.id}
                className="group bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-5 sm:p-6 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all duration-300 cursor-pointer active:scale-[0.98]"
                onClick={() => onSelect(project)}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl sm:text-3xl">📁</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 sm:opacity-100"
                    title="Projeyi Sil"
                  >
                    <span className="text-lg">🗑️</span>
                  </button>
                </div>
                
                {/* Card Content */}
                <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {project.name}
                </h3>
                
                <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                  {project.description || 'Açıklama eklenmemiş'}
                </p>
                
                {/* Card Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>📅</span>
                    <span>
                      {new Date(project.updatedAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Aç</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ============================================
          FOOTER - Simple Footer
          ============================================ */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p className="text-sm text-gray-500">
              © 2024 FlowCAD - Tesisat Çizim Uygulaması
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <span>🔧</span>
                <span>v1.0</span>
              </span>
              <span className="hidden sm:inline">|</span>
              <span className="flex items-center gap-1">
                <span>💻</span>
                <span>Made with ❤️</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProjectList;