import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { BACKEND_URL } from './envConfig';

const API_CONFIG = {
    BASE_URL: (BACKEND_URL || 'https://easy-route-backend-w1se.onrender.com/api/v1').endsWith('/') ? (BACKEND_URL || 'https://easy-route-backend-w1se.onrender.com/api/v1') : `${BACKEND_URL || 'https://easy-route-backend-w1se.onrender.com/api/v1'}/`,
    TIMEOUT: 10000,
    HEADERS: {
        'Content-Type': 'application/json',
    },
};

const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS,
});

api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.url}`, config.data ? JSON.stringify(config.data, null, 2) : '(No Payload)');
        return config;
    },
    (error) => {
        console.error(`[API REQUEST ERROR]`, error);
        return Promise.reject(error);
    }
);

// Interceptor to handle responses and log them
api.interceptors.response.use(
    (response) => {
        console.log(`[API RESPONSE SUCCESS] ${response.config.method?.toUpperCase()} ${response.config.url} (${response.status}):`, JSON.stringify(response.data, null, 2));
        return response;
    },
    (error) => {
        const message = error.response?.data?.message || error.message || 'Something went wrong';
        console.error(`[API RESPONSE ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, message, error.response?.data || '');
        return Promise.reject(new Error(message));
    }
);

export default api;
