"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { api } from "@/lib/axiosInstance";
import Image from "next/image";
import Link from "next/link";

// Import Swiper core and required modules styles
import "swiper/css";
import "swiper/css/pagination";

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  bgGradient?: string;
  contentColor: string;
  linkUrl?: string;
  showText?: boolean;
}

export default function HeroBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await api.get("/banners");
        setBanners(res.data.data);
      } catch (error) {
        console.error("Failed to fetch banners", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  if (loading) {
    return (
      <div className="h-[100px] w-full sm:h-[150px] md:h-[200px] lg:h-[285px] md:rounded-xl bg-gray-100 animate-pulse flex items-center justify-center">
        <p className="text-gray-400 text-sm">Memuat promo...</p>
      </div>
    );
  }

  // Fallback if no banners are available
  if (banners.length === 0) {
    return (
      <div className="h-[100px] w-full sm:h-[150px] md:h-[200px] lg:h-[285px] md:rounded-xl bg-gradient-to-r from-primary to-accent flex flex-col justify-center px-6 md:px-16 shadow-sm">
        <h2 className="mb-2 max-w-xl text-xl font-extrabold text-white drop-shadow-sm md:text-3xl lg:text-4xl leading-tight text-white">
          Selamat Datang di Grosur
        </h2>
        <p className="max-w-md text-sm text-white/90 md:text-lg text-white">
          Kebutuhan harianmu, diantar langsung ke pintu.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        loop={banners.length > 1}
        autoplay={banners.length > 1 ? {
          delay: 4000,
          disableOnInteraction: false,
        } : false}
        pagination={banners.length > 1 ? {
          clickable: true,
          dynamicBullets: true,
        } : false}
        className="h-[100px] w-full sm:h-[150px] md:h-[200px] lg:h-[285px] md:rounded-xl shadow-sm z-0"
      >
        {banners.map((banner) => {
          const SlideContent = (
            <div className={`relative flex h-full w-full flex-col justify-center px-6 md:px-16 overflow-hidden ${!banner.imageUrl ? banner.bgGradient : "bg-gray-100"}`}>
              {banner.imageUrl && (
                <Image 
                   src={banner.imageUrl} 
                   alt={banner.title} 
                   fill 
                   priority
                   className="object-cover z-0" 
                />
              )}
              
              {/* Overlay content - always on top of image or gradient */}
              {banner.showText !== false && (
                <div className={`relative z-10 ${banner.contentColor}`}>
                  <h2 className="mb-2 max-w-xl text-xl font-extrabold drop-shadow-md md:text-3xl lg:text-4xl leading-tight">
                    {banner.title}
                  </h2>
                  {banner.subtitle && (
                    <p className="max-w-md text-sm opacity-90 md:text-lg drop-shadow-md">
                      {banner.subtitle}
                    </p>
                  )}
                </div>
              )}
            </div>
          );

          return (
            <SwiperSlide key={banner.id}>
              {banner.linkUrl ? (
                <Link href={banner.linkUrl} className="block h-full w-full">
                  {SlideContent}
                </Link>
              ) : (
                SlideContent
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>

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