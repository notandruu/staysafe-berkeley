
import { Warning, WarningType } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Sample data - in a real application, this would come from an API or database
export const getWarnings = (): Warning[] => {
  return [
    {
      id: uuidv4(),
      timestamp: "2023-11-15T08:30:00Z",
      type: "earthquake",
      title: "Minor Earthquake Detected",
      description: "A 3.2 magnitude earthquake was detected near campus. No damage reported.",
      location: "Berkeley Hills",
      coordinates: {
        latitude: 37.8759,
        longitude: -122.2543
      },
      severity: "low"
    },
    {
      id: uuidv4(),
      timestamp: "2023-11-14T18:45:00Z",
      type: "police",
      title: "Police Activity",
      description: "Police responding to suspicious activity near Sproul Plaza. Please avoid the area.",
      location: "Sproul Plaza",
      coordinates: {
        latitude: 37.8692,
        longitude: -122.2590
      },
      severity: "medium"
    },
    {
      id: uuidv4(),
      timestamp: "2023-11-13T21:30:00Z",
      type: "violent_crime",
      title: "Assault Reported",
      description: "Assault reported near Telegraph Ave. Suspect fled the scene. Police investigating.",
      location: "Telegraph Avenue",
      coordinates: {
        latitude: 37.8671,
        longitude: -122.2580
      },
      severity: "high"
    },
    {
      id: uuidv4(),
      timestamp: "2023-11-13T20:15:00Z",
      type: "shots_fired",
      title: "Shots Fired",
      description: "Reports of shots fired. Police on scene. Please avoid the area.",
      location: "South Campus",
      coordinates: {
        latitude: 37.8662,
        longitude: -122.2565
      },
      severity: "high"
    },
    {
      id: uuidv4(),
      timestamp: "2023-11-12T14:20:00Z",
      type: "fire",
      title: "Small Fire Reported",
      description: "Small fire reported in Chemistry Building. Fire department on scene. Building evacuated.",
      location: "Chemistry Building",
      coordinates: {
        latitude: 37.8734,
        longitude: -122.2555
      },
      severity: "medium"
    },
    {
      id: uuidv4(),
      timestamp: "2023-11-12T10:10:00Z",
      type: "robbery",
      title: "Robbery Reported",
      description: "A student was robbed of their laptop near the library. Suspect fled on foot.",
      location: "Main Library",
      coordinates: {
        latitude: 37.8722,
        longitude: -122.2600
      },
      severity: "high"
    },
    {
      id: uuidv4(),
      timestamp: "2023-11-10T09:15:00Z",
      type: "weather",
      title: "High Wind Advisory",
      description: "High winds expected throughout the day. Secure loose items and be cautious of falling branches.",
      location: "Main Campus",
      coordinates: {
        latitude: 37.8719,
        longitude: -122.2614
      },
      severity: "low"
    },
    {
      id: uuidv4(),
      timestamp: "2023-11-08T22:00:00Z",
      type: "power",
      title: "Power Outage",
      description: "Power outage affecting north side of campus. Estimated restoration time: 2 hours.",
      location: "North Campus",
      coordinates: {
        latitude: 37.8752,
        longitude: -122.2583
      },
      severity: "medium"
    },
    {
      id: uuidv4(),
      timestamp: "2023-11-05T16:30:00Z",
      type: "protest",
      title: "Demonstration Advisory",
      description: "Peaceful demonstration taking place at Sather Gate. Expect increased foot traffic.",
      location: "Sather Gate",
      coordinates: {
        latitude: 37.8702,
        longitude: -122.2591
      },
      severity: "low"
    },
    {
      id: uuidv4(),
      timestamp: "2023-11-03T11:45:00Z",
      type: "hazmat",
      title: "Chemical Spill",
      description: "Minor chemical spill in Engineering Building. Hazmat team on site. Area cordoned off.",
      location: "Engineering Building",
      coordinates: {
        latitude: 37.8742,
        longitude: -122.2584
      },
      severity: "high"
    }
  ];
};

export const getWarningTypeIcon = (type: WarningType): string => {
  switch (type) {
    case "earthquake":
      return "layers";
    case "fire":
      return "flame";
    case "weather":
      return "cloud";
    case "police":
      return "shield";
    case "hazmat":
      return "flask";
    case "power":
      return "zap";
    case "protest":
      return "megaphone";
    case "violent_crime":
      return "fist";
    case "shots_fired":
      return "target";
    case "robbery":
      return "shopping-bag";
    default:
      return "alert-circle";
  }
};

export const getWarningTypeColor = (type: WarningType): string => {
  switch (type) {
    case "earthquake":
      return "#8B4513"; // Brown
    case "fire":
      return "#FF4500"; // Red-Orange
    case "weather":
      return "#4682B4"; // Steel Blue
    case "police":
      return "#0000CD"; // Medium Blue
    case "hazmat":
      return "#9ACD32"; // Yellow-Green
    case "power":
      return "#FFD700"; // Gold
    case "protest":
      return "#DA70D6"; // Orchid
    case "violent_crime":
      return "#FF0000"; // Bright Red
    case "shots_fired":
      return "#ea384c"; // Deep Red
    case "robbery": 
      return "#FF4500"; // Red-Orange
    default:
      return "#808080"; // Gray
  }
};

export const getSeverityColor = (severity: Warning['severity']): string => {
  switch (severity) {
    case "low":
      return "#4CAF50"; // Green
    case "medium":
      return "#FF9800"; // Orange
    case "high":
      return "#F44336"; // Red
    default:
      return "#808080"; // Gray
  }
};

