import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api', // Use proxy in development
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Retry function for network errors
const retryRequest = async (config: any, retryCount = 0): Promise<any> => {
  try {
    return await api(config);
  } catch (error: any) {
    // Only retry on network errors and if we haven't exceeded max retries
    if (!error.response && retryCount < MAX_RETRIES) {
      console.log(`Retrying request (${retryCount + 1}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
      return retryRequest(config, retryCount + 1);
    }
    throw error;
  }
};

// Request interceptor to add auth token
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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors with retry
    if (!error.response) {
      console.error('Network error:', error.message);
      
      // Retry the request if it's not a retry attempt already
      if (!originalRequest._retry && originalRequest.method !== 'get') {
        originalRequest._retry = true;
        return retryRequest(originalRequest);
      }
      
      // Don't redirect on network errors, just reject
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token to refresh');
        }

        // Try to refresh the token
        const response = await api.post('/auth/refresh');
        const { token: newToken } = response.data;
        
        // Update token in localStorage
        localStorage.setItem('token', newToken);
        
        // Update axios default header
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        // Process queued requests
        processQueue(null, newToken);
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, process queue with error
        processQueue(refreshError, null);
        
        // Remove invalid token and redirect to login
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        
        // Only redirect if we're not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api; 