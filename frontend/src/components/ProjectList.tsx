import React, { useEffect, useState } from 'react';
import { projectsApi } from '../services/api';
import type { Project } from '../types';

export const ProjectList: React.FC<{ onSelect: (project: Project) => void }> = ({ 
  onSelect 
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await projectsApi.getAll();
      setProjects(response.data);
    } catch (error) {
        console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu projeyi silmek istediğinizden emin misiniz?')) return;
    
    try {
      await projectsApi.delete(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  if (loading) {
    return <div className="p-4">Yükleniyor...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Projelerim</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map(project => (
          <div 
            key={project.id}
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onSelect(project)}
          >
            <h3 className="font-semibold text-lg">{project.name}</h3>
            <p className="text-gray-600 text-sm mt-2">{project.description}</p>
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-gray-500">
                {new Date(project.updatedAt).toLocaleDateString('tr-TR')}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(project.id);
                }}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};