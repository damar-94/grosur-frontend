// Unified App Store - merges auth state + cart state
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
  isVerified?: boolean;
  phone?: string;
  profilePicture?: string;
  referralCode?: string;
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
  selectedAddress: { id: string; label: string; latitude: number; longitude: number } | null;
  isManualStore: boolean;
  isSyncingStore: boolean;
  storeMessage: string;

  // Cart
  cart: CartItem[];

  // Actions – Auth
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setCartCount: (count: number) => void;
  logout: () => void;

  // Actions – Store
  setNearestStore: (store: Store | null) => void;
  setCurrentStore: (store: Store | null, isManual?: boolean) => void;
  setSelectedAddress: (address: { id: string; label: string; latitude: number; longitude: number } | null) => void;
  setStoreMessage: (message: string) => void;
  setIsSyncingStore: (isSyncing: boolean) => void;

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
      selectedAddress: null,
      isManualStore: false,
      isSyncingStore: true, // true by default so UI waits on mount
      storeMessage: "",
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
          currentStore: null,
          selectedAddress: null,
          isManualStore: false,
          storeMessage: "",
          cartCount: 0,
          cart: [],
        }),

      // Store actions
      setNearestStore: (store) => set({ nearestStore: store }),
      setCurrentStore: (newStore, isManual = false) => {
        const previousStore = get().currentStore;
        const manualMsg = "Menampilkan produk dari toko pilihan Anda";
        
        // Clear cart if store changes (prevents inventory mismatch)
        if (previousStore && newStore && previousStore.id !== newStore.id) {
          set({ 
            currentStore: newStore, 
            isManualStore: isManual, 
            cart: [],
            ...(isManual ? { storeMessage: manualMsg } : {}) 
          });
        } else {
          set({ 
            currentStore: newStore, 
            isManualStore: isManual,
            ...(isManual ? { storeMessage: manualMsg } : {})
          });
        }
      },
      setSelectedAddress: (address) => {
        if (address) {
          set({ selectedAddress: address, isManualStore: false });
        } else {
          set({ selectedAddress: null });
        }
      },
      setStoreMessage: (message) => set({ storeMessage: message }),
      setIsSyncingStore: (isSyncing) => set({ isSyncingStore: isSyncing }),

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
        isManualStore: state.isManualStore,
        storeMessage: state.storeMessage,
        cartCount: state.cartCount,
        cart: state.cart,
      }),
      // After rehydration, mark loading as false
      onRehydrateStorage: () => (state) => {
        if (state) state.isLoading = false;
      },
    }
  )
);
