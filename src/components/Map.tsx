
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
import { Moon, Sun } from 'lucide-react';

// Define map style type
export type MapStyle = 'standard' | 'dark';

const Map: React.FC<MapProps> = ({ warnings, selectedWarningId, onWarningSelect }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<MapStyle>('standard');
  const mapRef = useRef<HTMLDivElement>(null);
  
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

  const handleMarkerClick = (warningId: string) => {
    onWarningSelect(warningId);
    setActiveMarker(warningId);
  };

  const handleInfoWindowClose = () => {
    setActiveMarker(null);
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

      {/* Custom attribution (replacing Google's) */}
      <div className="absolute bottom-0 right-0 m-1 p-1 text-[8px] text-gray-500 bg-white/50 rounded z-10">
        Map data © UC Berkeley
      </div>
    </div>
  );
};

export default Map;
