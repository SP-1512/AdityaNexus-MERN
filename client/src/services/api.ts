import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const registerUser = (data: object) => API.post('/auth/register', data);
export const loginUser = (data: object) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const seedAdmin = () => API.post('/auth/seed-admin');

// Admissions
export const getAdmissions = () => API.get('/admissions');
export const createAdmission = (data: object) => API.post('/admissions', data);
export const updateAdmission = (id: string, data: object) => API.put(`/admissions/${id}`, data);
export const deleteAdmission = (id: string) => API.delete(`/admissions/${id}`);

// AI
export const analyzeAdmission = (admission: object) => API.post('/ai/analyze', { admission });
export const summarizeBatch = (admissions: object[]) => API.post('/ai/summarize', { admissions });
