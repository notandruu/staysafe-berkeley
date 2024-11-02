
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Warning } from '@/types';
import { getWarningTypeColor } from '@/services/warningService';
import { cn } from '@/lib/utils';

// Mapbox public token
const MAPBOX_TOKEN = 'pk.eyJ1IjoiYW5kcmV3amxpdTIyIiwiYSI6ImNtN241OGxvbTBtOGMycXEwdzh2azIxNXAifQ.jIe8exS7uHOj-pH9iNz0kA';

interface MapProps {
  warnings: Warning[];
  selectedWarningId: string | null;
  onWarningSelect: (warningId: string) => void;
}

const Map: React.FC<MapProps> = ({ warnings, selectedWarningId, onWarningSelect }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const popups = useRef<{ [key: string]: mapboxgl.Popup }>({});
  
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
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
  }, []);

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

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default Map;
