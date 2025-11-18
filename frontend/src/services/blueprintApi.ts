import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'https://localhost:7121'}/api`;

export const blueprintApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(
      `${API_BASE_URL}/blueprint/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          console.log('Upload progress:', percentCompleted);
        }
      }
    );
    
    return response.data;
  },
  
  delete: async (fileName: string) => {
    const response = await axios.delete(
      `${API_BASE_URL}/blueprint/${fileName}`
    );
    return response.data;
  },
  
  list: async () => {
    const response = await axios.get(`${API_BASE_URL}/blueprint/list`);
    return response.data;
  }
};