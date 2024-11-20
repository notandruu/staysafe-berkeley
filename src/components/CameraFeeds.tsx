
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

interface Camera {
  id: string;
  name: string;
  location: string;
  embedUrl: string;
}

// Sample cameras from AlertCalifornia with embed URLs
const sampleCameras: Camera[] = [
  {
    id: 'cam1',
    name: 'Berkeley Hills',
    location: 'Lawrence Berkeley National Laboratory',
    embedUrl: 'https://live.alertcalifornia.org/axis-BerkeleyLab-p/embed.html'
  },
  {
    id: 'cam2',
    name: 'Grizzly Peak',
    location: 'Berkeley Hills',
    embedUrl: 'https://live.alertcalifornia.org/axis-GrizzlyPeak-p/embed.html'
  },
  {
    id: 'cam3',
    name: 'Tilden Park',
    location: 'Berkeley Hills',
    embedUrl: 'https://live.alertcalifornia.org/axis-TildenPark-p/embed.html'
  },
  {
    id: 'cam4',
    name: 'Richmond',
    location: 'East Bay',
    embedUrl: 'https://live.alertcalifornia.org/axis-Richmond-p/embed.html'
  },
  {
    id: 'cam5',
    name: 'Oakland Hills',
    location: 'East Bay',
    embedUrl: 'https://live.alertcalifornia.org/axis-OaklandHills-p/embed.html'
  }
];

const CameraFeeds: React.FC = () => {
  const [cameras] = useState<Camera[]>(sampleCameras);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(cameras[0]);
  const isMobile = useIsMobile();

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
        {isMobile ? (
          // Mobile layout - show all cameras with minimal titles
          <div className="space-y-4 py-4">
            {cameras.map((camera) => (
              <div key={camera.id} className="px-4">
                <div className="text-sm font-medium mb-1">{camera.name}</div>
                <div className="relative bg-black rounded overflow-hidden">
                  <iframe
                    src={camera.embedUrl}
                    title={`Live feed from ${camera.name}`}
                    className="w-full h-[180px]"
                    allow="fullscreen"
                    allowFullScreen
                  ></iframe>
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    Source: AlertCalifornia
                  </div>
                </div>
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
                      <h3 className="font-medium text-berkeley-blue">{camera.name}</h3>
                      <p className="text-xs text-gray-600">{camera.location}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="col-span-2">
              <div className="py-2 px-3 bg-gray-50 border-b border-gray-200 font-semibold text-sm text-gray-700">
                <span>{selectedCamera?.name} - Live Feed</span>
              </div>
              
              <div className="relative flex-1 flex items-center justify-center bg-black">
                {selectedCamera ? (
                  <iframe
                    src={selectedCamera.embedUrl}
                    title={`Live feed from ${selectedCamera.name}`}
                    className="w-full h-[373px]"
                    allow="fullscreen"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="text-center text-gray-400">
                    <p>No camera selected</p>
                  </div>
                )}
                
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  Source: AlertCalifornia
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CameraFeeds;
