
import { Warning } from './index';

// Google Maps API key
export const GOOGLE_MAPS_API_KEY = 'AIzaSyAJ5I98cSgM_DVo3MGcCzX6eU75LXYYxIs';

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

// Extended Google Maps libraries to include visualization for heatmap
declare global {
  namespace google.maps {
    namespace visualization {
      class HeatmapLayer {
        constructor(opts?: HeatmapLayerOptions);
        setData(data: any[] | MVCArray<any>): void;
        setMap(map: Map | null): void;
        setOptions(options: HeatmapLayerOptions): void;
        getData(): MVCArray<any>;
        getMap(): Map | null;
      }

      interface HeatmapLayerOptions {
        data?: any[] | MVCArray<any>;
        map?: Map;
        dissipating?: boolean;
        gradient?: string[];
        maxIntensity?: number;
        opacity?: number;
        radius?: number;
      }

      interface WeightedLocation {
        location: LatLng;
        weight?: number;
      }
    }
  }
}
