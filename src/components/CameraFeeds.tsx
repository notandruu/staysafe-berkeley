
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Eye, ExternalLink } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Camera {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  liveUrl: string;
  embedUrl: string; // Added embed URL for iframe embedding
}

// Sample cameras from AlertCalifornia with embed URLs
const sampleCameras: Camera[] = [
  {
    id: 'cam1',
    name: 'Berkeley Hills',
    location: 'Lawrence Berkeley National Laboratory',
    imageUrl: 'https://images.alertcalifornia.org/20230816_alertca_images_latest/latest/z76-Axis-BerkeleyLab-p.jpg',
    liveUrl: 'https://cameras.alertcalifornia.org/?pos=37.8776_-122.2459_16&cam=Axis-BerkeleyLab-p',
    embedUrl: 'https://live.alertcalifornia.org/axis-BerkeleyLab-p/embed.html'
  },
  {
    id: 'cam2',
    name: 'Grizzly Peak',
    location: 'Berkeley Hills',
    imageUrl: 'https://images.alertcalifornia.org/20230816_alertca_images_latest/latest/z76-Axis-GrizzlyPeak-p.jpg',
    liveUrl: 'https://cameras.alertcalifornia.org/?pos=37.8835_-122.2320_16&cam=Axis-GrizzlyPeak-p',
    embedUrl: 'https://live.alertcalifornia.org/axis-GrizzlyPeak-p/embed.html'
  },
  {
    id: 'cam3',
    name: 'Tilden Park',
    location: 'Berkeley Hills',
    imageUrl: 'https://images.alertcalifornia.org/20230816_alertca_images_latest/latest/z76-Axis-TildenPark-p.jpg',
    liveUrl: 'https://cameras.alertcalifornia.org/?pos=37.8904_-122.2467_16&cam=Axis-TildenPark-p',
    embedUrl: 'https://live.alertcalifornia.org/axis-TildenPark-p/embed.html'
  },
  {
    id: 'cam4',
    name: 'Richmond',
    location: 'East Bay',
    imageUrl: 'https://images.alertcalifornia.org/20230816_alertca_images_latest/latest/z76-Axis-Richmond-p.jpg',
    liveUrl: 'https://cameras.alertcalifornia.org/?pos=37.9308_-122.3519_16&cam=Axis-Richmond-p',
    embedUrl: 'https://live.alertcalifornia.org/axis-Richmond-p/embed.html'
  },
  {
    id: 'cam5',
    name: 'Oakland Hills',
    location: 'East Bay',
    imageUrl: 'https://images.alertcalifornia.org/20230816_alertca_images_latest/latest/z76-Axis-OaklandHills-p.jpg',
    liveUrl: 'https://cameras.alertcalifornia.org/?pos=37.8273_-122.1936_16&cam=Axis-OaklandHills-p',
    embedUrl: 'https://live.alertcalifornia.org/axis-OaklandHills-p/embed.html'
  }
];

const CameraFeeds: React.FC = () => {
  const [cameras] = useState<Camera[]>(sampleCameras);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(cameras[0]);
  const [viewMode, setViewMode] = useState<'image' | 'live'>('image');
  const isMobile = useIsMobile();

  const handleViewLive = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'image' ? 'live' : 'image');
  };

  return (
    <Card className="border-berkeley-blue shadow-berkeley">
      <CardHeader className="bg-berkeley-blue text-white border-b border-berkeley-gold py-3">
        <div>
          <CardTitle className="text-xl">Live Camera Feeds</CardTitle>
          <CardDescription className="text-berkeley-gold">
            Sourced from AlertCalifornia Wildfire Detection Network
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-3'} gap-0`}>
          {/* Camera list - hidden on mobile */}
          {!isMobile && (
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
                      <h3 className="font-medium text-berkeley-blue">{camera.name}</h3>
                      <p className="text-xs text-gray-600">{camera.location}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Selected camera preview */}
          <div className={isMobile ? "" : "md:col-span-2"}>
            {/* Mobile view - simplified camera selection */}
            {isMobile && (
              <div className="p-2 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-center space-x-2 overflow-x-auto py-1">
                  {cameras.map(camera => (
                    <button
                      key={camera.id}
                      className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
                        selectedCamera?.id === camera.id 
                          ? 'bg-berkeley-blue text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      onClick={() => setSelectedCamera(camera)}
                    >
                      {camera.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Camera view header with toggle */}
            <div className="py-2 px-3 bg-gray-50 border-b border-gray-200 font-semibold text-sm text-gray-700 flex justify-between items-center">
              <span>{selectedCamera?.name} - {viewMode === 'image' ? 'Most Recent Image' : 'Live Feed'}</span>
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs text-berkeley-blue hover:text-berkeley-blue hover:bg-berkeley-blue/10"
                  onClick={toggleViewMode}
                >
                  <Eye size={14} className="mr-1" />
                  {viewMode === 'image' ? 'Switch to Live' : 'Show Static Image'}
                </Button>
                {selectedCamera && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-xs text-berkeley-blue hover:text-berkeley-blue hover:bg-berkeley-blue/10"
                    onClick={() => handleViewLive(selectedCamera.liveUrl)}
                  >
                    <ExternalLink size={14} className="mr-1" />
                    Open in New Tab
                  </Button>
                )}
              </div>
            </div>
            
            {/* Camera content - image or live feed */}
            <div className="relative flex-1 flex items-center justify-center bg-black">
              {selectedCamera ? (
                viewMode === 'image' ? (
                  // Static image view
                  <img 
                    src={selectedCamera.imageUrl} 
                    alt={selectedCamera.name} 
                    className={`max-w-full object-contain ${isMobile ? 'max-h-[200px]' : 'max-h-[373px]'}`}
                  />
                ) : (
                  // Live feed view
                  <iframe
                    src={selectedCamera.embedUrl}
                    title={`Live feed from ${selectedCamera.name}`}
                    className={`w-full ${isMobile ? 'h-[200px]' : 'h-[373px]'}`}
                    allow="fullscreen"
                    allowFullScreen
                  ></iframe>
                )
              ) : (
                <div className="text-center text-gray-400">
                  <p>No camera selected</p>
                </div>
              )}
              
              {/* AlertCalifornia attribution */}
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                Source: AlertCalifornia
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CameraFeeds;
