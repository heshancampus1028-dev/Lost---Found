import axios from 'axios';

// Backend base URL defined in one place
// (replace with an environment variable when deploying to production)
const API_BASE_URL = 'http://localhost:5000/api';
const SERVER_ROOT_URL = 'http://localhost:5000'; // without /api, used for static file (image) links

const api = axios.create({
  baseURL: API_BASE_URL
});

// item.images stores just the filename (e.g. "169999-photo.jpg"), so build the full URL here
export function getImageUrl(filename) {
  return `${SERVER_ROOT_URL}/uploads/${filename}`;
}

// Attach the auth token to every outgoing request, if one is stored
// (needed for routes that require the user to be logged in)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
