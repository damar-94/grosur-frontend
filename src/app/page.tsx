"use client";

import { useNearestStoreFetch } from "@/hooks/useNearestStore";
import Header from "@/components/Header";
import CategoryGrid from "@/components/CategoryGrid";
import ProductCard from "@/components/ProductCard";
import HeroBanner from "@/components/HeroBanner";

export default function HomePage() {
  const { error } = useNearestStoreFetch();

  return (
    // 1. Tokopedia style base: Soft gray background, bottom padding for mobile nav, no bottom padding on desktop
    <main className="min-h-screen bg-[#f3f4f5] pb-20 md:pb-8 font-sans">

      {/* 2. Sticky Header (Assuming your Header component has fixed/sticky positioning) */}
      <Header />

      {/* 3. Main Content Container: Max width 1200px for desktop, centered */}
      <div className="max-w-[1200px] mx-auto px-0 md:px-4 pt-4 md:pt-6 space-y-4 md:space-y-6">

        {error && (
          <div className="mx-4 md:mx-0 px-4 py-3 text-sm text-center text-amber-700 bg-amber-50 border border-amber-200 rounded-lg shadow-sm">
            📍 Lokasi tidak tersedia. Menampilkan produk dari toko utama kami.
          </div>
        )}

        {/* Hero Section: Full width on mobile, rounded corners with shadow on desktop */}
        <section className="bg-white md:rounded-xl md:shadow-sm overflow-hidden">
          <HeroBanner />
        </section>

        {/* Category Section */}
        <section className="bg-white p-4 md:p-6 md:rounded-xl md:shadow-sm">
          <h2 className="text-base md:text-lg font-bold text-[#1a1a1a] mb-4">Kategori Pilihan</h2>
          <CategoryGrid />
        </section>

        {/* Product Grid Section */}
        <section className="bg-white p-4 md:p-6 md:rounded-xl md:shadow-sm">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h2 className="text-base md:text-xl font-bold text-[#1a1a1a]">
              Spesial di Toko Terdekat
            </h2>
            <button className="text-sm font-bold text-[#00997a] hover:text-[#007a61] transition-colors">
              Lihat Semua
            </button>
          </div>

          {/* Responsive Grid Magic:
            - Mobile (Default): 2 columns, small gap
            - Tablet (md): 4 columns, larger gap
            - Desktop (lg): 5 columns
            - Widescreen (xl): 6 columns 
          */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {/* Example Products - Replace with mapping your actual data later */}
            <ProductCard name="Bayam Segar 250g" price="4.500" discount={true} />
            <ProductCard name="Ayam Broiler 1kg" price="35.000" />
            <ProductCard name="Apel Fuji 500g" price="22.000" discount={true} />
            <ProductCard name="Beras Premium 5kg" price="65.000" />
            <ProductCard name="Telur Ayam Kampung 10pcs" price="28.000" />
            <ProductCard name="Susu UHT Full Cream 1L" price="18.500" discount={true} />

            {/* Duplicate for visual grid testing */}
            <ProductCard name="Bayam Segar 250g" price="4.500" discount={true} />
            <ProductCard name="Ayam Broiler 1kg" price="35.000" />
            <ProductCard name="Apel Fuji 500g" price="22.000" discount={true} />
            <ProductCard name="Beras Premium 5kg" price="65.000" />
            <ProductCard name="Telur Ayam Kampung 10pcs" price="28.000" />
            <ProductCard name="Susu UHT Full Cream 1L" price="18.500" discount={true} />
          </div>
        </section>

      </div>
    </main>
  );
}