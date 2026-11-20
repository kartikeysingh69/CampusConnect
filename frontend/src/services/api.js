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
export const getJobs = (params = {}) => API.get('/jobs', { params });
export const getAllAdminJobs = () => API.get('/jobs?all=true');
export const getJobById = (id) => API.get(`/jobs/${id}`);
export const createJob = (data) => API.post('/jobs', data);
export const updateJob = (id, data) => API.put(`/jobs/${id}`, data);
export const closeJob = (id) => API.patch(`/jobs/${id}/close`);
export const toggleJobStatus = (id) => API.patch(`/jobs/${id}/toggle-status`);
export const deleteJob = (id) => API.delete(`/jobs/${id}`);

// ---- Applications APIs ----
export const applyForJob = (job_id) => API.post('/applications', { job_id });
export const getMyApplications = () => API.get('/applications/my');
export const getAllApplications = () => API.get('/applications');
export const updateApplicationStatus = (id, status) =>
  API.patch(`/applications/${id}/status`, { status });
export const bulkUpdateApplicationStatus = (ids, status) =>
  API.patch('/applications/bulk-status', { ids, status });
export const withdrawApplication = (id) => API.delete(`/applications/${id}`);

// ---- Profile APIs ----
export const getProfile = () => API.get('/profile');
export const updateProfile = (data) => API.put('/profile', data);
export const uploadResume = (formData) =>
  API.post('/profile/upload-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateResumeUrl = (resume_url) =>
  API.put('/profile/resume-url', { resume_url });
export const deleteResume = () => API.delete('/profile/resume');

// ---- Stats API ----
export const getStats = () => API.get('/stats');

export default API;
