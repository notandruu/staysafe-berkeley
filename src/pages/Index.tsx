
import React, { useState, useEffect } from 'react';
import Map from '@/components/Map';
import WarningLog from '@/components/WarningLog';
import WarningPopup from '@/components/WarningPopup';
import { Warning } from '@/types';
import { getWarnings, refreshWarnings } from '@/services/warningService';
import { useIsMobile } from '@/hooks/use-mobile';
import SeverityFilter, { SeverityLevel } from '@/components/SeverityFilter';
import DateRangeFilter, { DateRange } from '@/components/DateRangeFilter';
import LineGraph from '@/components/LineGraph';
import { isAfter, subDays, subMonths } from 'date-fns';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const Index: React.FC = () => {
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [filteredWarnings, setFilteredWarnings] = useState<Warning[]>([]);
  const [selectedWarningId, setSelectedWarningId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedSeverities, setSelectedSeverities] = useState<SeverityLevel[]>(['high', 'medium', 'low']);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>('24h');
  const isMobile = useIsMobile();

  // Function to load warnings data
  const loadWarnings = async () => {
    setIsLoading(true);
    try {
      // Fetch warnings from Google Sheets
      const data = await getWarnings();
      setWarnings(data);
      
      // Apply filters
      const filtered = applyFilters(data, selectedSeverities, selectedDateRange);
      setFilteredWarnings(filtered);

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

  // Apply both severity and date range filters
  const applyFilters = (allWarnings: Warning[], severities: SeverityLevel[], dateRange: DateRange): Warning[] => {
    // First, filter by date range
    const dateFiltered = filterByDateRange(allWarnings, dateRange);
    
    // Then apply severity filter
    let result = dateFiltered.filter(warning => 
      severities.includes(warning.severity as SeverityLevel)
    );
    
    return result;
  };

  // Filter warnings by date range
  const filterByDateRange = (allWarnings: Warning[], range: DateRange): Warning[] => {
    const now = new Date();
    let cutoffDate: Date;
    
    switch (range) {
      case '7d':
        cutoffDate = subDays(now, 7);
        break;
      case '30d':
        cutoffDate = subDays(now, 30);
        break;
      case '24h':
      default:
        cutoffDate = subDays(now, 1);
        break;
    }
    
    return allWarnings.filter(warning => {
      const warningDate = new Date(warning.timestamp);
      return isAfter(warningDate, cutoffDate);
    });
  };

  // Check if a warning is within the current date range
  const isWarningInDateRange = (warningId: string, dateRange: DateRange): boolean => {
    if (!warningId) return false;
    
    const warning = warnings.find(w => w.id === warningId);
    if (!warning) return false;
    
    const now = new Date();
    let cutoffDate: Date;
    
    switch (dateRange) {
      case '7d':
        cutoffDate = subDays(now, 7);
        break;
      case '30d':
        cutoffDate = subDays(now, 30);
        break;
      case '24h':
      default:
        cutoffDate = subDays(now, 1);
        break;
    }
    
    const warningDate = new Date(warning.timestamp);
    return isAfter(warningDate, cutoffDate);
  };

  // Check if a warning's severity is included in the selected severities
  const isWarningSeveritySelected = (warningId: string, severities: SeverityLevel[]): boolean => {
    if (!warningId) return false;
    
    const warning = warnings.find(w => w.id === warningId);
    if (!warning) return false;
    
    return severities.includes(warning.severity as SeverityLevel);
  };

  // Load warnings data on component mount
  useEffect(() => {
    loadWarnings();
  }, []);

  // Apply filters when dependencies change
  useEffect(() => {
    if (warnings.length > 0) {
      // Apply filters to get new filtered warnings
      const filtered = applyFilters(warnings, selectedSeverities, selectedDateRange);
      setFilteredWarnings(filtered);
      
      // Check if selected warning is in the filtered results
      const isSelectedWarningInFiltered = selectedWarningId && 
        filtered.some(w => w.id === selectedWarningId);
      
      // If the selected warning is not in filtered results, close the popup
      if (selectedWarningId && !isSelectedWarningInFiltered) {
        // Close popup if warning doesn't match current filters
        setSelectedWarningId(null);
        setShowPopup(false);
        
        // Determine the reason for hiding
        const warning = warnings.find(w => w.id === selectedWarningId);
        if (warning) {
          const isInDateRange = isWarningInDateRange(selectedWarningId, selectedDateRange);
          const isInSeverity = selectedSeverities.includes(warning.severity as SeverityLevel);
          
          if (!isInDateRange) {
            toast({
              title: "Warning hidden",
              description: "Selected warning is outside the chosen time period",
            });
          } else if (!isInSeverity) {
            toast({
              title: "Warning hidden",
              description: "Selected warning's severity is no longer in filter",
            });
          }
        }
      }
      
      // Log for debugging
      console.log(`Filtered to ${filtered.length} warnings from ${warnings.length} total`);
    }
  }, [warnings, selectedSeverities, selectedDateRange]);

  // Function to manually refresh the data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Force a refresh of the data
      const data = await refreshWarnings();
      setWarnings(data);
      
      // Apply filters to the new data
      const filtered = applyFilters(data, selectedSeverities, selectedDateRange);
      setFilteredWarnings(filtered);
      
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
      // Only select if this warning passes the current filters
      const warning = warnings.find(w => w.id === warningId);
      
      if (warning) {
        const passesDateFilter = isWarningInDateRange(warningId, selectedDateRange);
        const passesSeverityFilter = selectedSeverities.includes(warning.severity as SeverityLevel);
        
        if (passesDateFilter && passesSeverityFilter) {
          setSelectedWarningId(warningId);
          setShowPopup(true);
        } else {
          toast({
            title: "Cannot select warning",
            description: "This warning is filtered out by your current settings",
            variant: "destructive",
          });
        }
      }
    }
  };

  // Handle severity filter change
  const handleSeverityChange = (severity: SeverityLevel, isChecked: boolean) => {
    // Calculate new severities first
    let newSeverities: SeverityLevel[];
    
    if (isChecked) {
      // Add severity if it's not already in the array
      newSeverities = selectedSeverities.includes(severity) 
        ? selectedSeverities 
        : [...selectedSeverities, severity];
    } else {
      // Remove severity from the array
      newSeverities = selectedSeverities.filter(s => s !== severity);
    }
    
    // Update state with new severities
    setSelectedSeverities(newSeverities);
    
    // Check if selected warning will still be visible with new severities
    if (selectedWarningId) {
      const selectedWarning = warnings.find(w => w.id === selectedWarningId);
      
      if (selectedWarning && !newSeverities.includes(selectedWarning.severity as SeverityLevel)) {
        // If warning won't be visible with new filters, close it
        setSelectedWarningId(null);
        setShowPopup(false);
        
        toast({
          title: "Warning hidden",
          description: "Selected warning's severity is no longer in filter",
        });
      }
    }
  };

  // Handle date range filter change
  const handleDateRangeChange = (range: DateRange) => {
    // Update state with new date range
    setSelectedDateRange(range);
    
    // Check if selected warning will still be visible with new date range
    if (selectedWarningId && !isWarningInDateRange(selectedWarningId, range)) {
      // If warning won't be visible with new date range, close it
      setSelectedWarningId(null);
      setShowPopup(false);
      
      toast({
        title: "Warning hidden",
        description: "Selected warning is outside the chosen time period",
      });
    }
  };

  // Close popup
  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedWarningId(null);
  };

  // Get the selected warning
  const selectedWarning = selectedWarningId 
    ? warnings.find(w => w.id === selectedWarningId) || null 
    : null;

  // Convert date range to days for LineGraph
  const getDateRangeInDays = (): number => {
    switch (selectedDateRange) {
      case '30d': return 30;
      case '7d': return 7;
      case '24h': return 1; // 1 day (24 hours)
      default: return 7;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header with UC Berkeley Branding */}
      <header className="bg-[#003262] text-white border-b border-[#FDB515] shadow-md">
        <div className="container mx-auto py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/dd661f0b-163d-4e06-a843-fdf50cbeab8b.png" 
                alt="UC Berkeley Logo" 
                className="cal-logo h-10 md:h-12 mr-3" 
              />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  StaySafe Berkeley
                </h1>
                <p className="hidden md:block text-base text-[#FDB515] font-medium mt-1">
                  Interactive map of campus safety alerts and warnings
                </p>
              </div>
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
            {/* Left column - Map Container and Filters */}
            <div className="md:col-span-2 flex flex-col h-full">
              {/* Map container with fixed height on desktop */}
              <div className="relative h-[40vh] md:h-[60vh] bg-gray-100 rounded-lg border overflow-hidden">
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
              
              {/* Filters - Side by side on desktop, stacked on mobile */}
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <SeverityFilter 
                  selectedSeverities={selectedSeverities}
                  onSeverityChange={handleSeverityChange}
                />
                <DateRangeFilter
                  selectedRange={selectedDateRange}
                  onRangeChange={handleDateRangeChange}
                />
              </div>
            </div>

            {/* Right Side - Line Graph and Warnings Log */}
            <div className="flex flex-col h-[calc(60vh-8rem)] md:h-full gap-4">
              {/* Line Graph */}
              <div className="flex-none">
                <LineGraph 
                  warnings={warnings} 
                  days={getDateRangeInDays()}
                />
              </div>
              
              {/* Warnings Log - Key fix: max-h-full to ensure proper height constraints */}
              <div className="flex-1 border rounded-lg overflow-hidden bg-white h-[400px] md:h-auto">
                <WarningLog 
                  warnings={filteredWarnings}
                  selectedWarningId={selectedWarningId}
                  onWarningSelect={handleWarningSelect}
                  dateRange={selectedDateRange}
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
