// src/hooks/useNearestStore.ts
import { useEffect } from "react";
import { useGeolocation } from "./useGeolocation";
import { api } from "@/lib/axiosInstance";
import { useAppStore } from "@/stores/useAppStore";

/** Fetches the store assigned to the user's default address.
 *  Falls back to the first active store if location is denied or unavailable.
 */
const fetchFallbackStore = async (setNearestStore: (store: any) => void) => {
  try {
    const res = await api.get("/store/fallback");
    setNearestStore(res.data.data);
  } catch {
    setNearestStore(null);
  }
};

export const useNearestStoreFetch = () => {
  const { location, error, loading, requestLocation } = useGeolocation();
  const setNearestStore = useAppStore((state) => state.setNearestStore);

  // Ask for location on mount
  useEffect(() => {
    requestLocation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Once geolocation settles, try the assigned-store endpoint or fall back
  useEffect(() => {
    if (loading) return; // Still waiting for browser response

    if (location) {
      // Happy path: user allowed location, fetch their assigned store
      api
        .get("/store/my-store")
        .then((res) => setNearestStore(res.data.data))
        .catch(() => fetchFallbackStore(setNearestStore));
    } else {
      // Denied or unavailable: use the main / first active store
      fetchFallbackStore(setNearestStore);
    }
  }, [location, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  return { error };
};