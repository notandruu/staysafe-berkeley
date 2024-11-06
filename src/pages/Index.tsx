
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
      {/* Header with UC Berkeley Branding */}
      <header className="bg-[#003262] text-white border-b border-[#FDB515] shadow-md">
        <div className="container mx-auto py-4 px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                StaySafe Berkeley
              </h1>
              <p className="text-sm md:text-base text-[#FDB515] font-medium mt-1">
                Interactive map of campus safety alerts and warnings
              </p>
            </div>
            <div className="mt-2 md:mt-0 flex items-center space-x-2">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-[#FDB515] flex items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="text-[#003262] h-5 w-5 md:h-6 md:w-6"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </div>
              <span className="hidden md:inline text-sm">UC Berkeley Campus Safety</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden container mx-auto p-4">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#003262]/30 border-t-[#003262] rounded-full animate-spin mx-auto mb-4"></div>
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
