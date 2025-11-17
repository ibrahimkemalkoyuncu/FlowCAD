import axios from 'axios';
import type { Component } from 'react';
import type { Material } from 'three';
import type { Project } from '../types'; // ve src/types/index.ts içinde export { Project } from './Project'


const API_BASE_URL = 'https://localhost:7121/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

// Components API
export const componentsApi = {
  getAll: () => api.get<Component[]>('/components'),
  getByType: (type: string) => api.get<Component[]>(`/components/type/${type}`),
};

// Materials API
export const materialsApi = {
  getAll: () => api.get<Material[]>('/materials'),
  getByType: (type: string) => api.get<Material[]>(`/materials/type/${type}`),
};

export default api;
