
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Camera } from './camera/types';
import CameraList from './camera/CameraList';
import CameraViewer from './camera/CameraViewer';
import MobileCameraList from './camera/MobileCameraList';

const initialCameras: Omit<Camera, 'isLoading' | 'hasError'>[] = [
  {
    id: 'cam1',
    name: 'Berkeley Hills',
    location: 'Lawrence Berkeley National Laboratory',
    embedUrl: 'https://cameras.alertcalifornia.org/?pos=37.8705_-122.2696_10&id=Axis-BerkeleyLab',
    fallbackImageUrl: 'https://firecams.seismo.unr.edu/firecams/latest/latest_BerkeleyLab.jpg'
  },
  {
    id: 'cam2',
    name: 'Grizzly Peak',
    location: 'Berkeley Hills',
    embedUrl: 'https://cameras.alertcalifornia.org/?pos=37.8705_-122.2696_10&id=Axis-GrizzlyPeak',
    fallbackImageUrl: 'https://firecams.seismo.unr.edu/firecams/latest/latest_GrizzlyPeak.jpg'
  },
  {
    id: 'cam3',
    name: 'Tilden Park',
    location: 'Berkeley Hills',
    embedUrl: 'https://cameras.alertcalifornia.org/?pos=37.8705_-122.2696_10&id=Axis-TildenPark',
    fallbackImageUrl: 'https://firecams.seismo.unr.edu/firecams/latest/latest_TildenPark.jpg'
  },
  {
    id: 'cam4',
    name: 'Richmond',
    location: 'East Bay',
    embedUrl: 'https://cameras.alertcalifornia.org/?pos=37.8705_-122.2696_10&id=Axis-Richmond',
    fallbackImageUrl: 'https://firecams.seismo.unr.edu/firecams/latest/latest_Richmond.jpg'
  },
  {
    id: 'cam5',
    name: 'Oakland Hills',
    location: 'East Bay',
    embedUrl: 'https://cameras.alertcalifornia.org/?pos=37.8705_-122.2696_10&id=Axis-OaklandHills',
    fallbackImageUrl: 'https://firecams.seismo.unr.edu/firecams/latest/latest_OaklandHills.jpg'
  }
];

const CameraFeeds: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>(
    initialCameras.map(cam => ({
      ...cam,
      isLoading: true,
      hasError: false
    }))
  );
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useIsMobile();
  const iframeRefs = useRef<Record<string, HTMLIFrameElement | null>>({});

  useEffect(() => {
    if (cameras.length > 0 && !selectedCamera) {
      setSelectedCamera(cameras[0]);
    }
  }, [cameras]);

  const handleIframeLoad = (cameraId: string) => {
    setCameras(prevCameras => 
      prevCameras.map(cam => 
        cam.id === cameraId ? { ...cam, isLoading: false } : cam
      )
    );
  };

  const handleIframeError = (cameraId: string) => {
    setCameras(prevCameras => 
      prevCameras.map(cam => 
        cam.id === cameraId ? { ...cam, hasError: true, isLoading: false } : cam
      )
    );
    
    toast({
      title: "Camera Feed Error",
      description: `Could not load the feed for ${cameras.find(c => c.id === cameraId)?.name}. Showing static image instead.`,
      variant: "destructive",
    });
  };

  const refreshCameraFeeds = () => {
    setIsRefreshing(true);
    
    setCameras(prevCameras => 
      prevCameras.map(cam => ({
        ...cam,
        isLoading: true, 
        hasError: false
      }))
    );
    
    setTimeout(() => {
      Object.keys(iframeRefs.current).forEach(key => {
        const iframe = iframeRefs.current[key];
        if (iframe) {
          const src = iframe.src;
          iframe.src = '';
          setTimeout(() => {
            iframe.src = src;
          }, 50);
        }
      });
      
      setIsRefreshing(false);
      toast({
        title: "Refreshing camera feeds",
        description: "Camera feeds are being refreshed. This may take a moment."
      });
    }, 100);
  };

  const getIframeRef = (cameraId: string) => (el: HTMLIFrameElement | null) => {
    iframeRefs.current[cameraId] = el;
  };

  return (
    <Card className="border-berkeley-blue shadow-berkeley">
      <CardHeader className="bg-berkeley-blue text-white border-b border-berkeley-gold py-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Live Camera Feeds</CardTitle>
          <CardDescription className="text-berkeley-gold">
            {/* Removed "Sourced from AlertCalifornia Wildfire Detection Network" */}
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="bg-white text-berkeley-blue border-berkeley-gold hover:bg-berkeley-gold hover:text-white"
          onClick={refreshCameraFeeds}
          disabled={isRefreshing}
        >
          <RefreshCw size={14} className={`mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Feeds'}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {isMobile ? (
          <MobileCameraList 
            cameras={cameras}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            getIframeRef={getIframeRef}
          />
        ) : (
          <div className="grid grid-cols-3 gap-0">
            <CameraList 
              cameras={cameras}
              selectedCameraId={selectedCamera?.id || null}
              onCameraSelect={setSelectedCamera}
            />
            <CameraViewer 
              camera={selectedCamera}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              iframeRef={selectedCamera ? getIframeRef(selectedCamera.id) : () => {}}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CameraFeeds;
