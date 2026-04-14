// services/frontend/FrontAPI.ts
import axios, { AxiosError, AxiosInstance, AxiosHeaders } from 'axios';
import { removeAllState } from '@/utils/Localstorage';
import { getAuthToken, getRefreshToken, getTokenType } from './AuthService';

export const api: AxiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_BASE_API_URL}/api`,
  timeout: 1000000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 避免同時多個 401 觸發多次 refresh
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

const resolveQueue = (token: string | null) => {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (!token) return config;

    const tokenType = getTokenType() || 'Bearer';

    const headers = AxiosHeaders.from(config.headers || {});
    headers.set('Authorization', `${tokenType} ${token}`);
    config.headers = headers;

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest: any = error.config;

    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    const url = originalRequest?.url || '';
    if (url.includes('/auth/refresh')) {
      removeAllState();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (originalRequest?._retry) {
      removeAllState();
      window.location.href = '/login';
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    const rt = getRefreshToken();
    if (!rt) {
      removeAllState();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // 若正在 refresh，排隊等待 token
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }

          const hdrs = AxiosHeaders.from(originalRequest.headers || {});
          hdrs.set('Authorization', `Bearer ${newToken}`);
          originalRequest.headers = hdrs;

          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshRes = await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/api/auth/refresh`,
        { refreshToken: rt },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const payload = refreshRes.data; // ApiResponse
      if (!payload?.success) {
        throw new Error(payload?.error?.message || 'refresh failed');
      }

      const newAccessToken = payload?.data?.accessToken;
      if (!newAccessToken) throw new Error('no accessToken');

      // Bug Fix #1+#2: Use authStore.setAuth() instead of manual localStorage writes.
      // accessToken goes to Pinia memory only; refreshToken + user go to localStorage.
      const { useAuthStore } = await import('@/stores/useAuthStore');
      const authStore = useAuthStore();
      authStore.setAuth(payload.data);

      resolveQueue(newAccessToken);

      // Retry the original request with the new token
      const newTokenType = payload.data?.tokenType || 'Bearer';
      const hdrs = AxiosHeaders.from(originalRequest.headers || {});
      hdrs.set('Authorization', `${newTokenType} ${newAccessToken}`);
      originalRequest.headers = hdrs;

      return api(originalRequest);
    } catch (err) {
      resolveQueue(null);
      // Use authStore.logout() to cleanly clear Pinia memory + localStorage
      const { useAuthStore } = await import('@/stores/useAuthStore');
      useAuthStore().logout();
      window.location.href = '/login';
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);
