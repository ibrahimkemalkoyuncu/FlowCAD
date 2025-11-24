/**
 * FlowCAD API Service
 * 
 * Bu modül, backend API ile iletişim kurmak için kullanılan tüm servisleri içerir.
 * Axios tabanlı HTTP istekleri, otomatik token yönetimi ve hata yakalama özellikleri sunar.
 * 
 * @module services/api
 */

import axios from 'axios';
import type { Project, Component, Material } from '../types';
import toast from 'react-hot-toast';

/**
 * API Base URL - Environment değişkeninden veya default değerden alınır
 */
const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'https://localhost:7121'}/api`;

/**
 * Axios instance - Tüm API istekleri için kullanılır
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * JWT token interceptor
 * Her istekten önce localStorage'dan token'ı alır ve Authorization header'ına ekler
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Error interceptor
 * HTTP hatalarını yakalar ve kullanıcıya uygun mesajları gösterir
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Sunucu hatası
      switch (error.response.status) {
        case 401:
          toast.error('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          toast.error('Bu işlem için yetkiniz yok.');
          break;
        case 404:
          toast.error('İstenen kaynak bulunamadı.');
          break;
        case 500:
          toast.error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
          break;
        default:
          toast.error(error.response.data?.message || 'Bir hata oluştu.');
      }
    } else if (error.request) {
      // Network hatası
      toast.error('Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.');
    } else {
      toast.error('Beklenmeyen bir hata oluştu.');
    }
    
    return Promise.reject(error);
  }
);

/**
 * Projects API
 * 
 * Proje yönetimi için kullanılan API endpoint'leri
 * 
 * @namespace
 * @property {Function} getAll - Tüm projeleri getirir
 * @property {Function} getById - ID'ye göre proje getirir
 * @property {Function} create - Yeni proje oluşturur
 * @property {Function} update - Var olan projeyi günceller
 * @property {Function} delete - Projeyi siler
 * @property {Function} getMaterialList - Proje malzeme listesini getirir
 */
export const projectsApi = {
  /**
   * Tüm projeleri getirir
   * @returns {Promise<AxiosResponse<Project[]>>} Proje listesi
   */
  getAll: () => api.get<Project[]>('/projects'),
  
  /**
   * ID'ye göre tek bir proje getirir
   * @param {number} id - Proje ID'si
   * @returns {Promise<AxiosResponse<Project>>} Proje detayları
   */
  getById: (id: number) => api.get<Project>(`/projects/${id}`),
  
  /**
   * Yeni proje oluşturur
   * @param {Object} data - Proje verileri
   * @param {string} data.name - Proje adı
   * @param {string} data.description - Proje açıklaması
   * @returns {Promise<AxiosResponse<Project>>} Oluşturulan proje
   */
  create: (data: { name: string; description: string }) => 
    api.post<Project>('/projects', data),
  
  /**
   * Var olan projeyi günceller
   * @param {number} id - Proje ID'si
   * @param {Partial<Project>} data - Güncellenecek alanlar
   * @returns {Promise<AxiosResponse<Project>>} Güncellenen proje
   */
  update: (id: number, data: Partial<Project>) => 
    api.put<Project>(`/projects/${id}`, data),
  
  /**
   * Projeyi siler
   * @param {number} id - Silinecek proje ID'si
   * @returns {Promise<AxiosResponse<void>>} Silme işlemi sonucu
   */
  delete: (id: number) => api.delete(`/projects/${id}`),
  
  /**
   * Proje malzeme listesini getirir
   * @param {number} id - Proje ID'si
   * @returns {Promise<AxiosResponse<any>>} Malzeme listesi
   */
  getMaterialList: (id: number) => 
    api.get<any>(`/projects/${id}/material-list`),
};

/**
 * Components API
 * 
 * Tesisat bileşenleri (vana, sayaç vb.) için API endpoint'leri
 * 
 * @namespace
 */
export const componentsApi = {
  /**
   * Tüm bileşenleri getirir
   * @returns {Promise<AxiosResponse<Component[]>>} Bileşen listesi
   */
  getAll: () => api.get<Component[]>('/components'),
  
  /**
   * Tipe göre bileşenleri filtreler
   * @param {string} type - Bileşen tipi (valve, meter, boiler vb.)
   * @returns {Promise<AxiosResponse<Component[]>>} Filtrelenmiş bileşen listesi
   */
  getByType: (type: string) => api.get<Component[]>(`/components/type/${type}`),
};

/**
 * Materials API
 * 
 * Malzeme bilgileri için API endpoint'leri
 * 
 * @namespace
 */
export const materialsApi = {
  /**
   * Tüm malzemeleri getirir
   * @returns {Promise<AxiosResponse<Material[]>>} Malzeme listesi
   */
  getAll: () => api.get<Material[]>('/materials'),
  
  /**
   * Tipe göre malzemeleri filtreler
   * @param {string} type - Malzeme tipi
   * @returns {Promise<AxiosResponse<Material[]>>} Filtrelenmiş malzeme listesi
   */
  getByType: (type: string) => api.get<Material[]>(`/materials/type/${type}`),
};

export default api;