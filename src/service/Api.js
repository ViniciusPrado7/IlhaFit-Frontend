import axios from 'axios';
import { authSession } from './AuthSession';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    withCredentials: true,
})

api.interceptors.request.use((config) => {
    const token = authSession.getToken();
    const tokenType = authSession.getTokenType();

    if (token) {
        config.headers.Authorization = `${tokenType} ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const url = error?.config?.url || "";

        // Só desloga em 401 (token expirado/inválido), nunca em 403 (sem permissão para aquela ação)
        if (status === 401 && !url.includes("/auth/login")) {
            authSession.clear();
        }

        return Promise.reject(error);
    }
);
