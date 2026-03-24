// src/hooks/useGeolocation.ts
import { useState } from "react";

type GeoLocation = { lat: number; lng: number } | null;

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeoLocation>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  };

  return { location, error, loading, requestLocation };
};