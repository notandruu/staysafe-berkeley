
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, MarkerClusterer, Circle } from '@react-google-maps/api';
import { Warning, WarningType } from '@/types';
import { getWarningTypeColor } from '@/services/warningService';
import { cn } from '@/lib/utils';

// Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyAJ5I98cSgM_DVo3MGcCzX6eU75LXYYxIs';

interface MapProps {
  warnings: Warning[];
  selectedWarningId: string | null;
  onWarningSelect: (warningId: string) => void;
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 37.8719, // UC Berkeley coordinates
  lng: -122.2590
};

const Map: React.FC<MapProps> = ({ warnings, selectedWarningId, onWarningSelect }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  
  // Load the Google Maps JS API with your API key
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  // Store map reference
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Handle selected warning with smooth animation
  useEffect(() => {
    if (!map || !selectedWarningId) return;
    
    const warning = warnings.find(w => w.id === selectedWarningId);
    
    if (warning) {
      // Smooth pan to the marker position
      map.panTo({
        lat: warning.coordinates.latitude,
        lng: warning.coordinates.longitude
      });
      
      // Smooth zoom animation
      const currentZoom = map.getZoom() || 14;
      const targetZoom = 16;
      
      if (currentZoom !== targetZoom) {
        // Only animate zoom if we're not already at the target zoom level
        const steps = 10; // Number of steps in the animation
        const delay = 20; // Milliseconds between steps
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
      
      // Show info window with a slight delay to let the animation finish
      setTimeout(() => {
        setActiveMarker(selectedWarningId);
      }, 300);
    }
  }, [selectedWarningId, warnings, map]);

  const handleMarkerClick = (warningId: string) => {
    onWarningSelect(warningId);
    setActiveMarker(warningId);
  };

  const handleInfoWindowClose = () => {
    setActiveMarker(null);
  };

  // Get appropriate marker icon based on warning type
  const getMarkerIcon = useCallback((warning: Warning) => {
    const color = getWarningTypeColor(warning.type);
    const isSelected = warning.id === selectedWarningId;
    
    // Custom icon paths based on warning type
    switch (warning.type) {
      case 'violent_crime':
        // Fist icon for violent crime
        return {
          path: "M 0,0 m -3,0 a 3,3 0 1,0 6,0 a 3,3 0 1,0 -6,0 M -1,-3 L -1,0 L 1,0 L 1,-3 L 2,-2 L 0,-4 L -2,-2 Z", // Fist-like shape
          fillColor: color,
          fillOpacity: 0.9,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
          scale: isSelected ? 4 : 3,
          animation: google.maps.Animation.BOUNCE
        };
      
      case 'shots_fired':
        // Target icon for shots fired
        return {
          path: "M -1,0 A 1,1 0 0 0 -3,0 1,1 0 0 0 -1,0M 1,0 A 1,1 0 0 1 3,0 1,1 0 0 1 1,0M -2,-2 Q 0.5,-3 2,-2M -2,2 Q 0.5,3 2,2M -3,0 Q -2,0.5 0,0 Q 2,0.5 3,0", // Target-like shape
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
          scale: isSelected ? 5 : 4,
          animation: google.maps.Animation.BOUNCE
        };
        
      case 'robbery':
        // Shopping bag icon for robbery
        return {
          path: "M -3,-2 L -3,3 L 3,3 L 3,-2 L 2,-2 L 2,-3 L -2,-3 L -2,-2 Z", // Bag-like shape
          fillColor: color,
          fillOpacity: 0.9,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
          scale: isSelected ? 3 : 2.5,
          animation: isSelected ? google.maps.Animation.BOUNCE : google.maps.Animation.DROP
        };
        
      case 'fire':
        // Flame icon
        return {
          path: "M 0,0 m -2,-2 q 2,-3 4,0 q 2,3 -2,5 q -4,-2 -2,-5 z", // Flame-like shape
          fillColor: color,
          fillOpacity: 0.9,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
          scale: isSelected ? 3 : 2.5,
          animation: isSelected ? google.maps.Animation.BOUNCE : google.maps.Animation.DROP
        };
        
      default:
        // Default circular marker for other warning types
        return {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 0.8,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
          scale: isSelected ? 10 : 8,
          animation: isSelected ? google.maps.Animation.BOUNCE : google.maps.Animation.DROP
        };
    }
  }, [selectedWarningId]);

  // Check if a warning is of a high-danger type
  const isHighDangerWarning = (type: WarningType): boolean => {
    return ['violent_crime', 'shots_fired', 'robbery'].includes(type);
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

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
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
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          }}
        >
          {/* Add red circles for shots fired warnings */}
          {warnings
            .filter(warning => warning.type === 'shots_fired')
            .map(warning => (
              <Circle
                key={`circle-${warning.id}`}
                center={{
                  lat: warning.coordinates.latitude,
                  lng: warning.coordinates.longitude
                }}
                options={{
                  strokeColor: '#FF0000',
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                  fillColor: '#FF0000',
                  fillOpacity: 0.2,
                  radius: 100, // 100 meters radius
                  zIndex: 1
                }}
              />
            ))
          }

          <MarkerClusterer
            options={{
              imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
              gridSize: 50,
              minimumClusterSize: 3,
              zoomOnClick: true,
              averageCenter: true,
            }}
          >
            {(clusterer) => (
              <>
                {warnings.map(warning => (
                  <Marker
                    key={warning.id}
                    position={{
                      lat: warning.coordinates.latitude,
                      lng: warning.coordinates.longitude
                    }}
                    onClick={() => handleMarkerClick(warning.id)}
                    icon={getMarkerIcon(warning)}
                    zIndex={isHighDangerWarning(warning.type) ? 10 : 1} // High-danger warnings appear on top
                    clusterer={clusterer}
                  />
                ))}
              </>
            )}
          </MarkerClusterer>

          {activeMarker && (
            <InfoWindow
              position={{
                lat: warnings.find(w => w.id === activeMarker)?.coordinates.latitude || 0,
                lng: warnings.find(w => w.id === activeMarker)?.coordinates.longitude || 0
              }}
              onCloseClick={handleInfoWindowClose}
            >
              <div className="warning-popup p-1 max-w-[200px]">
                <h3 className="text-sm font-semibold mb-1">
                  {warnings.find(w => w.id === activeMarker)?.title}
                </h3>
                <p className="text-xs text-gray-600">
                  {warnings.find(w => w.id === activeMarker)?.location}
                </p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      )}
    </div>
  );
};

export default Map;
