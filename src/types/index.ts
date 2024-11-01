
export interface Warning {
  id: string;
  timestamp: string;
  type: WarningType;
  title: string;
  description: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  severity: 'low' | 'medium' | 'high';
}

export type WarningType = 
  | 'earthquake' 
  | 'fire' 
  | 'weather' 
  | 'police' 
  | 'hazmat' 
  | 'power' 
  | 'protest' 
  | 'other';
