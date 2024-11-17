
import { useState, useRef, useEffect } from 'react';
import { Warning } from '@/types';
import { GeocodedWarning, GOOGLE_MAPS_API_KEY } from '@/types/mapTypes';
import { useJsApiLoader } from '@react-google-maps/api';

export const useGeocoding = (warnings: Warning[]) => {
  const [geocodedWarnings, setGeocodedWarnings] = useState<GeocodedWarning[]>([]);
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  
  // Load the Google Maps JS API with API key
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places', 'visualization']
  });

  // Initialize geocoder when maps API is loaded
  useEffect(() => {
    if (isLoaded && !geocoder.current) {
      geocoder.current = new google.maps.Geocoder();
    }
  }, [isLoaded]);

  // Geocode warnings when they change
  useEffect(() => {
    if (!isLoaded || !geocoder.current) return;

    const geocodeWarnings = async () => {
      const results: GeocodedWarning[] = [];

      for (const warning of warnings) {
        try {
          // Add "UC Berkeley" to the location for better accuracy
          const response = await geocoder.current!.geocode({
            address: `${warning.location}, UC Berkeley, Berkeley, CA`
          });

          if (response.results[0]) {
            results.push({
              ...warning,
              geocodedPosition: {
                lat: response.results[0].geometry.location.lat(),
                lng: response.results[0].geometry.location.lng()
              }
            });
          }
        } catch (error) {
          console.error(`Error geocoding warning ${warning.id}:`, error);
        }
      }

      setGeocodedWarnings(results);
    };

    geocodeWarnings();
  }, [warnings, isLoaded]);

  return { geocodedWarnings, isLoaded, loadError };
};
