import axios from 'axios';

// Backend base URL defined in one place.
//
// In local dev, the frontend (Vite, port 5173) and backend (Express, port
// 5000) run as separate servers, so we need the full localhost URL.
//
// In production (Vercel), vercel.json rewrites "/api/*" on the SAME domain
// to the backend function, so a relative "/api" path is correct — hardcoding
// localhost here was the actual bug: the deployed frontend was trying to
// call the visitor's own machine instead of the deployed backend.
//
// VITE_API_URL / VITE_SERVER_URL can still be set in Vercel's Environment
// Variables if the backend ever lives on a different domain (e.g. deployed
// as its own separate Vercel project) — see note at the bottom of this file.
const isDev = import.meta.env.DEV;

const API_BASE_URL = isDev
  ? 'http://localhost:5000/api'
  : (import.meta.env.VITE_API_URL || '/api');

const SERVER_ROOT_URL = isDev
  ? 'http://localhost:5000'
  : (import.meta.env.VITE_SERVER_URL || ''); // '' = same origin, used for static file (image) links

const api = axios.create({
  baseURL: API_BASE_URL
});

// item.images now stores a full Cloudinary URL for newly-uploaded photos.
// Older items (posted before the Cloudinary migration) may still have a bare
// local filename saved - fall back to the old /uploads path for those so
// they don't break, even though those specific files are gone on Vercel.
export function getImageUrl(filename) {
  if (!filename) return '';
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
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
