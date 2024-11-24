import { useState, useRef, useEffect } from 'react';
import { Warning } from '@/types';
import { GeocodedWarning, GOOGLE_MAPS_API_KEY } from '@/types/mapTypes';
import { useJsApiLoader } from '@react-google-maps/api';

const BERKELEY_NEIGHBORHOODS = [
  { name: 'Downtown Berkeley', lat: 37.8703, lng: -122.2670 },
  { name: 'South Berkeley', lat: 37.8575, lng: -122.2680 },
  { name: 'Telegraph Avenue', lat: 37.8668, lng: -122.2580 },
  { name: 'Southside', lat: 37.8646, lng: -122.2570 },
  { name: 'North Berkeley', lat: 37.8762, lng: -122.2680 },
  { name: 'Northside', lat: 37.8758, lng: -122.2608 },
  { name: 'West Berkeley', lat: 37.8654, lng: -122.2927 },
  { name: 'UC Berkeley', lat: 37.8719, lng: -122.2585 },
  { name: 'Sproul Plaza', lat: 37.8692, lng: -122.2591 },
  { name: 'Memorial Glade', lat: 37.8736, lng: -122.2601 },
  { name: 'Berkeley Marina', lat: 37.8656, lng: -122.3153 },
  { name: 'Elmwood', lat: 37.8567, lng: -122.2520 },
  { name: 'Gourmet Ghetto', lat: 37.8794, lng: -122.2684 },
  { name: 'Clark Kerr Campus', lat: 37.8628, lng: -122.2441 },
  { name: 'International House', lat: 37.8702, lng: -122.2511 },
  { name: 'Berkeley Hills', lat: 37.8812, lng: -122.2428 }
];

export const useGeocoding = (warnings: Warning[]) => {
  const [geocodedWarnings, setGeocodedWarnings] = useState<GeocodedWarning[]>([]);
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  useEffect(() => {
    if (isLoaded && !geocoder.current) {
      geocoder.current = new google.maps.Geocoder();
    }
  }, [isLoaded]);

  const getNeighborhoodForWarning = (warning: Warning) => {
    if (warning.type === 'shots_fired') {
      const southSideLocations = BERKELEY_NEIGHBORHOODS.filter(n => 
        n.name.includes('South') || n.name === 'Telegraph Avenue');
      return southSideLocations[Math.floor(Math.random() * southSideLocations.length)];
    }
    
    if (warning.type === 'robbery') {
      const commercialAreas = BERKELEY_NEIGHBORHOODS.filter(n => 
        n.name.includes('Downtown') || n.name === 'Telegraph Avenue' || n.name === 'Southside');
      return commercialAreas[Math.floor(Math.random() * commercialAreas.length)];
    }

    if (warning.description.toLowerCase().includes('theft') || 
        warning.description.toLowerCase().includes('stolen') ||
        warning.title.toLowerCase().includes('theft')) {
      const commercialAreas = BERKELEY_NEIGHBORHOODS.filter(n => 
        n.name.includes('Downtown') || n.name === 'Telegraph Avenue' || n.name === 'Southside');
      return commercialAreas[Math.floor(Math.random() * commercialAreas.length)];
    }

    if (warning.location.toLowerCase().includes('dormitory') || 
        warning.location.toLowerCase().includes('residence hall')) {
      const residenceAreas = BERKELEY_NEIGHBORHOODS.filter(n => 
        n.name === 'UC Berkeley' || n.name === 'Southside' || n.name === 'Clark Kerr Campus' || 
        n.name === 'Northside' || n.name === 'International House');
      return residenceAreas[Math.floor(Math.random() * residenceAreas.length)];
    }
    
    return BERKELEY_NEIGHBORHOODS[Math.floor(Math.random() * BERKELEY_NEIGHBORHOODS.length)];
  };

  const randomizePosition = (basePosition: { lat: number, lng: number }) => {
    const randomOffsetLat = (Math.random() - 0.5) * 0.005;
    const randomOffsetLng = (Math.random() - 0.5) * 0.005;
    
    return {
      lat: basePosition.lat + randomOffsetLat,
      lng: basePosition.lng + randomOffsetLng
    };
  };

  useEffect(() => {
    if (!isLoaded || !geocoder.current) return;

    const geocodeWarnings = async () => {
      const results: GeocodedWarning[] = [];

      for (const warning of warnings) {
        try {
          let geocodedPosition;
          
          if (warning.location && warning.location.trim() !== '') {
            try {
              const response = await geocoder.current!.geocode({
                address: `${warning.location}, Berkeley, CA`
              });
              
              if (response.results[0]) {
                geocodedPosition = {
                  lat: response.results[0].geometry.location.lat(),
                  lng: response.results[0].geometry.location.lng()
                };
              }
            } catch (error) {
              console.log(`Could not geocode specific location: ${warning.location}`);
            }
          }
          
          if (!geocodedPosition) {
            const neighborhood = getNeighborhoodForWarning(warning);
            geocodedPosition = randomizePosition(neighborhood);
          }
          
          results.push({
            ...warning,
            geocodedPosition
          });
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
