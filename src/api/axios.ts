import axios from 'axios';
import { ROUTES } from '../constants/routes';

const getApiBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
    if (envUrl) return envUrl;
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        return 'https://academia-api.duckdns.org/api';
    }
    return 'http://localhost:8080/api';
};

export const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {},
});

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

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else if (token) {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response interceptor for handling errors & auto refresh
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        const message = error.response?.data?.message || error.message || 'Une erreur est survenue';
        console.error(`[API Error] ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}:`, message);

        // Handle unauthorized (token expired or missing)
        if (error.response?.status === 401 && !originalRequest._retry && !window.location.pathname.includes(ROUTES.LOGIN)) {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken && !originalRequest.url?.includes('/auth/refresh-token')) {
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    }).then(token => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return api(originalRequest);
                    }).catch(err => Promise.reject(err));
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
                    if (res.data?.token) {
                        const newToken = res.data.token;
                        localStorage.setItem('token', newToken);
                        if (res.data.refreshToken) {
                            localStorage.setItem('refreshToken', res.data.refreshToken);
                        }
                        originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
                        processQueue(null, newToken);
                        return api(originalRequest);
                    }
                } catch (refreshErr) {
                    processQueue(refreshErr, null);
                    console.warn("Session expirée. Redirection vers la connexion...");
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    localStorage.setItem('logout', Date.now().toString());
                    window.location.href = ROUTES.LOGIN;
                    return Promise.reject(refreshErr);
                } finally {
                    isRefreshing = false;
                }
            } else {
                console.warn("Session expirée sans refresh token. Redirection vers la connexion...");
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                localStorage.setItem('logout', Date.now().toString());
                setTimeout(() => {
                    window.location.href = ROUTES.LOGIN;
                }, 100);
            }
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
