
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

  // Get appropriate marker icon based on warning type
  const getMarkerIcon = useCallback((warning: Warning) => {
    const color = getWarningTypeColor(warning.type);
    const isSelected = warning.id === selectedWarningId;
    
    // Define shape based on warning type
    let path: google.maps.SymbolPath | string;
    let scale: number = isSelected ? 10 : 8;
    
    // Choose shape based on warning type
    switch (warning.type) {
      case 'fire':
      case 'hazmat':
        // Triangle for fire and hazardous situations
        path = google.maps.SymbolPath.BACKWARD_CLOSED_ARROW;
        break;
      case 'police':
      case 'protest':
        // Star for police activities and protests
        path = google.maps.SymbolPath.FORWARD_CLOSED_ARROW;
        break;
      case 'earthquake':
        // Circle for earthquakes
        path = google.maps.SymbolPath.CIRCLE;
        break;
      case 'weather':
        // Use a custom square path for weather warnings since RECTANGLE doesn't exist
        path = 'M -5,-5 L 5,-5 L 5,5 L -5,5 Z';
        break;
      case 'power':
      default:
        // Circle for other warnings
        path = google.maps.SymbolPath.CIRCLE;
    }
    
    // Configure marker appearance
    return {
      path,
      fillColor: color,
      fillOpacity: 0.8,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      scale,
      // Add animation for selected marker or high severity
      animation: isSelected || warning.severity === 'high' 
        ? google.maps.Animation.BOUNCE 
        : google.maps.Animation.DROP
    };
  }, [selectedWarningId]);

  // Create pulsing marker effect
  const createPulsingMarker = useCallback((warning: Warning) => {
    const color = getWarningTypeColor(warning.type);
    const isSelected = warning.id === selectedWarningId;
    const isHighSeverity = warning.severity === 'high';
    
    // Define pulsing animation class
    const pulsingClass = isHighSeverity || isSelected ? 'animate-ping' : '';
    
    // Only fire, police, and hazmat warnings should pulse
    const shouldPulse = ['fire', 'police', 'hazmat'].includes(warning.type) || isHighSeverity;
    
    // Create a custom SVG marker
    const svgMarker = {
      path: "M -1,0 A 1,1 0 0 0 -3,0 1,1 0 0 0 -1,0M 1,0 A 1,1 0 0 1 3,0 1,1 0 0 1 1,0M -3,3 Q 0,5 3,3",
      fillColor: color,
      fillOpacity: 0.8,
      strokeColor: "#FFFFFF",
      strokeWeight: 2,
      scale: isSelected ? 3 : 2.5,
      // Add a bounce animation for selected marker
      animation: isSelected ? google.maps.Animation.BOUNCE : null
    };
    
    return svgMarker;
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
                    icon={getMarkerIcon(warning)}
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
