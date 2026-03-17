import axios from 'axios';

const api = axios.create({
<<<<<<< Updated upstream
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    headers: {
          'Content-Type': 'application/json',
    },
=======
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
>>>>>>> Stashed changes
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
          config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
