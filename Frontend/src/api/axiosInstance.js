import axios from 'axios';

const isLocalhost = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Di Vercel / server publik, jika VITE_API_URL belum diset, gunakan '/api' agar browser pengunjung tidak menembak ke 127.0.0.1 (ERR_CONNECTION_REFUSED)
const defaultBaseURL = isLocalhost ? 'http://127.0.0.1:8000/api' : '/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultBaseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 4000,
});

// Otomatis sertakan token di setiap request admin
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Tangani 401 (token expired/invalid) — kecuali jika request sedang mencoba login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginRequest = err.config?.url?.includes('/login');
    if (err.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

export default api;
