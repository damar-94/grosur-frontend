"use client";

import { useEffect, useState } from "react";
import HeroBanner from "@/components/HeroBanner";
import { ProductGrid } from "@/components/products/ProductGrid";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAppStore } from "@/stores/useAppStore";
import { api } from "@/lib/axiosInstance";
import { FiMapPin, FiAlertCircle, FiLoader, FiArrowRight, FiShoppingBag } from "react-icons/fi";
import Link from "next/link";

export default function HomePage() {
  const { coordinates, error: geoError, isLoading: geoLoading } = useGeolocation();
  const { currentStore, setCurrentStore } = useAppStore();
  
  const [storeMessage, setStoreMessage] = useState("");
  const [isFetchingStore, setIsFetchingStore] = useState(true);

  useEffect(() => {
    // We already have some geo loading
    const fetchNearestStore = async () => {
      setIsFetchingStore(true);
      try {
        const response = await api.post("/stores/nearest", {
          latitude: coordinates?.lat || null,
          longitude: coordinates?.lng || null,
        });

        const store = response.data.data || response.data.store;
        if (store) {
          setCurrentStore({ id: store.id, name: store.name });
          setStoreMessage(response.data.message);
        }
      } catch (error) {
        console.error("Gagal mengambil data toko:", error);
      } finally {
        setIsFetchingStore(false);
      }
    };

    if (!geoLoading) {
      fetchNearestStore();
    }
  }, [geoLoading, coordinates, setCurrentStore]);

  return (
    <div className="mx-auto max-w-[1200px] space-y-4 pb-20 pt-0 md:space-y-6 md:px-6 md:pt-6">
      {/* Geolocation Status Banner */}
      <div className="px-4 pt-4 md:px-0 md:pt-0">
        {(geoLoading || isFetchingStore) && (
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700 border border-blue-100 shadow-sm">
            <FiLoader className="animate-spin" /> Sedang mencari lokasi dan toko terdekat...
          </div>
        )}

        {geoError && !geoLoading && !isFetchingStore && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-100 shadow-sm mt-3">
            <FiAlertCircle className="shrink-0" /> {geoError}
          </div>
        )}

        {!geoLoading && !isFetchingStore && currentStore && (
          <div className="flex items-center gap-2 rounded-lg bg-[#59cfb7]/20 p-3 text-sm text-[#00997a] border border-[#59cfb7]/30 shadow-sm mt-3">
            <FiMapPin className="shrink-0" /> Melayani di sekitar: <span className="font-bold underline ml-1">{currentStore.name}</span>
            <span className="ml-2 text-xs opacity-80">({storeMessage})</span>
          </div>
        )}
      </div>

      <HeroBanner />

      <section className="px-4 md:px-0 mt-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Spesial di Toko Terdekat</h2>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <FiShoppingBag /> Produk pilihan untukmu hari ini
            </p>
          </div>
          <Link href="/products" className="text-sm font-bold text-primary hover:text-primary-light transition-colors flex items-center gap-1">
            Lihat Semua <FiArrowRight />
          </Link>
        </div>

        {currentStore ? (
          <ProductGrid storeId={currentStore.id} limit={10} />
        ) : !isFetchingStore && (
          <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100 text-red-600">
             Gagal memuat toko. Mohon segarkan halaman.
          </div>
        )}
      </section>
    </div>
  );
}
