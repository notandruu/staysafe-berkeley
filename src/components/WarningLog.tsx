
import React from 'react';
import { Warning } from '@/types';
import { formatDistanceToNow, isAfter, subDays } from 'date-fns';
import { getWarningTypeIcon, getWarningTypeColor, getSeverityColor } from '@/services/warningService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { AlertTriangle, Clock } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface WarningLogProps {
  warnings: Warning[];
  selectedWarningId: string | null;
  onWarningSelect: (warningId: string) => void;
}

const WarningLog: React.FC<WarningLogProps> = ({ 
  warnings, 
  selectedWarningId, 
  onWarningSelect 
}) => {
  // Filter warnings from the last 24 hours
  const last24Hours = subDays(new Date(), 1);
  const recentWarnings = warnings.filter(warning => 
    isAfter(new Date(warning.timestamp), last24Hours)
  );

  // Sort warnings by timestamp (most recent first)
  const sortedWarnings = [...recentWarnings].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Handle click on a warning
  const handleWarningClick = (warningId: string) => {
    onWarningSelect(warningId);
  };

  // Helper to render the correct icon
  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName.charAt(0).toUpperCase() + iconName.slice(1)];
    if (IconComponent) {
      return <IconComponent className="h-4 w-4" />;
    }
    return <AlertTriangle className="h-4 w-4" />;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500" />
          <span>Recent Warnings</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          Last 24 hours - Click to view details
        </p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {sortedWarnings.length > 0 ? (
            sortedWarnings.map(warning => {
              const isSelected = warning.id === selectedWarningId;
              const timeAgo = formatDistanceToNow(new Date(warning.timestamp), { addSuffix: true });
              const iconName = getWarningTypeIcon(warning.type);
              const typeColor = getWarningTypeColor(warning.type);
              const severityColor = getSeverityColor(warning.severity);
              
              return (
                <div
                  key={warning.id}
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
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p>No warnings in the last 24 hours</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default WarningLog;
