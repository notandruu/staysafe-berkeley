
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import CameraItem from './CameraItem';
import { Camera } from './types';

interface CameraListProps {
  cameras: Camera[];
  selectedCameraId: string | null;
  onCameraSelect: (camera: Camera) => void;
}

const CameraList: React.FC<CameraListProps> = ({ cameras, selectedCameraId, onCameraSelect }) => {
  return (
    <div className="border-r border-gray-200">
      <div className="py-2 px-3 bg-gray-50 border-b border-gray-200 font-semibold text-sm text-gray-700">
        Available Cameras
      </div>
      <ScrollArea className="h-[400px]">
        <div className="divide-y">
          {cameras.map(camera => (
            <CameraItem 
              key={camera.id}
              camera={camera}
              isSelected={selectedCameraId === camera.id}
              onClick={() => onCameraSelect(camera)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CameraList;
