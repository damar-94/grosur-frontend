// Unified App Store - merges auth state + cart state
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
  isVerified?: boolean;
  managedStore?: {
    id: string;
    name: string;
  };
}

interface Store {
  id: string;
  name: string;
}

interface CartProduct {
  id: string;
  name: string;
  price: number;
  images?: string[];
  discount?: number;
}

export interface CartItem {
  productId: string;
  stockId?: string;
  quantity: number;
  product: CartProduct;
}

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Store location
  nearestStore: Store | null;
  cartCount: number;
  currentStore: Store | null;

  // Cart
  cart: CartItem[];

  // Actions – Auth
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setCartCount: (count: number) => void;
  logout: () => void;

  // Actions – Store
  setNearestStore: (store: Store | null) => void;
  setCurrentStore: (store: Store | null) => void;

  // Actions – Cart
  addToCart: (item: CartItem) => void;
  updateCartItem: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: true,
      nearestStore: null,
      currentStore: null,
      cartCount: 0,
      cart: [],

      // Auth actions
      setUser: (user) =>
        set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (loading) => set({ isLoading: loading }),
      setCartCount: (count) => set({ cartCount: count }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          nearestStore: null,
          cartCount: 0,
          cart: [],
        }),

      // Store actions
      setNearestStore: (store) => set({ nearestStore: store }),
      setCurrentStore: (newStore) => {
        const previousStore = get().currentStore;
        // Clear cart if store changes (prevents inventory mismatch)
        if (previousStore && newStore && previousStore.id !== newStore.id) {
          set({ currentStore: newStore, cart: [] });
        } else {
          set({ currentStore: newStore });
        }
      },

      // Cart actions
      addToCart: (item) => {
        const existing = get().cart.find((c) => c.productId === item.productId);
        if (existing) {
          set({
            cart: get().cart.map((c) =>
              c.productId === item.productId
                ? { ...c, quantity: c.quantity + item.quantity }
                : c
            ),
          });
        } else {
          set({ cart: [...get().cart, item] });
        }
      },
      updateCartItem: (productId, quantity) =>
        set({
          cart: get().cart.map((c) =>
            c.productId === productId ? { ...c, quantity } : c
          ),
        }),
      removeFromCart: (productId) =>
        set({ cart: get().cart.filter((c) => c.productId !== productId) }),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "grosur-app-store",
      // Only persist non-sensitive, non-loading data
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        nearestStore: state.nearestStore,
        currentStore: state.currentStore,
        cart: state.cart,
      }),
      // After rehydration, mark loading as false
      onRehydrateStorage: () => (state) => {
        if (state) state.isLoading = false;
      },
    }
  )
);
