// src/lib/axios.ts
import axios from 'axios';
import { useAppStore } from '@/stores/useAppStore';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api',
    withCredentials: true, // CRITICAL: This allows the browser to send/receive HTTP-only cookies
});

// Response Interceptor: The "Security Guard"
api.interceptors.response.use(
    (response) => response, // If the request is successful, do nothing
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token is invalid or expired
            console.warn("Session expired. Redirecting to login...");

            // Clear Zustand store
            useAppStore.getState().logout();

            // Redirect to login if we are in the browser
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;