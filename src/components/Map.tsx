
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, MarkerClusterer } from '@react-google-maps/api';
import { Warning } from '@/types';
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
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE,
                      fillColor: getWarningTypeColor(warning.type),
                      fillOpacity: 1,
                      strokeColor: '#FFFFFF',
                      strokeWeight: 2,
                      scale: 8,
                    }}
                    animation={google.maps.Animation.DROP}
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
