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
    setStoreMessage,
    selectedAddress
  } = useAppStore();
  
  const { latitude: geoLat, longitude: geoLng } = useLocationStore();
  const [isSyncingStore, setIsSyncingStore] = useState(false);

  useEffect(() => {
    const fetchNearestStore = async () => {
      if (isSyncingStore) return;
      setIsSyncingStore(true);
      try {
        // Priority: Browser geolocation coords > selectedAddress coords (Default behavior)
        const lat = geoLat || selectedAddress?.latitude || null;
        const lng = geoLng || selectedAddress?.longitude || null;

        const response = await api.post("/stores/nearest", {
          latitude: lat,
          longitude: lng,
        });

        const store = response.data.data || response.data.store;
        if (store) {
          setCurrentStore({ id: store.id, name: store.name }, false);
          
          // Refine message based on source
          let msg = response.data.message || "Melayani di sekitar lokasi Anda";
          const isUsingGeo = !!geoLat;
          const isUsingAddr = !geoLat && !!selectedAddress;

          if (isUsingAddr) {
            if (msg.includes("toko utama")) {
              msg = "Alamat di luar jangkauan (50km), menggunakan toko pusat";
            } else if (msg.includes("terdekat ditemukan")) {
              msg = `Melayani pengiriman ke ${selectedAddress.label}`;
            }
          } else if (isUsingGeo) {
            // If using geolocation, keep it simple
            if (msg.includes("toko utama")) {
              msg = "Lokasi di luar jangkauan (50km), menggunakan toko pusat";
            } else {
              msg = "Melayani di sekitar lokasi Anda";
            }
          }
          
          setStoreMessage(msg);
          
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
    // 1. Not in manual mode (Store selection)
    // 2. We don't have a current store OR we have a selected address we need to sync with
    if (!isManualStore && (!currentStore || selectedAddress)) {
      fetchNearestStore();
    }
  }, [geoLat, geoLng, isManualStore, currentStore, setCurrentStore, setStoreMessage, selectedAddress]);

  // Handle manual message is now handled in useAppStore action directly
  // to ensure instantaneous UI updates.

  return <>{children}</>;
}
