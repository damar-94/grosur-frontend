// src/hooks/useNearestStore.ts
import { useEffect } from "react";
import { useGeolocation } from "./useGeolocation";
import { api } from "@/lib/axiosInstance";
import { useAppStore } from "@/stores/useAppStore";

export const useNearestStoreFetch = () => {
  const { location, error, requestLocation } = useGeolocation();
  const setNearestStore = useAppStore((state) => state.setNearestStore);

  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {
    if (!location) return;
    api.get(`/stores/nearest?lat=${location.lat}&lng=${location.lng}`)
      .then((res) => setNearestStore(res.data.data))
      .catch(() => setNearestStore(null)); // Fallback logic
  }, [location, setNearestStore]);

  return { error };
};