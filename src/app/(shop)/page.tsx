"use client";

import { useEffect, useState } from "react";
import HeroBanner from "@/components/HeroBanner";
import { ProductGrid } from "@/components/products/ProductGrid";
import { useGeolocation } from "@/hooks/useGeolocation";
import { FiMapPin, FiAlertCircle, FiLoader, FiArrowRight } from "react-icons/fi";
import { useAppStore } from "@/stores/useAppStore";
import { productService } from "@/services/productService";
import Link from "next/link";

export default function HomePage() {
  const { coordinates, error, isLoading: isLocating } = useGeolocation();
  const { currentStore, setCurrentStore } = useAppStore();
  const [isStoreLoading, setIsStoreLoading] = useState(true);

  useEffect(() => {
    const initStore = async () => {
      try {
        const res = await productService.getStores();
        if (res.success && res.data.length > 0) {
          // In a real app, we would find the nearest store based on coordinates
          // For now, if no store is set, pick the first one
          if (!currentStore) {
            setCurrentStore({ id: res.data[0].id, name: res.data[0].name });
          }
        }
      } catch (err) {
        console.error("Error fetching stores:", err);
      } finally {
        setIsStoreLoading(false);
      }
    };

    initStore();
  }, [currentStore, setCurrentStore]);

  return (
    <div className="mx-auto max-w-[1200px] space-y-4 pb-20 pt-0 md:space-y-6 md:px-6 md:pt-6">
      {/* Geolocation Status Banner */}
      <div className="px-4 pt-4 md:px-0 md:pt-0">
        {(isLocating || isStoreLoading) && (
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700 border border-blue-100">
            <FiLoader className="animate-spin" /> Sedang mencari lokasi dan toko terdekat...
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-100">
            <FiAlertCircle className="shrink-0" /> {error}
          </div>
        )}

        {coordinates && currentStore && (
          <div className="flex items-center gap-2 rounded-lg bg-[#59cfb7]/20 p-3 text-sm text-[#00997a] border border-[#59cfb7]/30">
            <FiMapPin className="shrink-0" /> Melayani di sekitar: <span className="font-bold underline ml-1">{currentStore.name}</span>
          </div>
        )}
      </div>

      <section>
        <HeroBanner />
      </section>

      <section className="bg-card px-4 py-4 md:rounded-xl md:p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-foreground">Kategori Pilihan</h2>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
           {/* Fallback mock categories */}
           {['Sembako', 'Buah', 'Sayur', 'Daging', 'Susu', 'Snack', 'Minuman', 'Lainnya'].map((cat) => (
              <div key={cat} className="flex flex-col items-center gap-2">
                 <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <FiArrowRight />
                 </div>
                 <span className="text-[10px] font-bold text-muted-foreground uppercase">{cat}</span>
              </div>
           ))}
        </div>
      </section>

      <section className="bg-card px-4 py-4 md:rounded-xl md:p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Spesial di Toko Terdekat</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Produk pilihan untukmu hari ini</p>
          </div>
          <Link href="/products" className="text-sm font-bold text-primary hover:text-primary-light transition-colors flex items-center gap-1">
            Lihat Semua <FiArrowRight />
          </Link>
        </div>

        {currentStore ? (
          <ProductGrid storeId={currentStore.id} limit={10} />
        ) : !isStoreLoading && (
          <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100 text-red-600">
             Gagal memuat toko. Mohon segarkan halaman.
          </div>
        )}

      </section>
    </div>
  );
}
