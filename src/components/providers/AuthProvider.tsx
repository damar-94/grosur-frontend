"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { api } from "@/lib/axiosInstance";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, setCartCount } = useAppStore();

  useEffect(() => {
    const syncAuth = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/auth/me");
        if (data.success && data.data.user) {
          setUser(data.data.user);
          try {
            const cartRes = await api.get("/cart/count");
            if (cartRes.data?.success) {
              setCartCount(cartRes.data.data.count);
            }
          } catch (e) {
             console.error("Failed to fetch cart count", e);
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
  }, [setUser, setLoading, setCartCount]);

  return <>{children}</>;
}
