
import { Warning } from './index';

export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export interface MapProps {
  warnings: Warning[];
  selectedWarningId: string | null;
  onWarningSelect: (warningId: string) => void;
}

export interface GeocodedWarning extends Warning {
  geocodedPosition?: {
    lat: number;
    lng: number;
  };
}

export interface MarkerOptions {
  path: google.maps.SymbolPath;
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWeight: number;
  scale: number;
  zIndex: number;
  animation?: google.maps.Animation;
}
