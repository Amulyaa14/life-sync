import axios from 'axios';

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
const baseURL = configuredBaseUrl && configuredBaseUrl.trim().length > 0
    ? configuredBaseUrl
    : 'http://localhost:5000/api';

const api = axios.create({
    baseURL,
});

// Since we have a mock protect middleware that auto-assigns a user, 
// we don't strictly need auth tokens for this MVP, but we can configure it for future use.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
