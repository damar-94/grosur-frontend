import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "image.astronauts.cloud",
      },
      {
        protocol: "https",
        hostname: "www.jni.co.id",
      },
      {
        protocol: "https",
        hostname: "www.static-src.com",
      },
      {
        protocol: "https",
        hostname: "down-id.img.susercontent.com",
      },
    ],
  },
};

export default nextConfig;
