
import React, { useState, useEffect } from 'react';
import Map from '@/components/Map';
import WarningLog from '@/components/WarningLog';
import WarningPopup from '@/components/WarningPopup';
import CameraFeeds from '@/components/CameraFeeds';
import { Warning } from '@/types';
import { getWarnings, refreshWarnings } from '@/services/warningService';
import { useIsMobile } from '@/hooks/use-mobile';
import SeverityFilter, { SeverityLevel } from '@/components/SeverityFilter';
import DateRangeFilter, { DateRange } from '@/components/DateRangeFilter';
import LineGraph from '@/components/LineGraph';
import { isAfter, subDays, subMonths, format } from 'date-fns';
import { RefreshCw, Shield, AlertTriangle, Map as MapIcon } from 'lucide-react';
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

  const loadWarnings = async () => {
    setIsLoading(true);
    try {
      const data = await getWarnings();
      setWarnings(data);
      
      const filtered = applyFilters(data, selectedSeverities, selectedDateRange);
      setFilteredWarnings(filtered);

      if (isRefreshing) {
        const currentTime = format(new Date(), 'h:mm a');
        toast({
          title: "Data refreshed",
          description: `Loaded ${data.length} warnings from WarnMe database at ${currentTime}`,
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

  const applyFilters = (allWarnings: Warning[], severities: SeverityLevel[], dateRange: DateRange): Warning[] => {
    const dateFiltered = filterByDateRange(allWarnings, dateRange);
    
    let result = dateFiltered.filter(warning => 
      severities.includes(warning.severity as SeverityLevel)
    );
    
    return result;
  };

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

  const isWarningSeveritySelected = (warningId: string, severities: SeverityLevel[]): boolean => {
    if (!warningId) return false;
    
    const warning = warnings.find(w => w.id === warningId);
    if (!warning) return false;
    
    return severities.includes(warning.severity as SeverityLevel);
  };

  useEffect(() => {
    loadWarnings();
  }, []);

  useEffect(() => {
    if (warnings.length > 0) {
      const filtered = applyFilters(warnings, selectedSeverities, selectedDateRange);
      setFilteredWarnings(filtered);
      
      const isSelectedWarningInFiltered = selectedWarningId && 
        filtered.some(w => w.id === selectedWarningId);
      
      if (selectedWarningId && !isSelectedWarningInFiltered) {
        setSelectedWarningId(null);
        setShowPopup(false);
        
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
      
      console.log(`Filtered to ${filtered.length} warnings from ${warnings.length} total`);
    }
  }, [warnings, selectedSeverities, selectedDateRange]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await refreshWarnings();
      setWarnings(data);
      
      const filtered = applyFilters(data, selectedSeverities, selectedDateRange);
      setFilteredWarnings(filtered);
      
      const currentTime = format(new Date(), 'h:mm a');
      toast({
        title: "Data refreshed",
        description: `Loaded ${data.length} warnings from WarnMe database at ${currentTime}`,
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

  const handleWarningSelect = (warningId: string) => {
    if (selectedWarningId === warningId) {
      setSelectedWarningId(null);
      setShowPopup(false);
    } else {
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

  const handleSeverityChange = (severity: SeverityLevel, isChecked: boolean) => {
    let newSeverities: SeverityLevel[];
    
    if (isChecked) {
      newSeverities = selectedSeverities.includes(severity) 
        ? selectedSeverities 
        : [...selectedSeverities, severity];
    } else {
      newSeverities = selectedSeverities.filter(s => s !== severity);
    }
    
    setSelectedSeverities(newSeverities);
    
    if (selectedWarningId) {
      const selectedWarning = warnings.find(w => w.id === selectedWarningId);
      
      if (selectedWarning && !newSeverities.includes(selectedWarning.severity as SeverityLevel)) {
        setSelectedWarningId(null);
        setShowPopup(false);
        
        toast({
          title: "Warning hidden",
          description: "Selected warning's severity is no longer in filter",
        });
      }
    }
  };

  const handleDateRangeChange = (range: DateRange) => {
    setSelectedDateRange(range);
    
    if (selectedWarningId && !isWarningInDateRange(selectedWarningId, range)) {
      setSelectedWarningId(null);
      setShowPopup(false);
      
      toast({
        title: "Warning hidden",
        description: "Selected warning is outside the chosen time period",
      });
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedWarningId(null);
  };

  const selectedWarning = selectedWarningId 
    ? warnings.find(w => w.id === selectedWarningId) || null 
    : null;

  const getDateRangeInDays = (): number => {
    switch (selectedDateRange) {
      case '30d': return 30;
      case '7d': return 7;
      case '24h': return 1;
      default: return 7;
    }
  };

  // Generate AI safety summary based on warning data
  const generateSafetySummary = () => {
    if (filteredWarnings.length === 0) {
      return "No current safety concerns detected in the selected time period.";
    }

    // Count warnings by area
    const areaWarnings: Record<string, number> = {};
    const highRiskAreas: string[] = [];
    
    filteredWarnings.forEach(warning => {
      const area = warning.location.split(',')[0].trim();
      areaWarnings[area] = (areaWarnings[area] || 0) + 1;
      
      if (warning.severity === 'high') {
        if (!highRiskAreas.includes(area)) {
          highRiskAreas.push(area);
        }
      }
    });
    
    // Sort areas by warning count
    const sortedAreas = Object.entries(areaWarnings)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([area]) => area);
      
    const recentHighSeverity = filteredWarnings.some(w => 
      w.severity === 'high' && 
      isAfter(new Date(w.timestamp), subDays(new Date(), 1))
    );
    
    // Generate summary text
    if (recentHighSeverity) {
      return `CAUTION: Recent high-severity incidents reported. Areas to avoid: ${sortedAreas.join(', ')}. ${highRiskAreas.length > 0 ? `High risk areas: ${highRiskAreas.join(', ')}.` : ''}`;
    } else if (sortedAreas.length > 0) {
      return `Exercise caution around: ${sortedAreas.join(', ')}. ${highRiskAreas.length > 0 ? `Avoid after dark: ${highRiskAreas.join(', ')}.` : ''}`;
    } else {
      return "Exercise normal caution around campus areas.";
    }
  };

  const safetySummary = generateSafetySummary();

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="bg-[#003262] text-white border-b border-[#FDB515] shadow-md">
        <div className="container mx-auto py-3 px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Berkeley Safety
              </h1>
              <p className="hidden md:block text-base text-[#FDB515] font-medium mt-1">
                Interactive map of campus safety alerts and warnings
              </p>
            </div>
            
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

      <main className="flex-1 overflow-y-auto container mx-auto p-4 pb-8">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#003262]/30 border-t-[#003262] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading warnings...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-6">
            {/* Map and Warnings Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 flex flex-col h-full">
                <div className="relative h-[60vh] md:h-[60vh] bg-gray-100 rounded-lg border overflow-hidden">
                  <Map 
                    warnings={filteredWarnings}
                    selectedWarningId={selectedWarningId}
                    onWarningSelect={handleWarningSelect}
                  />
                  
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
                
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <SeverityFilter 
                    selectedSeverities={selectedSeverities}
                    onSeverityChange={handleSeverityChange}
                  />
                  <DateRangeFilter
                    selectedRange={selectedDateRange}
                    onRangeChange={handleDateRangeChange}
                  />
                </div>

                {/* AI Safety Summary - Desktop Only */}
                <div className="hidden md:block mt-3">
                  <div className={`p-3 rounded-lg flex items-start gap-3 ${
                    safetySummary.includes("CAUTION") 
                      ? "bg-red-50 border border-red-200" 
                      : safetySummary.includes("Exercise caution") 
                        ? "bg-amber-50 border border-amber-200"
                        : "bg-green-50 border border-green-200"
                  }`}>
                    <div className={`rounded-full p-1.5 ${
                      safetySummary.includes("CAUTION") 
                        ? "bg-red-100 text-red-600" 
                        : safetySummary.includes("Exercise caution")
                          ? "bg-amber-100 text-amber-600" 
                          : "bg-green-100 text-green-600"
                    }`}>
                      {safetySummary.includes("CAUTION") 
                        ? <AlertTriangle size={18} /> 
                        : safetySummary.includes("Exercise caution")
                          ? <MapIcon size={18} /> 
                          : <Shield size={18} />
                      }
                    </div>
                    <div>
                      <h3 className={`text-sm font-medium ${
                        safetySummary.includes("CAUTION") 
                          ? "text-red-800" 
                          : safetySummary.includes("Exercise caution")
                            ? "text-amber-800" 
                            : "text-green-800"
                      }`}>
                        {safetySummary.includes("CAUTION") 
                          ? "Safety Alert" 
                          : safetySummary.includes("Exercise caution")
                            ? "Areas to Watch" 
                            : "Safety Status"}
                      </h3>
                      <p className="text-sm mt-0.5">{safetySummary}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`flex flex-col ${isMobile ? 'h-[50vh]' : 'h-full'} gap-4`}>
                <div className="flex-none">
                  <LineGraph 
                    warnings={warnings} 
                    days={getDateRangeInDays()}
                  />
                </div>
                
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

            {/* Live Camera Feeds Section */}
            <div className="mt-6">
              <CameraFeeds />
            </div>
          </div>
        )}
      </main>

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
