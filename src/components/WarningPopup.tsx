
import React from 'react';
import { Warning } from '@/types';
import { format } from 'date-fns';
import { getWarningTypeIcon, getSeverityColor } from '@/services/warningService';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface WarningPopupProps {
  warning: Warning | null;
  onClose: () => void;
}

const WarningPopup: React.FC<WarningPopupProps> = ({ warning, onClose }) => {
  if (!warning) return null;

  const formattedDate = format(new Date(warning.timestamp), 'MMM d, yyyy h:mm a');
  const icon = getWarningTypeIcon(warning.type);
  const severityColor = getSeverityColor(warning.severity);

  return (
    <Card className="w-full max-w-md shadow-lg animate-in fade-in slide-in-from-right-5 duration-300">
      <CardHeader className="pb-2 relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <div className="flex items-center gap-2 mb-1">
          <Badge 
            variant="outline" 
            className="capitalize text-xs py-0 h-5"
          >
            {warning.type}
          </Badge>
          <Badge 
            className="text-xs py-0 h-5"
            style={{ backgroundColor: severityColor }}
          >
            {warning.severity} severity
          </Badge>
        </div>
        <CardTitle className="text-xl">{warning.title}</CardTitle>
        <div className="text-sm text-muted-foreground">{formattedDate}</div>
      </CardHeader>
      <CardContent>
        <div className="text-sm mb-3">{warning.description}</div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-muted-foreground">Location:</span> 
          <span>{warning.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium mt-1">
          <span className="text-muted-foreground">Coordinates:</span> 
          <span>{warning.coordinates.latitude.toFixed(4)}, {warning.coordinates.longitude.toFixed(4)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default WarningPopup;
