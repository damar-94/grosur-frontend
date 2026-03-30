"use client";

import HeroBanner from "@/components/HeroBanner";
import ProductGridPlaceholder from "@/components/product/ProductGridPlaceholder";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-4 pb-20 pt-0 md:space-y-6 md:px-6 md:pt-6">

      <section>
        <HeroBanner />
      </section>

      {/* Categories Placeholder */}
      <section className="bg-card px-4 py-4 md:rounded-xl md:p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-foreground">Kategori Pilihan</h2>
        <div className="h-24 w-full rounded-lg border-2 border-dashed border-muted bg-muted/20 flex items-center justify-center text-muted-foreground text-sm">
          [ Komponen Kategori Akan Datang ]
        </div>
      </section>

      {/* Product Grid Section */}
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

        {/* Render our new Grid Component */}
        <ProductGridPlaceholder />

      </section>

    </div>
  );
}
