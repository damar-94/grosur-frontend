"use client";

import HeroBanner from "@/components/HeroBanner";

export default function HomePage() {
  return (
    // Note: The background color is inherited from globals.css (--background)
    <div className="mx-auto max-w-[1200px] space-y-4 pb-20 pt-0 md:space-y-6 md:px-6 md:pt-6">

      {/* Hero Section 
        On mobile, it touches the screen edges. On desktop, it respects the md:px-6 padding.
      */}
      <section>
        <HeroBanner />
      </section>

      {/* Placeholder for Category Section */}
      <section className="bg-card px-4 py-4 md:rounded-xl md:p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-foreground">Kategori Pilihan</h2>
        <div className="h-24 w-full rounded-lg border-2 border-dashed border-muted bg-muted/20 flex items-center justify-center text-muted-foreground text-sm">
          [ Komponen Kategori Akan Datang ]
        </div>
      </section>

      {/* Placeholder for Product Grid (Task US-1.7.2) */}
      <section className="bg-card px-4 py-4 md:rounded-xl md:p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Spesial di Toko Terdekat</h2>
          <button className="text-sm font-bold text-primary hover:text-primary-light transition-colors">
            Lihat Semua
          </button>
        </div>

        <div className="h-64 w-full rounded-lg border-2 border-dashed border-muted bg-muted/20 flex items-center justify-center text-muted-foreground text-sm">
          [ Komponen Grid Produk Akan Datang ]
        </div>
      </section>

    </div>
  );
}