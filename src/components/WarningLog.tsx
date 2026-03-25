
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Warning } from '@/types';
import { formatDistanceToNow, isAfter, subDays, subMonths } from 'date-fns';
import { getWarningTypeIcon, getWarningTypeColor, getSeverityColor } from '@/services/warningService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { AlertTriangle, Clock } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { DateRange } from '@/components/DateRangeFilter';
import { useIsMobile } from '@/hooks/use-mobile';

interface WarningLogProps {
  warnings: Warning[];
  selectedWarningId: string | null;
  onWarningSelect: (warningId: string) => void;
  dateRange?: DateRange;
}

const WarningLog: React.FC<WarningLogProps> = ({ 
  warnings, 
  selectedWarningId, 
  onWarningSelect,
  dateRange = '24h'
}) => {
  const isMobile = useIsMobile();

  // Filter warnings based on date range
  const getFilteredWarnings = () => {
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
    
    return warnings.filter(warning => 
      isAfter(new Date(warning.timestamp), cutoffDate)
    );
  };

  const filteredWarnings = getFilteredWarnings();

  // Sort warnings by timestamp (most recent first)
  const sortedWarnings = [...filteredWarnings].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Handle click on a warning
  const handleWarningClick = (warningId: string) => {
    onWarningSelect(warningId);
  };

  // Helper to render the correct icon
  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className="h-4 w-4" />;
    }
    return <AlertTriangle className="h-4 w-4" />;
  };

  // Get title text based on date range
  const getLogTitle = () => {
    switch (dateRange) {
      case '7d': return 'Last 7 Days Warnings';
      case '30d': return 'Last 30 Days Warnings';
      case '24h':
      default: return 'Recent Warnings';
    }
  };

  // Get subtitle text based on date range
  const getLogSubtitle = () => {
    switch (dateRange) {
      case '7d': return 'Last 7 days - Click to view details';
      case '30d': return 'Last 30 days - Click to view details';
      case '24h':
      default: return 'Last 24 hours - Click to view details';
    }
  };

  // Calculate the height based on mobile or desktop
  // Each warning card is approximately 96px in height
  // For mobile, show at least 3 warnings (previously was 2)
  const getScrollAreaHeight = () => {
    const warningHeight = 96;
    const displayCount = isMobile ? 3 : 4;
    return `${warningHeight * displayCount}px`;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex-shrink-0">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500" />
          <span>{getLogTitle()}</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          {getLogSubtitle()}
        </p>
      </div>
      
      {/* Using ScrollArea component for controlled scrolling with fixed height */}
      <ScrollArea className="flex-1" style={{ height: getScrollAreaHeight() }}>
        <div className="divide-y">
          <AnimatePresence initial={false}>
            {sortedWarnings.length > 0 ? (
              sortedWarnings.map((warning, index) => {
                const isSelected = warning.id === selectedWarningId;
                const timeAgo = formatDistanceToNow(new Date(warning.timestamp), { addSuffix: true });
                const iconName = getWarningTypeIcon(warning.type);
                const typeColor = getWarningTypeColor(warning.type);
                const severityColor = getSeverityColor(warning.severity);

                return (
                  <motion.div
                    key={warning.id}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.18, delay: index * 0.035 }}
                    className={cn(
                      "p-4 cursor-pointer hover:bg-gray-50 transition-colors",
                      isSelected && "bg-gray-100 hover:bg-gray-100 border-l-4",
                    )}
                    style={{ borderLeftColor: isSelected ? typeColor : 'transparent' }}
                    onClick={() => handleWarningClick(warning.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center mt-0.5"
                        style={{ backgroundColor: `${typeColor}20`, color: typeColor }}
                      >
                        {renderIcon(iconName)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ backgroundColor: severityColor }}
                          />
                          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            {warning.type}
                          </span>
                        </div>

                        <h3 className="font-medium text-sm line-clamp-1">{warning.title}</h3>

                        <div className="flex items-center mt-1 text-xs text-gray-500 gap-3">
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>{timeAgo}</span>
                          </div>
                          <span className="line-clamp-1">{warning.location}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 text-center text-gray-500"
              >
                <p>No warnings in the selected time period</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
};

export default WarningLog;
