"use client";

import HeroBanner from "@/components/HeroBanner";
import ProductGridPlaceholder from "@/components/product/ProductGridPlaceholder";
import { useGeolocation } from "@/hooks/useGeolocation";
import { FiMapPin, FiAlertCircle, FiLoader } from "react-icons/fi";

export default function HomePage() {
  // Trigger the location prompt as soon as the page loads
  const { coordinates, error, isLoading } = useGeolocation();

  return (
    <div className="mx-auto max-w-[1200px] space-y-4 pb-20 pt-0 md:space-y-6 md:px-6 md:pt-6">

      {/* Geolocation Status Banner */}
      <div className="px-4 pt-4 md:px-0 md:pt-0">
        {isLoading && (
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700 border border-blue-100">
            <FiLoader className="animate-spin" /> Sedang mencari lokasi Anda...
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-100">
            <FiAlertCircle className="shrink-0" /> {error}
          </div>
        )}

        {coordinates && (
          <div className="flex items-center gap-2 rounded-lg bg-[#59cfb7]/20 p-3 text-sm text-[#00997a] border border-[#59cfb7]/30">
            <FiMapPin className="shrink-0" /> Lokasi ditemukan! Menyiapkan produk dari toko terdekat...
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
            <p className="text-xs text-muted-foreground mt-0.5">Berdasarkan lokasimu saat ini</p>
          </div>
          <button className="text-sm font-bold text-primary hover:text-primary-light transition-colors">
            Lihat Semua
          </button>
        </div>

        <ProductGridPlaceholder />

      </section>

    </div>
  );
}