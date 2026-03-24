// src/components/HeroBanner.tsx
"use client";

import { useState, useEffect, useCallback } from "react";

const slides = [
  {
    id: 1,
    tag: "Promo Hari Ini",
    title: "Belanja Sayur & Buah\nSegar Langsung\nke Pintu Rumahmu",
    subtitle: "Dapatkan diskon hingga 30% untuk produk pilihan setiap hari",
    cta: "Belanja Sekarang",
    bg: "from-[#00997a] via-[#00b991] to-[#59cfb7]",
    badge: "🥬 Sayur Segar",
  },
  {
    id: 2,
    tag: "Flash Sale",
    title: "Daging & Protein\nBerkualitas Tinggi\nHarga Terjangkau",
    subtitle: "Tersedia stok segar setiap pagi dari peternak pilihan",
    cta: "Lihat Flash Sale",
    bg: "from-[#e85d04] via-[#f48c06] to-[#faa307]",
    badge: "🥩 Daging Segar",
  },
  {
    id: 3,
    tag: "Gratis Ongkir",
    title: "Gratis Ongkos Kirim\nMinimum Belanja\nRp 100.000",
    subtitle: "Berlaku untuk semua kurir JNE, POS, dan TIKI",
    cta: "Gunakan Voucher",
    bg: "from-[#7209b7] via-[#9b2226] to-[#ae2012]",
    badge: "🚚 Gratis Ongkir",
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);

  useEffect(() => {
    const id = setInterval(next, 4500);
    return () => clearInterval(id);
  }, [next]);

  const slide = slides[current];

  return (
    <div className="relative mx-4 mt-4 mb-2 overflow-hidden rounded-2xl shadow-lg select-none">
      {/* Background */}
      <div className={`bg-gradient-to-br ${slide.bg} transition-all duration-700`}>
        <div className="relative px-6 py-8 md:px-10 md:py-12">
          {/* Tag pill */}
          <span className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-wider uppercase bg-white/20 text-white rounded-full backdrop-blur-sm">
            {slide.tag}
          </span>

          {/* Title */}
          <h1 className="whitespace-pre-line text-2xl md:text-4xl font-extrabold text-white leading-tight mb-3">
            {slide.title}
          </h1>

          {/* Subtitle */}
          <p className="text-sm md:text-base text-white/80 mb-6 max-w-md">
            {slide.subtitle}
          </p>

          {/* CTA */}
          <button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-white text-[#1a1a1a] rounded-xl shadow hover:shadow-md active:scale-95 transition-all">
            {slide.cta}
            <span>→</span>
          </button>

          {/* Floating badge */}
          <div className="absolute top-6 right-6 hidden md:flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 text-4xl shadow-lg">
            {slide.badge.split(" ")[0]}
          </div>
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/25 text-white hover:bg-black/40 transition"
      >
        ‹
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/25 text-white hover:bg-black/40 transition"
      >
        ›
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "w-6 bg-white" : "w-1.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
