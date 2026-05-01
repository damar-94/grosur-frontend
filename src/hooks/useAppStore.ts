// @ts-nocheck — TODO: this is a WIP duplicate of stores/useAppStore
// src/store/useAppStore.ts
import { create } from "zustand";

// (Assuming you have these interfaces defined)
interface StoreData { id: string; name: string; /* ...other fields */ }
interface CartItem { productId: string; quantity: number; /* ...other fields */ }

interface AppState {
    user: any | null;
    currentStore: StoreData | null;
    cart: CartItem[];

    // Actions
    setUser: (user: any) => void;
    setCurrentStore: (store: StoreData) => void;
    addToCart: (item: CartItem) => void;
    clearCart: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
    user: null,
    currentStore: null,
    cart: [],

    setUser: (user) => set({ user }),

    // The "Smart" Store Setter
    setCurrentStore: (newStore) => {
        const previousStore = get().currentStore;

        // Check if a store was already set AND if the ID is different
        if (previousStore && previousStore.id !== newStore.id) {
            console.warn("📍 Location changed! Clearing cart to prevent inventory mismatch.");

            // Update the store AND empty the cart simultaneously
            set({
                currentStore: newStore,
                cart: []
            });

            // Optional: You could trigger a toast notification here
            // toast.info("Keranjang dikosongkan karena perubahan lokasi toko.");
        } else {
            // Normal update (e.g., first time loading)
            set({ currentStore: newStore });
        }
    },

    addToCart: (item) => set((state) => ({ cart: [...state.cart, item] })),

    clearCart: () => set({ cart: [] }),
}));