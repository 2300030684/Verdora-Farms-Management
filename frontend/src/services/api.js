import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Spring Boot backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the JWT token to requests
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers['Authorization'] = 'Bearer ' + user.token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
