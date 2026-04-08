// src/store/useAppStore.ts
import { create } from "zustand";

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
  isVerified?: boolean;
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
  cartCount: number;
  setUser: (user: User | null) => void;
  setNearestStore: (store: Store | null) => void;
  setLoading: (loading: boolean) => void;
  setCartCount: (count: number) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  nearestStore: null,
  cartCount: 0,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  setNearestStore: (store) => set({ nearestStore: store }),
  setCartCount: (count) => set({ cartCount: count }),
  logout: () => set({ user: null, isAuthenticated: false, nearestStore: null, cartCount: 0 }),
}));