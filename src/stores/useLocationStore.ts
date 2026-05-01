import { create } from "zustand";

interface LocationState {
    latitude: number | null;
    longitude: number | null;
    nearestStoreId: string | null; // Will be populated by our backend API later
    isLocationDenied: boolean;

    // Actions
    setLocation: (lat: number, lng: number) => void;
    setNearestStore: (storeId: string) => void;
    setLocationDenied: (status: boolean) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
    latitude: null,
    longitude: null,
    nearestStoreId: null,
    isLocationDenied: false,

    setLocation: (lat, lng) => set({ latitude: lat, longitude: lng, isLocationDenied: false }),
    setNearestStore: (storeId) => set({ nearestStoreId: storeId }),
    setLocationDenied: (status) => set({ isLocationDenied: status }),
}));