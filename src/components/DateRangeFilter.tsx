
import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarDays } from 'lucide-react';

export type DateRange = '24h' | '7d' | '30d';

interface DateRangeFilterProps {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  selectedRange,
  onRangeChange,
}) => {
  return (
    <div className="bg-white border rounded-lg p-3 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Date Range</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={selectedRange === '24h' ? 'default' : 'outline'}
          onClick={() => onRangeChange('24h')}
          className="flex-1"
        >
          24 Hours
        </Button>
        <Button
          size="sm"
          variant={selectedRange === '7d' ? 'default' : 'outline'}
          onClick={() => onRangeChange('7d')}
          className="flex-1"
        >
          7 Days
        </Button>
        <Button
          size="sm"
          variant={selectedRange === '30d' ? 'default' : 'outline'}
          onClick={() => onRangeChange('30d')}
          className="flex-1"
        >
          30 Days
        </Button>
      </div>
    </div>
  );
};

export default DateRangeFilter;
