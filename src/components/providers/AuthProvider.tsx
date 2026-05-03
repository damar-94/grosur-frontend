"use client";

import { useState, useEffect, useRef } from "react";

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
  const lastNotifiedStoreId = useRef<string | null>(null);

  // Initialize ref with current store id to prevent toast on first load if already set
  useEffect(() => {
    if (currentStore?.id && !lastNotifiedStoreId.current) {
      lastNotifiedStoreId.current = currentStore.id;
    }
  }, [currentStore?.id]);

  useEffect(() => {
    const fetchNearestStore = async () => {
      // Small artificial delay for Vercel Cold Starts
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { isSyncingStore, setIsSyncingStore } = useAppStore.getState();
      if (isSyncingStore && currentStore) return; // if already syncing and we have a store
      
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
          const isStoreChanged = !currentStore || currentStore.id !== store.id;
          
          if (isStoreChanged && lastNotifiedStoreId.current !== store.id) {
            setCurrentStore({ id: store.id, name: store.name }, false);
            
            // Show toast ONLY when the store actually changes and we haven't notified for this ID yet
            toast.success(`Lokasi otomatis: ${store.name}`, { icon: "📍", duration: 2000 });
            lastNotifiedStoreId.current = store.id;
          }

          
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
            if (msg.includes("toko utama")) {
              msg = "Lokasi di luar jangkauan (50km), menggunakan toko pusat";
            } else {
              msg = "Melayani di sekitar lokasi Anda";
            }
          }
          
          setStoreMessage(msg);
        }
      } catch (error) {
        console.error("Global store sync failed:", error);
      } finally {
        useAppStore.getState().setIsSyncingStore(false);
      }
    };

    // Trigger fetch if:
    // 1. Not in manual mode (Store selection)
    // 2. We have new coordinates (Geo or Address) OR we don't have a store yet
    if (!isManualStore && (!currentStore || geoLat || selectedAddress)) {
      fetchNearestStore();
    }
  }, [geoLat, geoLng, isManualStore, currentStore, setCurrentStore, setStoreMessage, selectedAddress]);

  // Handle manual message is now handled in useAppStore action directly
  // to ensure instantaneous UI updates.

  return <>{children}</>;
}
