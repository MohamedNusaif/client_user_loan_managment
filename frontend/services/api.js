// services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://a6b814e375e0.ngrok-free.app:5000', // ✅ your PC's IP
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: You can add interceptors here (e.g., token auth, logging)
API.interceptors.response.use(
  res => res,
  err => {
    console.error('API error:', err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default API;
