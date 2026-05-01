import { useState, useEffect } from "react";
import { useLocationStore } from "@/stores/useLocationStore";

export const useGeolocation = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Connect to Zustand Actions
  const { latitude, longitude, setLocation, setLocationDenied } = useLocationStore();

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Browser Anda tidak mendukung fitur lokasi.");
      setLocationDenied(true);
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Save globally to Zustand
        setLocation(position.coords.latitude, position.coords.longitude);
        setError(null);
        setIsLoading(false);
      },
      (err) => {
        let errorMessage = "Gagal mendapatkan lokasi.";
        if (err.code === err.PERMISSION_DENIED) {
          errorMessage = "Izin lokasi ditolak. Menggunakan toko utama.";
        }

        // Trigger fallback globally
        setLocationDenied(true);
        setError(errorMessage);
        setIsLoading(false);
      }
    );
  }, [setLocation, setLocationDenied]);

  return { 
    isLoading, 
    error, 
    coordinates: latitude && longitude ? { lat: latitude, lng: longitude } : null 
  };
};