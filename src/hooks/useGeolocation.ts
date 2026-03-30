import { useState, useEffect } from "react";

interface LocationState {
  coordinates: { lat: number; lng: number } | null;
  error: string | null;
  isLoading: boolean;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<LocationState>({
    coordinates: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    // Check if the browser supports geolocation
    if (!navigator.geolocation) {
      setLocation({
        coordinates: null,
        error: "Browser Anda tidak mendukung fitur lokasi.",
        isLoading: false,
      });
      return;
    }

    // Request the location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          error: null,
          isLoading: false,
        });
      },
      (error) => {
        // Handle different error codes (denied, unavailable, timeout)
        let errorMessage = "Gagal mendapatkan lokasi.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Izin lokasi ditolak. Silakan izinkan akses lokasi di pengaturan browser Anda.";
        }

        setLocation({
          coordinates: null,
          error: errorMessage,
          isLoading: false,
        });
      }
    );
  }, []);

  return location;
};