
import React, { useState, useEffect } from 'react';
import Map from '@/components/Map';
import WarningLog from '@/components/WarningLog';
import WarningPopup from '@/components/WarningPopup';
import { Warning } from '@/types';
import { getWarnings, refreshWarnings } from '@/services/warningService';
import { useIsMobile } from '@/hooks/use-mobile';
import SeverityFilter, { SeverityLevel } from '@/components/SeverityFilter';
import LineGraph from '@/components/LineGraph';
import { isAfter, subDays } from 'date-fns';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const Index: React.FC = () => {
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [recentWarnings, setRecentWarnings] = useState<Warning[]>([]);
  const [selectedWarningId, setSelectedWarningId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedSeverities, setSelectedSeverities] = useState<SeverityLevel[]>(['high', 'medium', 'low']);
  const isMobile = useIsMobile();

  // Function to load warnings data
  const loadWarnings = async () => {
    setIsLoading(true);
    try {
      // Fetch warnings from Google Sheets
      const data = await getWarnings();
      setWarnings(data);
      
      // Filter for warnings from the last 24 hours
      const last24Hours = subDays(new Date(), 1);
      const recent = data.filter(warning => 
        isAfter(new Date(warning.timestamp), last24Hours)
      );
      setRecentWarnings(recent);

      // If we were refreshing, show a success toast
      if (isRefreshing) {
        toast({
          title: "Data refreshed",
          description: `Loaded ${data.length} warnings from Google Sheets`,
        });
      }
    } catch (error) {
      console.error('Error loading warnings:', error);
      toast({
        title: "Error loading data",
        description: "Could not load warnings. Using sample data instead.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load warnings data on component mount
  useEffect(() => {
    loadWarnings();
  }, []);

  // Function to manually refresh the data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Force a refresh of the data
      const data = await refreshWarnings();
      setWarnings(data);
      
      // Filter for warnings from the last 24 hours
      const last24Hours = subDays(new Date(), 1);
      const recent = data.filter(warning => 
        isAfter(new Date(warning.timestamp), last24Hours)
      );
      setRecentWarnings(recent);
      
      toast({
        title: "Data refreshed",
        description: `Loaded ${data.length} warnings from Google Sheets`,
      });
    } catch (error) {
      console.error('Error refreshing warnings:', error);
      toast({
        title: "Error refreshing data",
        description: "Could not refresh warnings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle warning selection or deselection
  const handleWarningSelect = (warningId: string) => {
    // If the warning is already selected, unselect it
    if (selectedWarningId === warningId) {
      setSelectedWarningId(null);
      setShowPopup(false);
    } else {
      // Otherwise, select the new warning
      setSelectedWarningId(warningId);
      setShowPopup(true);
    }
  };

  // Filter warnings by selected severity levels
  const filteredWarnings = recentWarnings.filter(warning => {
    return selectedSeverities.includes(warning.severity as SeverityLevel);
  });

  // Get the selected warning
  const selectedWarning = selectedWarningId 
    ? warnings.find(w => w.id === selectedWarningId) || null 
    : null;

  // Handle severity filter change
  const handleSeverityChange = (severity: SeverityLevel, isChecked: boolean) => {
    if (isChecked) {
      // Add severity if it's not already in the array
      setSelectedSeverities(prev => 
        prev.includes(severity) ? prev : [...prev, severity]
      );
    } else {
      // Remove severity from the array
      setSelectedSeverities(prev => 
        prev.filter(s => s !== severity)
      );

      // If the selected warning is of the severity being filtered out, close the popup
      if (selectedWarning && selectedWarning.severity === severity) {
        setShowPopup(false);
        setSelectedWarningId(null);
      }
    }
  };

  // Close popup
  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedWarningId(null);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header with UC Berkeley Branding */}
      <header className="bg-[#003262] text-white border-b border-[#FDB515] shadow-md">
        <div className="container mx-auto py-4 px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                StaySafe Berkeley
              </h1>
              <p className="hidden md:block text-base text-[#FDB515] font-medium mt-1">
                Interactive map of campus safety alerts and warnings
              </p>
            </div>
            
            {/* Shield Logo - Positioned top right on mobile */}
            <div className="flex items-center space-x-2">
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
            {/* Left column - Map Container and Severity Filter */}
            <div className="md:col-span-2 flex flex-col h-full">
              {/* Map container with fixed height on desktop */}
              <div className="relative h-[40vh] md:h-[65vh] bg-gray-100 rounded-lg border overflow-hidden">
                <Map 
                  warnings={filteredWarnings}
                  selectedWarningId={selectedWarningId}
                  onWarningSelect={handleWarningSelect}
                />
                
                {/* Refresh Button */}
                <div className="absolute top-2 right-2 z-10">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-white shadow-md hover:bg-gray-100"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <RefreshCw size={16} className={`mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                  </Button>
                </div>
              </div>
              
              {/* Severity Filter - Always below map */}
              <div className="mt-3">
                <SeverityFilter 
                  selectedSeverities={selectedSeverities}
                  onSeverityChange={handleSeverityChange}
                />
              </div>
            </div>

            {/* Right Side - Line Graph and Warnings Log */}
            <div className="flex flex-col h-[calc(60vh-8rem)] md:h-full gap-4">
              {/* Line Graph */}
              <div className="flex-none">
                <LineGraph warnings={warnings} />
              </div>
              
              {/* Warnings Log */}
              <div className="flex-1 border rounded-lg overflow-hidden bg-white">
                <WarningLog 
                  warnings={warnings}
                  selectedWarningId={selectedWarningId}
                  onWarningSelect={handleWarningSelect}
                />
              </div>
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
