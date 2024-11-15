
import React, { useCallback } from 'react';
import { Marker, MarkerClusterer, Circle } from '@react-google-maps/api';
import { Warning, WarningType } from '@/types';
import { GeocodedWarning, MarkerOptions } from '@/types/mapTypes';
import { getWarningTypeColor } from '@/services/warningService';
import { isHighDangerWarning } from '@/utils/mapUtils';

interface WarningMarkersProps {
  geocodedWarnings: GeocodedWarning[];
  selectedWarningId: string | null;
  onMarkerClick: (warningId: string) => void;
}

const WarningMarkers: React.FC<WarningMarkersProps> = ({
  geocodedWarnings,
  selectedWarningId,
  onMarkerClick
}) => {
  // Get marker options based on warning type
  const getMarkerOptions = useCallback((warning: Warning): MarkerOptions => {
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
                  onClick={() => onMarkerClick(warning.id)}
                  icon={getMarkerOptions(warning)}
                  zIndex={isHighDangerWarning(warning.type) ? 10 : 1}
                  clusterer={clusterer}
                />
              )
            ))}
          </>
        )}
      </MarkerClusterer>
    </>
  );
};

export default WarningMarkers;
