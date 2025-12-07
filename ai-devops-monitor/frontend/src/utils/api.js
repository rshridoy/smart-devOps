import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// API endpoints
export const logsAPI = {
  getAll: (params) => api.get('/logs/', { params }),
  search: (query, limit = 50) => api.get('/logs/search', { params: { query, limit } }),
  create: (log) => api.post('/logs/', log),
};

export const analysisAPI = {
  getAnomalies: (limit = 100) => api.get('/analysis/anomalies', { params: { limit } }),
  predict: (service) => api.get('/analysis/predict', { params: { service } }),
  performRCA: (logIds, context = '') => api.post('/analysis/rca', { log_ids: logIds, context }),
  batchAnalyze: () => api.post('/analysis/batch-analyze'),
};

export const alertsAPI = {
  sendTest: () => api.post('/alerts/test'),
  send: (alert) => api.post('/alerts/send', alert),
  sendAnomaly: (logId, score) => api.post('/alerts/anomaly', null, { params: { log_id: logId, anomaly_score: score } }),
  sendFailure: (service, probability) => api.post('/alerts/failure', null, { params: { service, probability } }),
};

export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
