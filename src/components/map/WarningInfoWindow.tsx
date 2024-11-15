
import React from 'react';
import { InfoWindow } from '@react-google-maps/api';
import { GeocodedWarning } from '@/types/mapTypes';
import { defaultCenter } from '@/utils/mapUtils';

interface WarningInfoWindowProps {
  activeMarker: string | null;
  geocodedWarnings: GeocodedWarning[];
  onCloseClick: () => void;
}

const WarningInfoWindow: React.FC<WarningInfoWindowProps> = ({
  activeMarker,
  geocodedWarnings,
  onCloseClick
}) => {
  if (!activeMarker) return null;

  const activeWarning = geocodedWarnings.find(w => w.id === activeMarker);
  const position = activeWarning?.geocodedPosition || defaultCenter;

  return (
    <InfoWindow
      position={position}
      onCloseClick={onCloseClick}
    >
      <div className="warning-popup p-1 max-w-[200px]">
        <h3 className="text-sm font-semibold mb-1">
          {activeWarning?.title}
        </h3>
        <p className="text-xs text-gray-600">
          {activeWarning?.location}
        </p>
      </div>
    </InfoWindow>
  );
};

export default WarningInfoWindow;
