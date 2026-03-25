
import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { CameraProps } from './types';

interface CameraContentProps extends CameraProps {
  onLoad: (cameraId: string) => void;
  onError: (cameraId: string) => void;
}

const CameraContent: React.FC<CameraContentProps> = ({
  camera,
  fullSize = false,
  onLoad,
  onError,
}) => {
  const height = fullSize ? 'h-[373px]' : 'h-[180px]';
  const [timestamp, setTimestamp] = useState(() => Date.now());
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(Date.now());
      setImgLoaded(false);
      setImgError(false);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setTimestamp(Date.now());
    setImgLoaded(false);
    setImgError(false);
  }, [camera.id]);

  if (!camera.fallbackImageUrl) {
    return (
      <div className={`${height} flex items-center justify-center bg-gray-900 text-gray-400 text-sm`}>
        No feed available
      </div>
    );
  }

  return (
    <div className={`relative bg-black ${height} overflow-hidden`}>
      {!imgLoaded && !imgError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10 text-gray-500">
          <RefreshCw className="animate-spin mb-2" size={24} />
          <p className="text-sm">Loading feed...</p>
        </div>
      )}
      {imgError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-gray-400 text-sm">
          Feed unavailable
        </div>
      ) : (
        <img
          key={timestamp}
          src={`${camera.fallbackImageUrl}?t=${timestamp}`}
          alt={`Camera feed from ${camera.name}`}
          className="w-full h-full object-cover"
          onLoad={() => {
            setImgLoaded(true);
            onLoad(camera.id);
          }}
          onError={() => {
            setImgError(true);
            onError(camera.id);
          }}
        />
      )}
      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        Auto-refreshes every 30s
      </div>
    </div>
  );
};

export default CameraContent;
