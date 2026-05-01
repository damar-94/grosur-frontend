"use client";

import { useEffect, useState } from "react";
import HeroBanner from "@/components/HeroBanner";
import { ProductGrid } from "@/components/products/ProductGrid";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAppStore } from "@/stores/useAppStore";
import { api } from "@/lib/axiosInstance";
import { FiMapPin, FiAlertCircle, FiLoader, FiArrowRight, FiShoppingBag } from "react-icons/fi";
import Link from "next/link";
import CategoryGrid from "@/components/CategoryGrid";
import StoreSelector from "@/components/layout/StoreSelector";

export default function HomePage() {
  const { coordinates, error: geoError, isLoading: geoLoading } = useGeolocation();
  const { currentStore, isManualStore, storeMessage, selectedAddress } = useAppStore();

  return (
    <div className="mx-auto max-w-[1200px] space-y-4 pb-20 pt-0 md:space-y-6 md:px-6 md:pt-6">
      {/* Geolocation Status Banner */}
      <div className="px-4 pt-4 md:px-0 md:pt-0">
        {geoLoading && !currentStore && (
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700 border border-blue-100 shadow-sm">
            <FiLoader className="animate-spin" /> Sedang mencari lokasi...
          </div>
        )}

        {geoError && !geoLoading && !currentStore && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-100 shadow-sm mt-3">
            <FiAlertCircle className="shrink-0" /> {geoError}
          </div>
        )}

        {!geoLoading && currentStore && (
          <div className="flex items-center justify-between gap-2 rounded-xl bg-[#59cfb7]/10 p-4 text-[#00997a] border border-[#59cfb7]/20 shadow-sm mt-3 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#59cfb7]/20 flex items-center justify-center shrink-0">
                <FiMapPin className="animate-bounce" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                  {(!coordinates && selectedAddress) ? `Mengirim ke: ${selectedAddress.label}` : "Melayani di:"}
                </p>
                <div className="flex items-center gap-1.5">
                  <StoreSelector 
                    trigger={
                      <button className="flex flex-col items-start hover:opacity-75 transition-opacity group">
                         <span className="font-extrabold text-base md:text-lg leading-tight border-b-2 border-transparent group-hover:border-[#00997a]">
                           {currentStore.name}
                         </span>
                         {selectedAddress && (
                           <span className="text-[10px] font-medium opacity-80 mt-0.5">Berdasarkan alamat terpilih</span>
                         )}
                      </button>
                    }
                  />
                  {isManualStore && <span className="text-[10px] bg-[#00997a] text-white px-1.5 py-0.5 rounded font-bold">Pilihan Anda</span>}
                </div>
              </div>
            </div>

            <div className="hidden md:flex flex-col items-end text-right">
              <p className="text-xs font-medium opacity-80">{storeMessage}</p>
            </div>
          </div>
        )}
      </div>

      <HeroBanner />

      <section className="px-4 md:px-0 mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Kategori Pilihan</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Cari berdasarkan kategori produk</p>
          </div>
        </div>
        <CategoryGrid />
      </section>

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
        ) : !geoLoading && (
          <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100 text-red-600">
            Gagal memuat toko. Mohon izinkan lokasi atau pilih toko secara manual.
          </div>
        )}
      </section>
    </div>
  );
}
