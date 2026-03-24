// src/app/page.tsx
"use client";

import { useNearestStoreFetch } from "@/hooks/useNearestStore";
import Header from "@/components/Header";
import CategoryGrid from "@/components/CategoryGrid";
import ProductCard from "@/components/ProductCard";
import HeroBanner from "@/components/HeroBanner";

export default function HomePage() {
  const { error } = useNearestStoreFetch();

  return (
    <main className="min-h-screen bg-gray-100 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto bg-white min-h-screen shadow-md relative">
        <Header />

        {error && (
          <div className="px-4 py-2 text-xs text-center text-amber-700 bg-amber-50 border-b border-amber-100">
            📍 Lokasi tidak tersedia. Menampilkan toko utama.
          </div>
        )}

        {/* Hero Banner with auto-rotating carousel */}
        <HeroBanner />

        <CategoryGrid />

        {/* Product Section */}
        <div className="p-4 mt-2 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-[#1a1a1a]">Spesial di Toko Terdekat</h2>
            <button className="text-xs font-bold text-[#00997a]">Lihat Semua</button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <ProductCard name="Bayam Segar 250g" price="4.500" discount={true} />
            <ProductCard name="Ayam Broiler 1kg" price="35.000" />
            <ProductCard name="Apel Fuji 500g" price="22.000" discount={true} />
            <ProductCard name="Beras Premium 5kg" price="65.000" />
            <ProductCard name="Bayam Segar 250g" price="4.500" discount={true} />
            <ProductCard name="Ayam Broiler 1kg" price="35.000" />
            <ProductCard name="Apel Fuji 500g" price="22.000" discount={true} />
            <ProductCard name="Beras Premium 5kg" price="65.000" />
          </div>
        </div>
      </div>
    </main>
  );
}