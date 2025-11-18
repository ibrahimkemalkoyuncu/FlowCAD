import axios from 'axios';
import type { Project, Component, Material } from '../types';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'https://localhost:7121'}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // window.location.href = '/login'; // İsterseniz ekleyin
    }
    return Promise.reject(error);
  }
);

// Projects API
export const projectsApi = {
  getAll: () => api.get<Project[]>('/projects'),
  getById: (id: number) => api.get<Project>(`/projects/${id}`),
  create: (data: { name: string; description: string }) => 
    api.post<Project>('/projects', data),
  update: (id: number, data: Partial<Project>) => 
    api.put<Project>(`/projects/${id}`, data),
  delete: (id: number) => api.delete(`/projects/${id}`),
  getMaterialList: (id: number) => 
    api.get<any>(`/projects/${id}/material-list`),
};

// Components API - ✅ Artık doğru Component type'ı kullanılıyor
export const componentsApi = {
  getAll: () => api.get<Component[]>('/components'),
  getByType: (type: string) => api.get<Component[]>(`/components/type/${type}`),
};

// Materials API - ✅ Artık doğru Material type'ı kullanılıyor
export const materialsApi = {
  getAll: () => api.get<Material[]>('/materials'),
  getByType: (type: string) => api.get<Material[]>(`/materials/type/${type}`),
};

export default api;