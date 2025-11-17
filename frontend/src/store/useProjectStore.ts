import { create } from 'zustand';
import type { Project,Drawing3D, ProjectComponent } from '../types';

interface ProjectState {
  currentProject: Project | null;
  drawings: Drawing3D[];
  components: ProjectComponent[];
  
  setCurrentProject: (project: Project | null) => void;
  addDrawing: (drawing: Drawing3D) => void;
  removeDrawing: (id: string) => void;
  updateDrawing: (id: string, updates: Partial<Drawing3D>) => void;
  addComponent: (component: ProjectComponent) => void;
  removeComponent: (id: number) => void;
  clearProject: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  currentProject: null,
  drawings: [],
  components: [],
  
  setCurrentProject: (project) => set({ currentProject: project }),
  
  addDrawing: (drawing) => set((state) => ({
    drawings: [...state.drawings, drawing]
  })),
  
  removeDrawing: (id) => set((state) => ({
    drawings: state.drawings.filter(d => d.id !== id)
  })),
  
  updateDrawing: (id, updates) => set((state) => ({
    drawings: state.drawings.map(d => 
      d.id === id ? { ...d, ...updates } : d
    )
  })),
  
  addComponent: (component) => set((state) => ({
    components: [...state.components, component]
  })),
  
  removeComponent: (id) => set((state) => ({
    components: state.components.filter(c => c.id !== id)
  })),
  
  clearProject: () => set({
    currentProject: null,
    drawings: [],
    components: []
  }),
}));