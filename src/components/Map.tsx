
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

// Zoom restrictions for Berkeley area
const MIN_ZOOM = 16; // Most zoomed out (campus level)
const MAX_ZOOM = 19; // Most zoomed in (building level)

// Berkeley area boundaries (approximate)
const BERKELEY_BOUNDS = {
  north: 37.9065, // North boundary
  south: 37.8485, // South boundary
  west: -122.3155, // West boundary
  east: -122.2235, // East boundary
};

// Custom styles to hide Google's logos and attributions
const mapStyles = [
  {
    featureType: "administrative",
    elementType: "labels.text",
    stylers: [{ visibility: "on" }]
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "road",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#e9e9e9" }]
  }
];

const Map: React.FC<MapProps> = ({ warnings, selectedWarningId, onWarningSelect }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  
  // Load the Google Maps JS API with your API key
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  // Store map reference and apply restrictions
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    
    // Set zoom restrictions
    map.setOptions({
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      restriction: {
        latLngBounds: BERKELEY_BOUNDS,
        strictBounds: false // Allow small amount of panning outside bounds
      }
    });
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Apply custom styles to hide Google attribution
  useEffect(() => {
    if (mapRef.current) {
      // Add a custom class to help target Google elements
      mapRef.current.classList.add('custom-google-map');
    }
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
      const targetZoom = Math.min(16, MAX_ZOOM); // Limit to max zoom
      
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

  // Check if a warning is of a high-danger type
  const isHighDangerWarning = (type: WarningType): boolean => {
    return ['violent_crime', 'shots_fired', 'robbery'].includes(type);
  };

  // Get marker options based on warning type
  const getMarkerOptions = useCallback((warning: Warning) => {
    const color = getWarningTypeColor(warning.type);
    const isSelected = warning.id === selectedWarningId;
    const isHighDanger = isHighDangerWarning(warning.type);
    
    // Base marker properties
    const scale = isSelected ? 10 : (isHighDanger ? 9 : 8);
    const zIndex = isHighDanger ? 10 : 1;
    const animation = isSelected 
      ? google.maps.Animation.BOUNCE 
      : (isHighDanger ? google.maps.Animation.DROP : undefined);
    
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: isHighDanger ? 0.9 : 0.7,
      strokeColor: '#FFFFFF',
      strokeWeight: isHighDanger ? 2.5 : 2,
      scale: scale,
      zIndex: zIndex,
      animation: animation
    };
  }, [selectedWarningId]);

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
      <div ref={mapRef} className="w-full h-full">
        {!isLoaded ? (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={16}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              disableDefaultUI: false, // Enable UI controls
              zoomControl: true,      // Show zoom controls
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
              clickableIcons: false,
              mapTypeId: google.maps.MapTypeId.SATELLITE, // Satellite view
              styles: mapStyles,
              gestureHandling: "greedy",
              minZoom: MIN_ZOOM,
              maxZoom: MAX_ZOOM
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
                      icon={getMarkerOptions(warning)}
                      zIndex={isHighDangerWarning(warning.type) ? 10 : 1}
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

      {/* Custom attribution (replacing Google's) */}
      <div className="absolute bottom-0 right-0 m-1 p-1 text-[8px] text-gray-500 bg-white/50 rounded z-10">
        Map data © UC Berkeley
      </div>
    </div>
  );
};

export default Map;
