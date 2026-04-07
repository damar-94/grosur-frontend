import axios from "axios";
import { useAppStore } from "@/stores/useAppStore";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  withCredentials: true, // Crucial for HttpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercept responses to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status, data } = error.response || {};
    
    if (status === 401 || (status === 403 && data?.code === "FORBIDDEN")) {
      // Clear Zustand state on auth error
      useAppStore.getState().logout();

      if (typeof window !== "undefined") {
        const isLoginPage = window.location.pathname === "/login";
        const isHomePage = window.location.pathname === "/";

        if (status === 401 && !isLoginPage) {
          window.location.href = "/login";
        } else if (status === 403 && data?.code === "FORBIDDEN" && !isHomePage) {
          window.location.href = "/";
        }
      }
    }
    return Promise.reject(error);
  }
);