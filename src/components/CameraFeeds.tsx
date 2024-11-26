
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { AlertTriangle, Camera, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface Camera {
  id: string;
  name: string;
  location: string;
  embedUrl: string;
  fallbackImageUrl?: string;
  isLoading: boolean;
  hasError: boolean;
}

// Sample cameras with embed URLs and fallback static images
const initialCameras: Omit<Camera, 'isLoading' | 'hasError'>[] = [
  {
    id: 'cam1',
    name: 'Berkeley Hills',
    location: 'Lawrence Berkeley National Laboratory',
    embedUrl: 'https://live.alertcalifornia.org/axis-BerkeleyLab-p/embed.html',
    fallbackImageUrl: 'https://firecams.seismo.unr.edu/firecams/latest/latest_BerkeleyLab.jpg'
  },
  {
    id: 'cam2',
    name: 'Grizzly Peak',
    location: 'Berkeley Hills',
    embedUrl: 'https://live.alertcalifornia.org/axis-GrizzlyPeak-p/embed.html',
    fallbackImageUrl: 'https://firecams.seismo.unr.edu/firecams/latest/latest_GrizzlyPeak.jpg'
  },
  {
    id: 'cam3',
    name: 'Tilden Park',
    location: 'Berkeley Hills',
    embedUrl: 'https://live.alertcalifornia.org/axis-TildenPark-p/embed.html',
    fallbackImageUrl: 'https://firecams.seismo.unr.edu/firecams/latest/latest_TildenPark.jpg'
  },
  {
    id: 'cam4',
    name: 'Richmond',
    location: 'East Bay',
    embedUrl: 'https://live.alertcalifornia.org/axis-Richmond-p/embed.html',
    fallbackImageUrl: 'https://firecams.seismo.unr.edu/firecams/latest/latest_Richmond.jpg'
  },
  {
    id: 'cam5',
    name: 'Oakland Hills',
    location: 'East Bay',
    embedUrl: 'https://live.alertcalifornia.org/axis-OaklandHills-p/embed.html',
    fallbackImageUrl: 'https://firecams.seismo.unr.edu/firecams/latest/latest_OaklandHills.jpg'
  }
];

const CameraFeeds: React.FC = () => {
  // Add loading and error states to each camera
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

  // Set initial selected camera after state is initialized
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
    
    // Reset all cameras to loading state
    setCameras(prevCameras => 
      prevCameras.map(cam => ({
        ...cam,
        isLoading: true, 
        hasError: false
      }))
    );
    
    // Force iframe refresh by recreating them
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

  const renderCameraContent = (camera: Camera, fullSize = false) => {
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
          ref={el => iframeRefs.current[camera.id] = el}
          src={camera.embedUrl}
          title={`Live feed from ${camera.name}`}
          className={`w-full ${height}`}
          allow="fullscreen"
          allowFullScreen
          onLoad={() => handleIframeLoad(camera.id)}
          onError={() => handleIframeError(camera.id)}
        ></iframe>
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Source: AlertCalifornia
        </div>
      </div>
    );
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
          // Mobile layout - show all cameras with minimal titles
          <div className="space-y-4 py-4">
            {cameras.map((camera) => (
              <div key={camera.id} className="px-4">
                <div className="text-sm font-medium mb-1 flex items-center">
                  <Camera size={14} className="mr-1.5 text-berkeley-blue" />
                  {camera.name}
                </div>
                {renderCameraContent(camera)}
              </div>
            ))}
          </div>
        ) : (
          // Desktop layout - sidebar selection with larger selected camera view
          <div className="grid grid-cols-3 gap-0">
            <div className="border-r border-gray-200">
              <div className="py-2 px-3 bg-gray-50 border-b border-gray-200 font-semibold text-sm text-gray-700">
                Available Cameras
              </div>
              <ScrollArea className="h-[400px]">
                <div className="divide-y">
                  {cameras.map(camera => (
                    <div 
                      key={camera.id}
                      className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors
                        ${selectedCamera?.id === camera.id ? 'bg-berkeley-blue/10 border-l-4 border-berkeley-blue' : ''}
                      `}
                      onClick={() => setSelectedCamera(camera)}
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
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="col-span-2">
              <div className="py-2 px-3 bg-gray-50 border-b border-gray-200 font-semibold text-sm text-gray-700 flex justify-between items-center">
                <span>
                  {selectedCamera?.name} - Live Feed
                  {selectedCamera?.hasError && (
                    <span className="text-xs font-normal text-amber-600 ml-2">(Static Image)</span>
                  )}
                </span>
              </div>
              
              <div className="relative flex-1 flex items-center justify-center bg-black">
                {selectedCamera ? (
                  renderCameraContent(selectedCamera, true)
                ) : (
                  <div className="text-center text-gray-400">
                    <p>No camera selected</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CameraFeeds;
