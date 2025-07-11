import axios from 'axios';

// Use window.location.hostname to dynamically get the current host
export const API_BASE_URL = `http://${window.location.hostname}:8000`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,  // Changed to false to fix CORS issues
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // 确保DELETE请求有正确的CORS头
  if (config.method?.toLowerCase() === 'delete') {
    if (config.headers) {
      config.headers['Access-Control-Allow-Methods'] = 'DELETE, OPTIONS';
      config.headers['Access-Control-Allow-Origin'] = '*';
    }
  }
  
  return config;
}, (error) => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log('Authentication error, redirecting to login');
      localStorage.removeItem('access_token');
      localStorage.removeItem('username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 专门用于DELETE请求的辅助函数
export const deleteRequest = async (url: string, token?: string) => {
  const authToken = token || localStorage.getItem('access_token');
  if (!authToken) {
    throw new Error('No authentication token found');
  }
  
  try {
    const response = await api.delete(`${url}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { API_BASE_URL as SERVER_URL };