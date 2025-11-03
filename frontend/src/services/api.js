// frontend/src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  register: async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Media Services
export const mediaService = {
  uploadMedia: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('media', file);

    const response = await api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },

  getMedia: async (page = 1, limit = 12, type = '') => {
    const params = { page, limit };
    if (type) params.type = type;
    const response = await api.get('/media', { params });
    return response.data;
  },

  deleteMedia: async (id) => {
    const response = await api.delete(`/media/${id}`);
    return response.data;
  },

  getMediaStats: async () => {
    const response = await api.get('/media/stats');
    return response.data;
  },
};

export const getMediaUrl = (fileUrl) => {
  if (fileUrl.startsWith('http')) {
    return fileUrl;
  }
  return `http://localhost:5000/${fileUrl}`;
};

export default api;