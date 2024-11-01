
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Warning } from '@/types';
import { getWarningTypeColor } from '@/services/warningService';
import { cn } from '@/lib/utils';

// You'll need to sign up for a Google Maps API key
// For now, we'll use a placeholder. In a production app, this should be in an environment variable.
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

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
  const [apiKey, setApiKey] = useState<string>(GOOGLE_MAPS_API_KEY);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [showTokenInput, setShowTokenInput] = useState(GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY');
  
  // Load the Google Maps JS API
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    ...(apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY' ? {} : { preventGoogleFontsLoading: true })
  });

  // Store map reference
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Handle selected warning
  useEffect(() => {
    if (!map || !selectedWarningId) return;
    
    const warning = warnings.find(w => w.id === selectedWarningId);
    
    if (warning) {
      // Center map on the marker
      map.panTo({
        lat: warning.coordinates.latitude,
        lng: warning.coordinates.longitude
      });
      map.setZoom(16);
      
      // Show info window
      setActiveMarker(selectedWarningId);
    }
  }, [selectedWarningId, warnings, map]);

  const handleMarkerClick = (warningId: string) => {
    onWarningSelect(warningId);
    setActiveMarker(warningId);
  };

  const handleInfoWindowClose = () => {
    setActiveMarker(null);
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowTokenInput(false);
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
    <div className={cn(
      "relative w-full h-full rounded-lg overflow-hidden", 
      showTokenInput ? "flex items-center justify-center bg-gray-100" : ""
    )}>
      {showTokenInput ? (
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Google Maps API Key Required</h2>
          <p className="mb-4 text-gray-600">
            To display the map, please enter your Google Maps API key.
            You can get one at the <a href="https://console.cloud.google.com/google/maps-apis/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google Cloud Console</a>.
          </p>
          <form onSubmit={handleTokenSubmit}>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
              placeholder="Enter Google Maps API key"
            />
            <button
              type="submit"
              className="w-full py-2 px-4 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
            >
              Submit
            </button>
          </form>
        </div>
      ) : isLoaded ? (
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
            />
          ))}

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
      ) : (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default Map;
