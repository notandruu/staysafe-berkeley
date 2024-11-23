
import React, { useCallback, useEffect, useState } from 'react';
import { Marker, MarkerClusterer, Circle } from '@react-google-maps/api';
import { Warning } from '@/types';
import { GeocodedWarning, MarkerOptions } from '@/types/mapTypes';
import { getWarningTypeColor } from '@/services/warningService';
import { isHighDangerWarning } from '@/utils/mapUtils';
import { MapStyle } from '../Map';
import { useIsMobile } from '@/hooks/use-mobile';

interface WarningMarkersProps {
  geocodedWarnings: GeocodedWarning[];
  selectedWarningId: string | null;
  onMarkerClick: (warningId: string) => void;
  mapStyle: MapStyle;
}

const WarningMarkers: React.FC<WarningMarkersProps> = ({
  geocodedWarnings,
  selectedWarningId,
  onMarkerClick,
  mapStyle
}) => {
  const isMobile = useIsMobile();
  const [zoom, setZoom] = useState<number>(14);
  
  // Get marker options based on warning type and map style
  const getMarkerOptions = useCallback((warning: Warning): MarkerOptions => {
    const color = getWarningTypeColor(warning.type);
    const isSelected = warning.id === selectedWarningId;
    const isHighDanger = isHighDangerWarning(warning.type);
    
    // Different marker styles based on map style
    if (mapStyle === 'dark') {
      return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: isHighDanger ? '#FF5252' : color,
        fillOpacity: isHighDanger ? 0.95 : 0.85,
        strokeColor: '#FFFFFF',
        strokeWeight: isHighDanger ? 2.5 : 2,
        scale: isSelected ? 12 : (isHighDanger ? 10 : 9),
        zIndex: isHighDanger ? 10 : 1,
        animation: isSelected 
          ? google.maps.Animation.BOUNCE 
          : (isHighDanger ? google.maps.Animation.DROP : undefined)
      };
    }
    
    // Standard marker style
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
  }, [selectedWarningId, mapStyle]);

  // Listen for zoom changes
  useEffect(() => {
    if (typeof google !== 'undefined' && google.maps) {
      // Use a safer approach to get the map instance
      const handleZoomChange = () => {
        // Find the map instance from any active marker
        const mapInstance = document.querySelector('.gm-style')?.parentElement;
        if (mapInstance && mapInstance instanceof HTMLElement) {
          // Get the map instance from custom property
          // Using type assertion to avoid TypeScript errors
          const gmInstance = (mapInstance as any)?.__gm;
          if (gmInstance && gmInstance.get) {
            const gMap = gmInstance.get('map');
            if (gMap && gMap.getZoom) {
              setZoom(gMap.getZoom());
            }
          }
        }
      };

      // Add a global event listener for map zoom change
      window.addEventListener('resize', handleZoomChange);
      
      // Try to get initial zoom after map is loaded
      setTimeout(handleZoomChange, 1000);
      
      return () => {
        window.removeEventListener('resize', handleZoomChange);
      };
    }
  }, []);

  // Calculate offset for markers with the same location
  const getMarkerOffset = (warningId: string) => {
    if (zoom >= 18) {
      // Find warnings with the exact same position
      const currentWarning = geocodedWarnings.find(w => w.id === warningId);
      if (!currentWarning || !currentWarning.geocodedPosition) return null;
      
      const samePositionWarnings = geocodedWarnings.filter(w => {
        if (!w.geocodedPosition) return false;
        return (
          w.id !== warningId &&
          w.geocodedPosition.lat === currentWarning.geocodedPosition.lat &&
          w.geocodedPosition.lng === currentWarning.geocodedPosition.lng
        );
      });
      
      if (samePositionWarnings.length > 0) {
        // Find the index of current warning in the same position group
        const allSamePosition = [
          ...samePositionWarnings, 
          currentWarning
        ].sort((a, b) => a.id.localeCompare(b.id));
        
        const index = allSamePosition.findIndex(w => w.id === warningId);
        if (index >= 0) {
          // Create a small offset in a circular pattern
          const angle = (index * (360 / allSamePosition.length)) * (Math.PI / 180);
          const radius = 0.00005; // Small offset - adjust as needed
          return {
            lat: currentWarning.geocodedPosition.lat + Math.sin(angle) * radius,
            lng: currentWarning.geocodedPosition.lng + Math.cos(angle) * radius
          };
        }
      }
    }
    return null;
  };

  return (
    <>
      {/* Add red circles for shots fired warnings */}
      {geocodedWarnings
        .filter(warning => warning.type === 'shots_fired')
        .map(warning => (
          warning.geocodedPosition && (
            <Circle
              key={`circle-${warning.id}`}
              center={warning.geocodedPosition}
              options={{
                strokeColor: mapStyle === 'dark' ? '#FF2222' : '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: mapStyle === 'dark' ? '#FF2222' : '#FF0000',
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
          gridSize: isMobile ? 35 : 50, // Smaller grid size on mobile
          minimumClusterSize: isMobile ? 2 : 3, // Fewer markers needed to form a cluster on mobile
          zoomOnClick: true,
          maxZoom: isMobile ? 18 : 16, // Higher max zoom on mobile before declustering
          averageCenter: true,
        }}
      >
        {(clusterer) => (
          <>
            {geocodedWarnings.map(warning => {
              if (!warning.geocodedPosition) return null;
              
              // Apply offset at high zoom levels for overlapping points
              const offset = getMarkerOffset(warning.id);
              const position = offset || warning.geocodedPosition;
              
              return (
                <Marker
                  key={warning.id}
                  position={position}
                  onClick={() => onMarkerClick(warning.id)}
                  icon={getMarkerOptions(warning)}
                  zIndex={isHighDangerWarning(warning.type) ? 10 : 1}
                  clusterer={clusterer}
                />
              );
            })}
          </>
        )}
      </MarkerClusterer>
    </>
  );
};

export default WarningMarkers;
