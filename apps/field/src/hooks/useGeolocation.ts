/**
 * useGeolocation.ts — GPS position hook wrapping the Geolocation API.
 * Returns null when GPS unavailable (indoor, permission denied).
 */
import { useState, useCallback } from 'react';

export interface GeoPosition {
  lat: number;
  lon: number;
  accuracy: number; // metres
}

export interface UseGeolocationReturn {
  isSupported: boolean;
  position: GeoPosition | null;
  isLocating: boolean;
  error: string | null;
  getPosition: () => Promise<void>;
  clearPosition: () => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSupported =
    typeof navigator !== 'undefined' && 'geolocation' in navigator;

  const getPosition = useCallback(async () => {
    if (!isSupported) {
      setError('GPS not available on this device');
      return;
    }
    setIsLocating(true);
    setError(null);

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000,
        });
      });
      setPosition({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      });
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Position unavailable');
            break;
          case err.TIMEOUT:
            setError('Location request timed out');
            break;
        }
      } else {
        setError('GPS error');
      }
    } finally {
      setIsLocating(false);
    }
  }, [isSupported]);

  const clearPosition = useCallback(() => {
    setPosition(null);
    setError(null);
  }, []);

  return { isSupported, position, isLocating, error, getPosition, clearPosition };
}
