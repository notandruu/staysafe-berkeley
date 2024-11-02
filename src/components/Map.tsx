
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Warning } from '@/types';
import { getWarningTypeColor } from '@/services/warningService';
import { cn } from '@/lib/utils';

// You'll need to sign up for a Mapbox account and get a public token
// For now, we'll use a placeholder. In a production app, this should be in an environment variable.
const MAPBOX_TOKEN = 'YOUR_MAPBOX_PUBLIC_TOKEN';

interface MapProps {
  warnings: Warning[];
  selectedWarningId: string | null;
  onWarningSelect: (warningId: string) => void;
}

const Map: React.FC<MapProps> = ({ warnings, selectedWarningId, onWarningSelect }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>(MAPBOX_TOKEN);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const popups = useRef<{ [key: string]: mapboxgl.Popup }>({});
  
  // For development purposes
  const [showTokenInput, setShowTokenInput] = useState(MAPBOX_TOKEN === 'YOUR_MAPBOX_PUBLIC_TOKEN');

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || mapboxToken === 'YOUR_MAPBOX_PUBLIC_TOKEN') return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-122.2590, 37.8719], // UC Berkeley coordinates
      zoom: 14,
      attributionControl: false
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.AttributionControl({ compact: true }));
    
    // Clean up on unmount
    return () => {
      map.current?.remove();
      
      // Clean up markers and popups
      Object.values(markers.current).forEach(marker => marker.remove());
      Object.values(popups.current).forEach(popup => popup.remove());
    };
  }, [mapboxToken]);

  // Add markers for each warning
  useEffect(() => {
    if (!map.current) return;
    
    // Remove existing markers
    Object.values(markers.current).forEach(marker => marker.remove());
    Object.values(popups.current).forEach(popup => popup.remove());
    markers.current = {};
    popups.current = {};
    
    // Add new markers
    warnings.forEach(warning => {
      // Create marker element
      const el = document.createElement('div');
      el.className = 'warning-marker';
      el.style.backgroundColor = getWarningTypeColor(warning.type);
      
      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setHTML(`
          <div class="warning-popup">
            <h3>${warning.title}</h3>
            <p class="location">${warning.location}</p>
          </div>
        `);
      
      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([warning.coordinates.longitude, warning.coordinates.latitude])
        .setPopup(popup)
        .addTo(map.current!);
      
      // Add click event
      el.addEventListener('click', () => {
        onWarningSelect(warning.id);
      });
      
      markers.current[warning.id] = marker;
      popups.current[warning.id] = popup;
    });
  }, [warnings, map.current, onWarningSelect]);

  // Handle selected warning
  useEffect(() => {
    if (!map.current || !selectedWarningId) return;
    
    const marker = markers.current[selectedWarningId];
    const warning = warnings.find(w => w.id === selectedWarningId);
    
    if (marker && warning) {
      // Center map on the marker
      map.current.flyTo({
        center: [warning.coordinates.longitude, warning.coordinates.latitude],
        zoom: 15,
        duration: 1000
      });
      
      // Show popup
      marker.togglePopup();
    }
  }, [selectedWarningId, warnings]);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowTokenInput(false);
  };

  return (
    <div className={cn("relative w-full h-full rounded-lg overflow-hidden", 
      showTokenInput ? "flex items-center justify-center bg-gray-100" : "")}>
      {showTokenInput ? (
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Mapbox Token Required</h2>
          <p className="mb-4 text-gray-600">
            To display the map, please enter your Mapbox public token.
            You can get one by signing up at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">mapbox.com</a>.
          </p>
          <form onSubmit={handleTokenSubmit}>
            <input
              type="text"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
              placeholder="Enter Mapbox token"
            />
            <button
              type="submit"
              className="w-full py-2 px-4 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
            >
              Submit
            </button>
          </form>
        </div>
      ) : (
        <div ref={mapContainer} className="absolute inset-0" />
      )}
    </div>
  );
};

export default Map;
