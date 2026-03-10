import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
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
