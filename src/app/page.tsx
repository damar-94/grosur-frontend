// src/app/page.tsx
"use client";

import { useNearestStoreFetch } from "@/hooks/useNearestStore";
import Header from "@/components/Header";
import CategoryGrid from "@/components/CategoryGrid";
import ProductCard from "@/components/ProductCard";

export default function HomePage() {
  const { error } = useNearestStoreFetch();

  return (
    <main className="min-h-screen bg-gray-100 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto bg-white min-h-screen shadow-md relative">
        <Header />
        
        {error && (
          <div className="p-2 text-xs text-center text-red-600 bg-red-50">
            {error}. Menggunakan toko default.
          </div>
        )}

        {/* Hero Banner Placeholder */}
        <div className="p-4">
          <div className="w-full h-32 bg-gradient-to-r from-[#00997a] to-[#59cfb7] rounded-xl shadow-sm flex items-center justify-center text-white font-bold">
            Promo Spesial Hari Ini!
          </div>
        </div>

        <CategoryGrid />

        {/* Product Section */}
        <div className="p-4 mt-2 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-[#1a1a1a]">Spesial di Toko Terdekat</h2>
            <button className="text-xs font-bold text-[#00997a]">Lihat Semua</button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* These will be replaced by your actual API data later */}
            <ProductCard name="Bayam Segar 250g" price="4.500" discount={true} />
            <ProductCard name="Ayam Broiler 1kg" price="35.000" />
            <ProductCard name="Apel Fuji 500g" price="22.000" discount={true} />
            <ProductCard name="Beras Premium 5kg" price="65.000" />
            <ProductCard name="Bayam Segar 250g" price="4.500" discount={true} />
            <ProductCard name="Ayam Broiler 1kg" price="35.000" />
            <ProductCard name="Apel Fuji 500g" price="22.000" discount={true} />
            <ProductCard name="Beras Premium 5kg" price="65.000" />
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