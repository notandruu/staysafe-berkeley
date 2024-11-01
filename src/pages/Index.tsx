
import React, { useState, useEffect } from 'react';
import Map from '@/components/Map';
import WarningLog from '@/components/WarningLog';
import WarningPopup from '@/components/WarningPopup';
import { Warning } from '@/types';
import { getWarnings } from '@/services/warningService';
import { useIsMobile } from '@/hooks/use-mobile';

const Index: React.FC = () => {
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [selectedWarningId, setSelectedWarningId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const isMobile = useIsMobile();

  // Load warnings data
  useEffect(() => {
    const loadWarnings = () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        const data = getWarnings();
        setWarnings(data);
      } catch (error) {
        console.error('Error loading warnings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWarnings();
  }, []);

  // Handle warning selection
  const handleWarningSelect = (warningId: string) => {
    setSelectedWarningId(warningId);
    setShowPopup(true);
  };

  // Get the selected warning
  const selectedWarning = selectedWarningId 
    ? warnings.find(w => w.id === selectedWarningId) || null 
    : null;

  // Close popup
  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="px-4 py-3 border-b bg-white shadow-sm">
        <div className="container mx-auto">
          <h1 className="text-xl md:text-2xl font-semibold text-primary">
            UC Berkeley WarnMe Map
          </h1>
          <p className="text-sm text-muted-foreground">
            Interactive map of campus safety alerts and warnings
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden container mx-auto p-4">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading warnings...</p>
            </div>
          </div>
        ) : (
          <div className="h-full grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Map Container */}
            <div className="md:col-span-2 h-[40vh] md:h-full relative bg-gray-100 rounded-lg border overflow-hidden">
              <Map 
                warnings={warnings}
                selectedWarningId={selectedWarningId}
                onWarningSelect={handleWarningSelect}
              />
            </div>

            {/* Warnings Log */}
            <div className="h-[calc(60vh-12rem)] md:h-full border rounded-lg overflow-hidden bg-white">
              <WarningLog 
                warnings={warnings}
                selectedWarningId={selectedWarningId}
                onWarningSelect={handleWarningSelect}
              />
            </div>
          </div>
        )}
      </main>

      {/* Warning Popup - On mobile shows at bottom, on desktop shows over map */}
      {showPopup && selectedWarning && (
        <div 
          className={`
            fixed z-10 transition-all duration-300
            ${isMobile 
              ? 'inset-x-0 bottom-0 p-4 pb-safe'  
              : 'top-20 left-4 max-w-md'
            }
          `}
        >
          <WarningPopup 
            warning={selectedWarning} 
            onClose={handleClosePopup}
          />
        </div>
      )}
    </div>
  );
};

export default Index;
