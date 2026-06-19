import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// lưu access token trong ram
let inMemoryToken = null;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // QUAN TRỌNG: Để gửi cookies (refresh token)
});

// AuthContext/AuthService cập nhật token vào đây
let refreshTimer = null;

export const setAuthToken = (token) => {
  inMemoryToken = token;
  
  // Thiết lập auto-refresh sau 13 phút (trước khi token hết hạn 15 phút)
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }
  
  if (token) {
    refreshTimer = setTimeout(async () => {
      try {
        const { authService } = await import('./authService');
        const data = await authService.refreshToken();
        if (data && data.token) {
          const rawToken = data.token.replace('Bearer ', '');
          setAuthToken(rawToken);
        }
      } catch (error) {
        console.error('Auto-refresh failed:', error);
      }
    }, 13 * 60 * 1000); // 13 phút
  }
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (inMemoryToken) {
      config.headers.Authorization = `Bearer ${inMemoryToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - xử lý token hết hạn (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest.url.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (originalRequest.url.includes('/auth/login')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Thử làm mới token
      try {
        // Sử dụng dynamic import để tránh vòng lặp phụ thuộc
        const { authService } = await import('./authService');
        const data = await authService.refreshToken();
        if (data && data.token) {
          // Cập nhật token mới
          const rawToken = data.token.replace('Bearer ', '');
          setAuthToken(rawToken);
          originalRequest.headers.Authorization = `Bearer ${rawToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Nếu làm mới token thất bại, chuyển hướng đến trang đăng nhập
          const { authService } = await import('./authService');
          await authService.logout();
          return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;