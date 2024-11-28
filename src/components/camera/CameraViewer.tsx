
import React from 'react';
import CameraContent from './CameraContent';
import { Camera } from './types';

interface CameraViewerProps {
  camera: Camera | null;
  onLoad: (cameraId: string) => void;
  onError: (cameraId: string) => void;
  iframeRef: (el: HTMLIFrameElement | null) => void;
}

const CameraViewer: React.FC<CameraViewerProps> = ({ camera, onLoad, onError, iframeRef }) => {
  return (
    <div className="col-span-2">
      <div className="py-2 px-3 bg-gray-50 border-b border-gray-200 font-semibold text-sm text-gray-700 flex justify-between items-center">
        <span>
          {camera?.name} - Live Feed
          {camera?.hasError && (
            <span className="text-xs font-normal text-amber-600 ml-2">(Static Image)</span>
          )}
        </span>
      </div>
      
      <div className="relative flex-1 flex items-center justify-center bg-black">
        {camera ? (
          <CameraContent 
            camera={camera} 
            fullSize={true} 
            onLoad={onLoad} 
            onError={onError}
            iframeRef={iframeRef}
          />
        ) : (
          <div className="text-center text-gray-400">
            <p>No camera selected</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraViewer;
