import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to add JWT token to all requests
API.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('imovies_user');
    if (userInfo) {
      try {
        const { token } = JSON.parse(userInfo);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error('Error parsing stored user auth', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global 401 unauthorized errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional auto-logout on invalid or expired token
      if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/my-bookings')) {
        // localStorage.removeItem('imovies_user');
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;

