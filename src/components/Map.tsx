
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

interface GeocodedWarning extends Warning {
  geocodedPosition?: {
    lat: number;
    lng: number;
  };
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 37.8719, // UC Berkeley coordinates
  lng: -122.2590
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
  const [geocodedWarnings, setGeocodedWarnings] = useState<GeocodedWarning[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  
  // Load the Google Maps JS API with your API key
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
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
          } else {
            // Fallback to provided coordinates if geocoding fails
            results.push({
              ...warning,
              geocodedPosition: {
                lat: warning.coordinates.latitude,
                lng: warning.coordinates.longitude
              }
            });
          }
        } catch (error) {
          console.error(`Error geocoding warning ${warning.id}:`, error);
          // Fallback to provided coordinates
          results.push({
            ...warning,
            geocodedPosition: {
              lat: warning.coordinates.latitude,
              lng: warning.coordinates.longitude
            }
          });
        }
      }

      setGeocodedWarnings(results);
    };

    geocodeWarnings();
  }, [warnings, isLoaded]);

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
    
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: isHighDanger ? 0.9 : 0.7,
      strokeColor: '#FFFFFF',
      strokeWeight: isHighDanger ? 2.5 : 2,
      scale: isSelected ? 10 : (isHighDanger ? 9 : 8),
      zIndex: isHighDanger ? 10 : 1,
      animation: isSelected 
        ? google.maps.Animation.BOUNCE 
        : (isHighDanger ? google.maps.Animation.DROP : undefined)
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

  // Log warnings count for debugging
  console.log(`Rendering map with ${geocodedWarnings.length} warnings`);

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
            options={{
              disableDefaultUI: false,
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
              clickableIcons: false,
              mapTypeId: google.maps.MapTypeId.ROADMAP,
              styles: mapStyles,
              gestureHandling: "greedy"
            }}
          >
            {/* Add red circles for shots fired warnings */}
            {geocodedWarnings
              .filter(warning => warning.type === 'shots_fired')
              .map(warning => (
                warning.geocodedPosition && (
                  <Circle
                    key={`circle-${warning.id}`}
                    center={warning.geocodedPosition}
                    options={{
                      strokeColor: '#FF0000',
                      strokeOpacity: 0.8,
                      strokeWeight: 2,
                      fillColor: '#FF0000',
                      fillOpacity: 0.2,
                      radius: 100,
                      zIndex: 1
                    }}
                  />
                )
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
                  {geocodedWarnings.map(warning => (
                    warning.geocodedPosition && (
                      <Marker
                        key={warning.id}
                        position={warning.geocodedPosition}
                        onClick={() => handleMarkerClick(warning.id)}
                        icon={getMarkerOptions(warning)}
                        zIndex={isHighDangerWarning(warning.type) ? 10 : 1}
                        clusterer={clusterer}
                      />
                    )
                  ))}
                </>
              )}
            </MarkerClusterer>

            {activeMarker && (
              <InfoWindow
                position={
                  geocodedWarnings.find(w => w.id === activeMarker)?.geocodedPosition || defaultCenter
                }
                onCloseClick={handleInfoWindowClose}
              >
                <div className="warning-popup p-1 max-w-[200px]">
                  <h3 className="text-sm font-semibold mb-1">
                    {geocodedWarnings.find(w => w.id === activeMarker)?.title}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {geocodedWarnings.find(w => w.id === activeMarker)?.location}
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
