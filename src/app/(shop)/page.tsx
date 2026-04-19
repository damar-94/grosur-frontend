"use client";

import { useEffect, useState } from "react";
import HeroBanner from "@/components/HeroBanner";
import ProductGridPlaceholder from "@/components/product/ProductGridPlaceholder";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useLocationStore } from "@/stores/useLocationStore";
import { api } from "@/lib/axiosInstance";
import { FiMapPin, FiAlertCircle, FiLoader, FiShoppingBag } from "react-icons/fi";

export default function HomePage() {
  // 1. Trigger the hook to request permission
  const { error: geoError, isLoading: geoLoading } = useGeolocation();

  // 2. Read Zustand Global State
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const nearestStoreId = useLocationStore((state) => state.nearestStoreId);
  const setNearestStore = useLocationStore((state) => state.setNearestStore);

  // 3. Local state for the API fetching status
  const [storeMessage, setStoreMessage] = useState("");
  const [isFetchingStore, setIsFetchingStore] = useState(false);

  // 4. API Call to your Backend
  useEffect(() => {
    // Wait for the geolocation prompt to finish before calling the API
    if (geoLoading) return;

    const fetchNearestStore = async () => {
      setIsFetchingStore(true);
      try {
        const response = await api.post("/stores/nearest", {
          latitude,
          longitude,
        });

        if (response.data.store) {
          setNearestStore(response.data.store.id);
          setStoreMessage(response.data.message);
        }
      } catch (error) {
        console.error("Gagal mengambil data toko:", error);
        // Fallback to a default store ID if the backend is offline
        setNearestStore("1");
        setStoreMessage("Menggunakan toko utama");
      } finally {
        setIsFetchingStore(false);
      }
    };

    fetchNearestStore();
  }, [geoLoading, latitude, longitude, setNearestStore]);

  return (
    <div className="mx-auto max-w-[1200px] space-y-4 pb-20 pt-0 md:space-y-6 md:px-6 md:pt-6">
      {/* Geolocation & Store Status Banner */}
      <div className="px-4 pt-4 md:px-0 md:pt-0">
        {(geoLoading || isFetchingStore) && (
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700 border border-blue-100 shadow-sm">
            <FiLoader className="animate-spin" /> Menyiapkan toko terbaik untuk Anda...
          </div>
        )}

        {!geoLoading && !isFetchingStore && nearestStoreId && (
          <div className="flex items-center gap-2 rounded-lg bg-[#59cfb7]/20 p-3 text-sm text-[#00997a] border border-[#59cfb7]/30 shadow-sm">
            {latitude ? <FiMapPin className="shrink-0" /> : <FiAlertCircle className="shrink-0 text-orange-500" />}
            <span className="font-medium text-foreground">{storeMessage}</span>
          </div>
        )}
      </div>

      <section>
        <HeroBanner />
      </section>

      <section className="bg-card px-4 py-4 md:rounded-xl md:p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-foreground">Kategori Pilihan</h2>
        <div className="h-24 w-full rounded-lg border-2 border-dashed border-muted bg-muted/20 flex items-center justify-center text-muted-foreground text-sm">
          [ Komponen Kategori Akan Datang ]
        </div>
      </section>

      <section className="bg-card px-4 py-4 md:rounded-xl md:p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Spesial di Toko Terdekat</h2>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <FiShoppingBag /> {storeMessage}
            </p>
          </div>
          <button className="text-sm font-bold text-primary hover:text-primary-light transition-colors">
            Lihat Semua
          </button>
        </div>

        {/* Pass the Store ID to the grid so it knows which products to fetch later! */}
        <ProductGridPlaceholder storeId={nearestStoreId} />

      </section>
    </div>
  );
}
