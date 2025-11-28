// src/api/axios.js
import axios from 'axios';
import Cookies from 'js-cookie';

// Variabel ini akan menyimpan token di dalam modul, terisolasi dari state React
let internalAccessToken = null;

// Fungsi ini diekspor agar AuthContext bisa mengatur token awal saat login/logout
export const setAuthToken = (token) => {
  internalAccessToken = token;
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  withCredentials: true,
});

let refreshTokenPromise = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!refreshTokenPromise) {
        refreshTokenPromise = new Promise((resolve, reject) => {
          axios.post(`${apiClient.defaults.baseURL}/auth/token/refresh/`, {}, {
            withCredentials: true,
            headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
          })
          .then(res => {
            const { access } = res.data;
            setAuthToken(access); // Perbarui token internal
            resolve(access);
          })
          .catch(err => {
            localStorage.removeItem('user');
            window.location.href = '/login';
            reject(err);
          })
          .finally(() => {
            refreshTokenPromise = null;
          });
        });
      }

      return refreshTokenPromise.then(access => {
        // Gunakan token baru yang sudah disimpan di header default
        return apiClient(originalRequest);
      });
    }
    
    return Promise.reject(error);
  }
);

apiClient.interceptors.request.use(config => {
    const csrfToken = Cookies.get('csrftoken');
    if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
});

export default apiClient;