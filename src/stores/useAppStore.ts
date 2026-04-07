// src/store/useAppStore.ts
import { create } from "zustand";

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

interface Store {
  id: string;
  name: string;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  nearestStore: Store | null;
  setUser: (user: User | null) => void;
  setNearestStore: (store: Store | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  nearestStore: null,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  setNearestStore: (store) => set({ nearestStore: store }),
  logout: () => set({ user: null, isAuthenticated: false, nearestStore: null }),
}));