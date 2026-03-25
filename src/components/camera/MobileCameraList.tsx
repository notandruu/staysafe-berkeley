
import React from 'react';
import { Camera } from 'lucide-react';
import CameraContent from './CameraContent';
import { Camera as CameraType } from './types';

interface MobileCameraListProps {
  cameras: CameraType[];
  onLoad: (cameraId: string) => void;
  onError: (cameraId: string) => void;
}

const MobileCameraList: React.FC<MobileCameraListProps> = ({ cameras, onLoad, onError }) => {
  return (
    <div className="space-y-4 py-4">
      {cameras.map((camera) => (
        <div key={camera.id} className="px-4">
          <div className="text-sm font-medium mb-1 flex items-center">
            <Camera size={14} className="mr-1.5 text-berkeley-blue" />
            {camera.name}
          </div>
          <CameraContent
            camera={camera}
            onLoad={onLoad}
            onError={onError}
          />
        </div>
      ))}
    </div>
  );
};

export default MobileCameraList;
