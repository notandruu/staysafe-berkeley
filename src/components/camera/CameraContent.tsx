
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { CameraProps } from './types';

interface CameraContentProps extends CameraProps {
  onLoad: (cameraId: string) => void;
  onError: (cameraId: string) => void;
  iframeRef: (el: HTMLIFrameElement | null) => void;
}

const CameraContent: React.FC<CameraContentProps> = ({ 
  camera, 
  fullSize = false,
  onLoad,
  onError,
  iframeRef
}) => {
  const height = fullSize ? 'h-[373px]' : 'h-[180px]';
  
  if (camera.isLoading) {
    return (
      <div className={`${height} flex items-center justify-center bg-gray-100`}>
        <div className="flex flex-col items-center text-gray-500">
          <RefreshCw className="animate-spin mb-2" size={24} />
          <p className="text-sm">Loading feed...</p>
        </div>
      </div>
    );
  }
  
  if (camera.hasError && camera.fallbackImageUrl) {
    return (
      <div className={`${height} relative bg-black`}>
        <img 
          src={camera.fallbackImageUrl} 
          alt={`Static image from ${camera.name}`}
          className="w-full h-full object-cover"
          onError={() => {
            toast({
              title: "Image Error",
              description: `Could not load static image for ${camera.name}.`,
              variant: "destructive",
            });
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-white text-xs flex items-center">
          <AlertTriangle size={12} className="text-yellow-400 mr-1" />
          <span>Live feed unavailable. Showing most recent image.</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative bg-black">
      <iframe
        ref={iframeRef}
        src={camera.embedUrl}
        title={`Live feed from ${camera.name}`}
        className={`w-full ${height}`}
        allow="fullscreen"
        allowFullScreen
        onLoad={() => onLoad(camera.id)}
        onError={() => onError(camera.id)}
      ></iframe>
      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        Source: AlertCalifornia
      </div>
    </div>
  );
};

export default CameraContent;
