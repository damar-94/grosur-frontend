// src/store/useAppStore.ts
import { create } from "zustand";

interface AppState {
  user: { id: string; email: string; role: string } | null;
  nearestStore: { id: string; name: string } | null;
  setUser: (user: any) => void;
  setNearestStore: (store: any) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  nearestStore: null,
  setUser: (user) => set({ user }),
  setNearestStore: (store) => set({ nearestStore: store }),
  logout: () => set({ user: null, nearestStore: null }),
}));