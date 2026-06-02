import axios from 'axios';
import { ROUTES } from '../constants/routes';

const getDefaultApiUrl = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        return `http://${hostname}:8080/api`;
    }
    return 'http://localhost:8080/api';
};

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '/api' : 'http://localhost:8080/api'),
    headers: {},
});

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || getDefaultApiUrl();
export const BASE_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;

export const getFileUrl = (path: string | null, download: boolean = false) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const fixedPath = cleanPath.startsWith('/api') ? cleanPath : `/api${cleanPath}`;

    // Encode each segment of the path separately, avoiding double encoding
    const url = BASE_URL + fixedPath.split('/').map(segment => encodeURIComponent(decodeURIComponent(segment))).join('/');
    return download ? `${url}?download=true` : url;
};

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const message = error.response?.data?.message || error.message || 'Une erreur est survenue';
        console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, message);

        // Handle unauthorized (token expired or missing)
        if (error.response?.status === 401 && !window.location.pathname.includes(ROUTES.LOGIN)) {
            console.warn("Session expirée. Redirection vers la connexion...");
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.setItem('logout', Date.now().toString()); // Notify other tabs
            // Use a slight delay to ensure the log is visible and avoid rapid re-triggering if multiple requests fail
            setTimeout(() => {
                window.location.href = ROUTES.LOGIN;
            }, 100);
        }

        // Handle subscription expired
        if (error.response?.status === 402 &&
            !window.location.pathname.includes(ROUTES.SUBSCRIPTION_EXPIRED) &&
            !window.location.pathname.includes(ROUTES.PRICING)) {
            console.warn("Abonnement expiré. Redirection vers la page d'expiration...");
            window.location.href = ROUTES.SUBSCRIPTION_EXPIRED;
        }

        return Promise.reject(error);
    }
);

export default api;
