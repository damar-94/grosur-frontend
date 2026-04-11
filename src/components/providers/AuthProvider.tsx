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
          const user = data.data.user;
          setUser(user);
          
          // For STORE_ADMIN, automatically set their managed store as the active store
          if (user.role === "STORE_ADMIN" && user.managedStore) {
            useAppStore.getState().setNearestStore(user.managedStore);
          }
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
