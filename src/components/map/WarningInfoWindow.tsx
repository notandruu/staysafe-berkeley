
import React from 'react';
import { InfoWindow } from '@react-google-maps/api';
import { GeocodedWarning } from '@/types/mapTypes';
import { defaultCenter } from '@/utils/mapUtils';
import { getSeverityColor } from '@/services/warningService';
import { format } from 'date-fns';

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

  if (!activeWarning) return null;

  const formattedDate = format(new Date(activeWarning.timestamp), 'MMM d, h:mm a');
  const severityColor = getSeverityColor(activeWarning.severity);

  return (
    <InfoWindow
      position={position}
      onCloseClick={onCloseClick}
      options={{
        pixelOffset: new window.google.maps.Size(0, -35),
        disableAutoPan: false
      }}
    >
      <div className="warning-popup p-2 max-w-[240px]">
        <div className="flex items-start mb-1.5">
          <div 
            className="w-3 h-3 rounded-full mt-1 mr-1.5 flex-shrink-0" 
            style={{ backgroundColor: severityColor }}
          />
          <h3 className="text-sm font-semibold leading-tight">
            {activeWarning.title}
          </h3>
        </div>
        
        <div className="pl-4.5">
          <p className="text-xs text-gray-700 mb-1">
            {activeWarning.location}
          </p>
          
          <div className="flex justify-between items-center text-[10px] text-gray-500 mt-1.5">
            <div>{activeWarning.type.replace('_', ' ')}</div>
            <div>{formattedDate}</div>
          </div>
        </div>
      </div>
    </InfoWindow>
  );
};

export default WarningInfoWindow;
