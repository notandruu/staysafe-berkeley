
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CameraFeeds: React.FC = () => {
  return (
    <Card className="border-berkeley-blue shadow-berkeley">
      <CardHeader className="bg-berkeley-blue text-white border-b border-berkeley-gold py-3">
        <CardTitle className="text-xl">Live Campus Feed</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/CO4lgqL7Fhg?autoplay=1&mute=1"
            title="UC Berkeley Campus Live Stream"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CameraFeeds;
