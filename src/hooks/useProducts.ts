// src/hooks/useProducts.ts
import api from "@/lib/axiosInstance";
import { useAppStore } from "@/stores/useAppStore";

export const fetchStoreProducts = async () => {
    const { currentStore } = useAppStore.getState(); // Get the store found via Geolocation

    const res = await api.get(`/products?storeId=${currentStore.id}`);
    return res.data.data;
};