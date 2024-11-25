
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import { Warning } from '@/types';
import { MapProps } from '@/types/mapTypes';
import { 
  containerStyle, 
  defaultCenter, 
  getMapOptions,
  getDarkModeMapOptions
} from '@/utils/mapUtils';
import { useGeocoding } from '@/hooks/useGeocoding';
import WarningMarkers from './map/WarningMarkers';
import WarningInfoWindow from './map/WarningInfoWindow';
import { Button } from '@/components/ui/button';
import { Moon, Sun, UserLocationIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Define map style type
export type MapStyle = 'standard' | 'dark';

const Map: React.FC<MapProps> = ({ warnings, selectedWarningId, onWarningSelect }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<MapStyle>('standard');
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  
  // Use our custom hook for geocoding
  const { geocodedWarnings, isLoaded, loadError } = useGeocoding(warnings);

  // Store map reference
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Apply custom styles to hide Google attribution
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.classList.add('custom-google-map');
    }
  }, []);

  // Get appropriate map options based on selected style
  const getStyleOptions = useCallback(() => {
    switch (mapStyle) {
      case 'dark':
        return getDarkModeMapOptions();
      default:
        return getMapOptions();
    }
  }, [mapStyle]);

  // Handle reset map view when warnings or filters change
  useEffect(() => {
    if (map && geocodedWarnings.length > 0 && !selectedWarningId) {
      const bounds = new google.maps.LatLngBounds();
      
      geocodedWarnings.forEach(warning => {
        if (warning.geocodedPosition) {
          bounds.extend(warning.geocodedPosition);
        }
      });
      
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
        
        const listener = google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
          map.setZoom(Math.min(15, Math.max(map.getZoom() || 14, 12)));
        });
        
        return () => {
          google.maps.event.removeListener(listener);
        };
      } else {
        map.setCenter(defaultCenter);
        map.setZoom(14);
      }
    }
  }, [map, geocodedWarnings, selectedWarningId]);
  
  // Handle selected warning with smooth animation
  useEffect(() => {
    if (!map || !selectedWarningId) return;
    
    const warning = geocodedWarnings.find(w => w.id === selectedWarningId);
    
    if (warning?.geocodedPosition) {
      map.panTo(warning.geocodedPosition);
      
      const currentZoom = map.getZoom() || 14;
      const targetZoom = 16;
      
      if (currentZoom !== targetZoom) {
        const steps = 10;
        const delay = 20;
        const zoomStep = (targetZoom - currentZoom) / steps;
        
        let step = 0;
        const zoomInterval = setInterval(() => {
          if (step < steps) {
            const newZoom = currentZoom + (zoomStep * (step + 1));
            map.setZoom(newZoom);
            step++;
          } else {
            clearInterval(zoomInterval);
          }
        }, delay);
      }
      
      setTimeout(() => {
        setActiveMarker(selectedWarningId);
      }, 300);
    }
  }, [selectedWarningId, geocodedWarnings, map]);

  // Apply map style changes when style changes
  useEffect(() => {
    if (map) {
      map.setOptions(getStyleOptions());
    }
  }, [map, mapStyle, getStyleOptions]);

  // Synchronize activeMarker with selectedWarningId
  useEffect(() => {
    if (selectedWarningId) {
      setActiveMarker(selectedWarningId);
    } else {
      setActiveMarker(null);
    }
  }, [selectedWarningId]);

  // Update user location marker on the map
  useEffect(() => {
    if (!map || !userLocation) return;

    // Remove existing marker if it exists
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
    }

    // Create a new marker for user location
    userMarkerRef.current = new google.maps.Marker({
      position: userLocation,
      map: map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#4285F4',
        fillOpacity: 0.8,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
        scale: 10,
      },
      title: 'Your Location',
      zIndex: 100
    });

    // Add a pulsing effect circle
    const pulsingCircle = new google.maps.Circle({
      strokeColor: '#4285F4',
      strokeOpacity: 0.5,
      strokeWeight: 2,
      fillColor: '#4285F4',
      fillOpacity: 0.25,
      map: map,
      center: userLocation,
      radius: 50,
      zIndex: 99
    });

    // Animate the circle
    let radius = 50;
    let expanding = true;
    const animation = setInterval(() => {
      if (expanding) {
        radius += 2;
        if (radius >= 80) expanding = false;
      } else {
        radius -= 2;
        if (radius <= 50) expanding = true;
      }
      pulsingCircle.setRadius(radius);
    }, 50);

    return () => {
      clearInterval(animation);
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
      }
      pulsingCircle.setMap(null);
    };
  }, [map, userLocation]);

  // Get user's location
  const getUserLocation = () => {
    if (!map) return;
    
    setLocationLoading(true);
    setLocationError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setUserLocation(userPos);
          
          // Center the map on user's location
          map.panTo(userPos);
          map.setZoom(16);
          
          setLocationLoading(false);
          
          toast({
            title: "Location Found",
            description: "Your current location is now shown on the map",
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError(error.message);
          setLocationLoading(false);
          
          let errorMessage = "Could not access your location.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Please allow location access to use this feature.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
          }
          
          toast({
            title: "Location Error",
            description: errorMessage,
            variant: "destructive",
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
      setLocationLoading(false);
      
      toast({
        title: "Location Not Supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
    }
  };

  const handleMarkerClick = (warningId: string) => {
    onWarningSelect(warningId);
    setActiveMarker(warningId);
  };

  const handleInfoWindowClose = () => {
    setActiveMarker(null);
    onWarningSelect(''); // Close the external popup as well
  };

  // Toggle between map styles
  const toggleMapStyle = () => {
    setMapStyle(current => current === 'standard' ? 'dark' : 'standard');
  };

  // Get button text based on current style
  const getStyleButtonText = () => {
    return mapStyle === 'standard' ? 'Satellite' : 'Dark Mode';
  };

  // Get button icon based on current style
  const getStyleButtonIcon = () => {
    return mapStyle === 'standard' ? <Sun size={14} /> : <Moon size={14} />;
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 p-4">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Google Maps</h3>
          <p className="text-gray-600">
            There was a problem loading Google Maps. Please check your API key and internet connection.
          </p>
        </div>
      </div>
    );
  }

  // Log warnings count for debugging
  console.log(`Rendering map with ${geocodedWarnings.length} warnings, style: ${mapStyle}`);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full">
        {!isLoaded ? (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={14}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={getStyleOptions()}
          >
            <WarningMarkers 
              geocodedWarnings={geocodedWarnings}
              selectedWarningId={selectedWarningId}
              onMarkerClick={handleMarkerClick}
              mapStyle={mapStyle}
            />
            
            <WarningInfoWindow 
              activeMarker={activeMarker}
              geocodedWarnings={geocodedWarnings}
              onCloseClick={handleInfoWindowClose}
            />
          </GoogleMap>
        )}
      </div>

      {/* Map Style Toggle Button */}
      <div className="absolute top-2 left-2 z-10">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white/80 hover:bg-white shadow-md text-xs"
          onClick={toggleMapStyle}
        >
          <span className="mr-1.5">{getStyleButtonIcon()}</span>
          {getStyleButtonText()}
        </Button>
      </div>

      {/* Location Button */}
      <div className="absolute top-2 left-32 z-10">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white/80 hover:bg-white shadow-md text-xs"
          onClick={getUserLocation}
          disabled={locationLoading}
        >
          <span className="mr-1.5">
            {locationLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-target">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="6"></circle>
                <circle cx="12" cy="12" r="2"></circle>
              </svg>
            )}
          </span>
          {locationLoading ? 'Locating...' : 'My Location'}
        </Button>
      </div>

      {/* Custom attribution (replacing Google's) */}
      <div className="absolute bottom-0 right-0 m-1 p-1 text-[8px] text-gray-500 bg-white/50 rounded z-10">
        Map data © UC Berkeley
      </div>
    </div>
  );
};

export default Map;
