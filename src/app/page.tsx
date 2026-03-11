// src/app/page.tsx
"use client";

import { useEffect } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { api } from "@/lib/axiosInstance";
import { useAppStore } from "@/store/useAppStore";

export default function HomePage() {
  const { location, error, requestLocation } = useGeolocation();
  const setNearestStore = useAppStore((state) => state.setNearestStore);
  const nearestStore = useAppStore((state) => state.nearestStore);

  useEffect(() => {
    requestLocation();
  }, []); // Run once on mount

  useEffect(() => {
    const fetchNearestStore = async () => {
      if (!location) return;
      try {
        const res = await api.get(`/stores/nearest?lat=${location.lat}&lng=${location.lng}`);
        setNearestStore(res.data.data);
      } catch (err) {
        // Handle out of range or server error (fallback to main store logic)
      }
    };
    fetchNearestStore();
  }, [location, setNearestStore]);

  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Online Grocery</h1>
      
      {error && <p className="text-red-500">Notice: {error}. Using default store.</p>}
      
      {nearestStore ? (
        <div className="bg-green-100 p-4 rounded-md">
          <p>Shopping from: <strong>{nearestStore.name}</strong></p>
        </div>
      ) : (
        <p>Locating nearest store...</p>
      )}

      {/* Product List Component will go here and use the nearestStore.id to fetch products */}
    </main>
  );
}