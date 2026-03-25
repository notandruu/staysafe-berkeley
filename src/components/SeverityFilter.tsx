
import React from 'react';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export type SeverityLevel = 'high' | 'medium' | 'low';

interface SeverityFilterProps {
  selectedSeverities: SeverityLevel[];
  onSeverityChange: (severity: SeverityLevel, isChecked: boolean) => void;
}

const SeverityFilter: React.FC<SeverityFilterProps> = ({
  selectedSeverities,
  onSeverityChange,
}) => {
  const severityOptions: { label: string; value: SeverityLevel; color: string }[] = [
    { label: 'High', value: 'high', color: 'bg-red-500' },
    { label: 'Medium', value: 'medium', color: 'bg-amber-500' },
    { label: 'Low', value: 'low', color: 'bg-blue-500' },
  ];

  return (
    <div className="flex flex-col sm:flex-row p-3 bg-white rounded-lg shadow-sm border">
      <div className="text-sm font-medium text-gray-700 mb-2 sm:mb-0 sm:mr-2">Filter by severity:</div>
      <div className="flex flex-wrap gap-4">
        {severityOptions.map((option) => (
          <motion.div key={option.value} whileTap={{ scale: 0.93 }} className="flex items-center space-x-2">
            <Checkbox
              id={`severity-${option.value}`}
              checked={selectedSeverities.includes(option.value)}
              onCheckedChange={(checked) => {
                onSeverityChange(option.value, checked === true);
              }}
            />
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${option.color}`} />
              <Label
                htmlFor={`severity-${option.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SeverityFilter;
