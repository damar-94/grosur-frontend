"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { api } from "@/lib/axiosInstance";
import { useLocationStore } from "@/stores/useLocationStore";
import { toast } from "sonner";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, setCartCount } = useAppStore();

  useEffect(() => {
    const syncAuth = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/auth/me");
        if (data.success && data.data.user) {
          const user = data.data.user;
          setUser(user);

          // Get cart count
          try {
            const cartRes = await api.get("/cart/count");
            if (cartRes.data?.success) {
              setCartCount(cartRes.data.data.count);
            }
          } catch (e) {
            console.error("Failed to fetch cart count", e);
          }


          // For STORE_ADMIN, automatically set their managed store as the active store
          if (user.role === "STORE_ADMIN" && user.managedStore) {
            useAppStore.getState().setNearestStore(user.managedStore);
          }
        } else {
          setUser(null);
        }
      } catch (error: any) {
        // Only log error if it's not a standard 401 Unauthenticated
        if (error?.response?.status !== 401) {
          console.error("Auth sync failed", error);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    syncAuth();
  }, [setUser, setLoading, setCartCount]);

  // --- GLOBAL STORE INITIALIZATION ---
  const { 
    currentStore, 
    setCurrentStore, 
    isManualStore, 
    storeMessage, 
    setStoreMessage 
  } = useAppStore();
  
  const { latitude, longitude } = useLocationStore();
  const [isSyncingStore, setIsSyncingStore] = useState(false);

  useEffect(() => {
    const fetchNearestStore = async () => {
      if (isSyncingStore) return;
      setIsSyncingStore(true);
      try {
        const response = await api.post("/stores/nearest", {
          latitude: latitude || null,
          longitude: longitude || null,
        });

        const store = response.data.data || response.data.store;
        if (store) {
          setCurrentStore({ id: store.id, name: store.name }, false);
          setStoreMessage(response.data.message || "Melayani di sekitar lokasi Anda");
          
          if (!currentStore) {
             toast.success(`Lokasi otomatis: ${store.name}`, { icon: "📍", duration: 2000 });
          }
        }
      } catch (error) {
        console.error("Global store sync failed:", error);
      } finally {
        setIsSyncingStore(false);
      }
    };

    // Trigger fetch if:
    // 1. Not in manual mode
    // 2. We don't have a current store OR we explicitly want to refresh it (currentStore is null)
    if (!isManualStore && !currentStore) {
      fetchNearestStore();
    }
  }, [latitude, longitude, isManualStore, currentStore, setCurrentStore, setStoreMessage]);

  // Handle manual message
  useEffect(() => {
    if (isManualStore && currentStore) {
      setStoreMessage("Menampilkan produk dari toko pilihan Anda");
    }
  }, [isManualStore, currentStore, setStoreMessage]);

  return <>{children}</>;
}
