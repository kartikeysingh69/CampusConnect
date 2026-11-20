// src/services/api.js — API service layer (backend se baat karta hai)
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Har request me JWT token attach karo (agar logged in hai)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Auth APIs ----
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);

// ---- Jobs APIs ----
export const getJobs = () => API.get('/jobs');
export const getJobById = (id) => API.get(`/jobs/${id}`);
export const createJob = (data) => API.post('/jobs', data);
export const closeJob = (id) => API.patch(`/jobs/${id}/close`);

// ---- Applications APIs ----
export const applyForJob = (job_id) => API.post('/applications', { job_id });
export const getMyApplications = () => API.get('/applications/my');
export const getAllApplications = () => API.get('/applications');
export const updateApplicationStatus = (id, status) =>
  API.patch(`/applications/${id}/status`, { status });

// ---- Profile APIs ----
export const getProfile = () => API.get('/profile');
export const updateProfile = (data) => API.put('/profile', data);

// ---- Stats API ----
export const getStats = () => API.get('/stats');

export default API;
