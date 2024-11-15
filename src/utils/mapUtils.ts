
import { WarningType } from "@/types";

// Check if a warning is of a high-danger type
export const isHighDangerWarning = (type: WarningType): boolean => {
  return ['violent_crime', 'shots_fired', 'robbery'].includes(type);
};

// Default map center (UC Berkeley)
export const defaultCenter = {
  lat: 37.8719,
  lng: -122.2590
};

// Custom styles to hide Google's logos and attributions
export const mapStyles = [
  {
    featureType: "administrative",
    elementType: "labels.text",
    stylers: [{ visibility: "on" }]
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "road",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#e9e9e9" }]
  }
];

// Container style for the map
export const containerStyle = {
  width: '100%',
  height: '100%'
};

// Default map options
export const getMapOptions = () => ({
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  mapTypeId: "roadmap",
  styles: mapStyles,
  gestureHandling: "greedy"
});
