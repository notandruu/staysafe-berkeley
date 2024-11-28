
import React from 'react';
import { AlertTriangle, Camera } from 'lucide-react';
import { CameraProps } from './types';

const CameraItem: React.FC<CameraProps> = ({ camera, isSelected, onClick }) => {
  return (
    <div 
      className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors
        ${isSelected ? 'bg-berkeley-blue/10 border-l-4 border-berkeley-blue' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-center">
        {camera.hasError ? (
          <AlertTriangle size={14} className="text-amber-500 mr-1.5" />
        ) : (
          <Camera size={14} className="text-berkeley-blue mr-1.5" />
        )}
        <h3 className="font-medium text-berkeley-blue">{camera.name}</h3>
      </div>
      <p className="text-xs text-gray-600">{camera.location}</p>
      {camera.hasError && (
        <p className="text-xs text-amber-600 mt-1">Using static image</p>
      )}
    </div>
  );
};

export default CameraItem;
