import axios from 'axios';
import Cookies from 'js-cookie';

// Variabel ini akan menyimpan token di dalam modul
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
  baseURL: import.meta.env.VITE_API_BASE_URL, 
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
          // Kita tidak perlu header CSRF untuk refresh token jika endpointnya @csrf_exempt
          // Tapi jika butuh, kita asumsikan sudah ada di defaults.headers
          axios.post(`${apiClient.defaults.baseURL}/auth/token/refresh/`, {}, {
            withCredentials: true,
            // Header X-CSRFToken akan otomatis ikut jika sudah di-set di defaults
             headers: {
                'X-CSRFToken': apiClient.defaults.headers.common['X-CSRFToken']
             }
          })
          .then(res => {
            const { access } = res.data;
            setAuthToken(access); 
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
        return apiClient(originalRequest);
      });
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;