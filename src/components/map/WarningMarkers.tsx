
import React, { useCallback, useEffect, useState } from 'react';
import { Marker, MarkerClusterer, Circle, HeatmapLayer } from '@react-google-maps/api';
import { Warning, WarningType } from '@/types';
import { GeocodedWarning, MarkerOptions } from '@/types/mapTypes';
import { getWarningTypeColor } from '@/services/warningService';
import { isHighDangerWarning } from '@/utils/mapUtils';
import { MapStyle } from '../Map';

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
  const [heatmapData, setHeatmapData] = useState<google.maps.visualization.WeightedLocation[]>([]);

  // Prepare heatmap data when warnings change
  useEffect(() => {
    if (mapStyle === 'heatmap') {
      const heatmapPoints = geocodedWarnings
        .filter(warning => warning.geocodedPosition)
        .map(warning => {
          const weight = getWarningWeight(warning.type);
          return {
            location: new google.maps.LatLng(
              warning.geocodedPosition!.lat,
              warning.geocodedPosition!.lng
            ),
            weight
          };
        });
      setHeatmapData(heatmapPoints);
    }
  }, [geocodedWarnings, mapStyle]);

  // Get warning weight based on type (for heatmap intensity)
  const getWarningWeight = (type: WarningType): number => {
    switch (type) {
      case 'shots_fired': return 35;
      case 'violent_crime': return 30;
      case 'robbery': return 25;
      case 'assault': return 20;
      case 'theft': return 10;
      case 'suspicious_activity': return 5;
      default: return 3;
    }
  };

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
    
    // Standard/heatmap marker style
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

  // If using heatmap style, render the heatmap layer
  if (mapStyle === 'heatmap' && heatmapData.length > 0) {
    return (
      <>
        <HeatmapLayer
          data={heatmapData}
          options={{
            radius: 20,
            opacity: 0.7,
            dissipating: true,
            maxIntensity: 35,
            gradient: [
              'rgba(0, 255, 0, 0)',
              'rgba(0, 255, 0, 1)',
              'rgba(255, 255, 0, 1)',
              'rgba(255, 140, 0, 1)',
              'rgba(255, 0, 0, 1)'
            ]
          }}
        />
        
        {/* Still show the selected marker on top of heatmap */}
        {selectedWarningId && geocodedWarnings
          .filter(warning => warning.id === selectedWarningId && warning.geocodedPosition)
          .map(warning => (
            <Marker
              key={warning.id}
              position={warning.geocodedPosition!}
              onClick={() => onMarkerClick(warning.id)}
              icon={getMarkerOptions(warning)}
              zIndex={100}
              animation={google.maps.Animation.BOUNCE}
            />
          ))
        }
      </>
    );
  }

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
