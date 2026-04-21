// @ts-nocheck — TODO: useGeolocation LocationState types not complete
import { useEffect, useState } from "react";
import { useGeolocation } from "./useGeolocation";
import { api } from "@/lib/axiosInstance";
import { useAppStore } from "@/stores/useAppStore";

export const useNearestStoreFetch = () => {
  const { location, error, loading, requestLocation } = useGeolocation();
  const { setNearestStore, isManualStore, selectedAddress, setCurrentStore } = useAppStore();
  const [isFetched, setIsFetched] = useState(false);

  useEffect(() => {
    // Only request browser location if no manual choice exists
    if (!isManualStore && !selectedAddress) {
      requestLocation();
    } else {
      setIsFetched(true); // Skip automatic fetch
    }
  }, [isManualStore, selectedAddress]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (loading || isFetched || isManualStore || selectedAddress) return;

    const fetchStore = async () => {
      try {
        // If location exists, try nearest. If error/denied, go straight to fallback.
        const endpoint = location ? "/stores/my-store" : "/stores/fallback";
        const res = await api.get(endpoint);
        
        if (res.data.success) {
           const store = res.data.data;
           setNearestStore(store);
           // Also set as current store if nothing else is set
           setCurrentStore({ id: store.id, name: store.name }, false);
        }
      } catch {
        const fallback = await api.get("/stores/fallback").catch(() => ({ data: { data: null } }));
        if (fallback.data.data) {
           setNearestStore(fallback.data.data);
           setCurrentStore({ id: fallback.data.data.id, name: fallback.data.data.name }, false);
        }
      } finally {
        setIsFetched(true);
      }
    };

    fetchStore();
  }, [location, loading, error, isFetched, isManualStore, selectedAddress]); // eslint-disable-line react-hooks/exhaustive-deps

  return { error };
};