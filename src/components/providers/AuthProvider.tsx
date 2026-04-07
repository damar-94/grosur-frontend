"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { api } from "@/lib/axiosInstance";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAppStore();

  useEffect(() => {
    const syncAuth = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/auth/me");
        if (data.success && data.data.user) {
          setUser(data.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth sync failed", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    syncAuth();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
