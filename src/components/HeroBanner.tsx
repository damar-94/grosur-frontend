"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

// Import Swiper core and required modules styles
import "swiper/css";
import "swiper/css/pagination";

// Placeholder data (Later this can come from your backend API)
const banners = [
  {
    id: 1,
    title: "Sayuran Segar Panen Hari Ini",
    subtitle: "Diskon spesial hingga 50% khusus di toko terdekatmu.",
    bg: "bg-gradient-to-r from-primary to-accent",
  },
  {
    id: 2,
    title: "Gratis Ongkir Sepuasnya!",
    subtitle: "Tanpa ribet, minimal belanja hanya Rp 50.000.",
    bg: "bg-gradient-to-r from-orange-500 to-yellow-400",
  },
  {
    id: 3,
    title: "Daging & Ayam Premium",
    subtitle: "Kualitas restoran, harga ramah di kantong.",
    bg: "bg-gradient-to-r from-blue-600 to-cyan-500",
  },
];

export default function HeroBanner() {
  return (
    <div className="w-full">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        // Mobile: 180px height & sharp edges. Desktop: up to 400px height & rounded corners
        className="h-[180px] w-full sm:h-[250px] md:h-[350px] lg:h-[400px] md:rounded-xl shadow-sm z-0"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            {/* The actual slide content */}
            <div className={`flex h-full w-full flex-col justify-center px-6 md:px-16 ${banner.bg}`}>
              <h2 className="mb-2 max-w-xl text-xl font-extrabold text-white drop-shadow-sm md:text-3xl lg:text-4xl leading-tight">
                {banner.title}
              </h2>
              <p className="max-w-md text-sm text-white/90 md:text-lg">
                {banner.subtitle}
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Global CSS override for Swiper Pagination Colors to match your Brand */}
      <style jsx global>{`
        .swiper-pagination-bullet {
          background-color: #ffffff;
          opacity: 0.5;
        }
        .swiper-pagination-bullet-active {
          background-color: #ffffff;
          opacity: 1;
        }
      `}</style>
    </div>
  );
}