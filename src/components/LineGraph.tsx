
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { differenceInDays, format, subDays } from 'date-fns';
import { Warning } from '@/types';

interface LineGraphProps {
  warnings: Warning[];
  days?: number;
}

interface DayData {
  date: string;
  count: number;
  formattedDate: string;
}

const LineGraph: React.FC<LineGraphProps> = ({ warnings, days = 7 }) => {
  const calculateDailyWarnings = (): DayData[] => {
    const today = new Date();
    const data: DayData[] = [];
    
    // Create entries for each of the days in the selected range
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const formattedDate = format(date, days > 30 ? 'MMM dd' : 'MM/dd');
      const dateString = format(date, 'yyyy-MM-dd');
      
      data.push({
        date: dateString,
        count: 0,
        formattedDate
      });
    }
    
    // Count warnings for each day
    warnings.forEach(warning => {
      const warningDate = new Date(warning.timestamp);
      const daysDiff = differenceInDays(today, warningDate);
      
      if (daysDiff >= 0 && daysDiff < days) {
        const index = days - 1 - daysDiff;
        if (index >= 0 && index < data.length) {
          data[index].count += 1;
        }
      }
    });
    
    return data;
  };

  const dailyWarnings = calculateDailyWarnings();
  
  // Get title based on number of days
  const getTitle = () => {
    if (days >= 90) return '3-Month Warning Trend';
    if (days >= 30) return '30-Day Warning Trend';
    if (days >= 7) return '7-Day Warning Trend';
    return '24-Hour Warning Trend';
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-4 h-64">
      <h3 className="text-lg font-semibold mb-2">{getTitle()}</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart
          data={dailyWarnings}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="formattedDate" 
            tick={{ fontSize: 12 }}
            interval={days > 30 ? "preserveStartEnd" : 0}
          />
          <YAxis 
            allowDecimals={false} 
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: 'white', borderRadius: '0.375rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}
            labelStyle={{ fontWeight: 'bold' }}
            formatter={(value) => [`${value} warnings`, 'Count']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="#003262" 
            strokeWidth={2}
            activeDot={{ r: 6, fill: '#FDB515', stroke: '#003262', strokeWidth: 2 }}
            dot={{ r: 4, fill: '#003262' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineGraph;
