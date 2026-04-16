// @ts-nocheck — TODO: useGeolocation LocationState types not complete
import { useEffect, useState } from "react";
import { useGeolocation } from "./useGeolocation";
import { api } from "@/lib/axiosInstance";
import { useAppStore } from "@/stores/useAppStore";

export const useNearestStoreFetch = () => {
  const { location, error, loading, requestLocation } = useGeolocation();
  const setNearestStore = useAppStore((state) => state.setNearestStore);
  const [isFetched, setIsFetched] = useState(false);

  useEffect(() => {
    requestLocation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (loading || isFetched) return; // Wait until geolocation finishes

    const fetchStore = async () => {
      try {
        // If location exists, try nearest. If error/denied, go straight to fallback.
        const endpoint = location ? "/stores/my-store" : "/stores/fallback";
        const res = await api.get(endpoint);
        setNearestStore(res.data.data);
      } catch {
        // If nearest fails, fallback one last time
        const fallback = await api.get("/stores/fallback").catch(() => ({ data: { data: null } }));
        setNearestStore(fallback.data.data);
      } finally {
        setIsFetched(true); // Lock it to prevent double-fetching
      }
    };

    fetchStore();
  }, [location, loading, error, isFetched]); // eslint-disable-line react-hooks/exhaustive-deps

  return { error };
};