
import { Warning, WarningType } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { fetchWarningsFromGoogleSheetCSV } from "./googleSheetsService";
import { addDays, addHours, format, subDays, subHours, subMonths } from "date-fns";

// Generate a timestamp within a specific time range
const generateTimestamp = (daysAgo: number, hoursOffset: number = 0): string => {
  const now = new Date();
  const date = subDays(now, daysAgo);
  // Add hours offset to distribute events throughout the day
  return addHours(date, hoursOffset).toISOString();
};

// Sample data as primary source since Google Sheets integration is disabled
const SAMPLE_WARNINGS: Warning[] = [
  // Recent warnings (within 24 hours)
  {
    id: uuidv4(),
    timestamp: generateTimestamp(0, -2), // 2 hours ago
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
    timestamp: generateTimestamp(0, -5), // 5 hours ago
    type: "fire",
    title: "Fire Alarm — Chemistry Building",
    description: "Fire alarm activated in Chemistry Building. Fire department on scene. Building evacuated as a precaution.",
    location: "Chemistry Building",
    coordinates: {
      latitude: 37.8734,
      longitude: -122.2555
    },
    severity: "medium"
  },
  {
    id: uuidv4(),
    timestamp: generateTimestamp(0, -8), // 8 hours ago
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
    timestamp: generateTimestamp(0, -14), // 14 hours ago
    type: "power",
    title: "Power Outage",
    description: "Brief power outage affecting north side of campus. Systems restored.",
    location: "North Campus",
    coordinates: {
      latitude: 37.8752,
      longitude: -122.2583
    },
    severity: "low"
  },
  {
    id: uuidv4(),
    timestamp: generateTimestamp(0, -20), // 20 hours ago
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

  // Past week (but more than 24h ago)
  {
    id: uuidv4(),
    timestamp: generateTimestamp(2, -4), // 2 days, 4 hours ago
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
    timestamp: generateTimestamp(3, -12), // 3 days, 12 hours ago
    type: "hazmat",
    title: "Chemical Spill",
    description: "Minor chemical spill in Engineering Building. Hazmat team on site. Area cordoned off.",
    location: "Engineering Building",
    coordinates: {
      latitude: 37.8742,
      longitude: -122.2584
    },
    severity: "high"
  },
  {
    id: uuidv4(),
    timestamp: generateTimestamp(4, -6), // 4 days, 6 hours ago
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
    timestamp: generateTimestamp(5, -15), // 5 days, 15 hours ago
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

  // Past month (but more than a week ago)
  {
    id: uuidv4(),
    timestamp: generateTimestamp(10, -10), // 10 days ago
    type: "fire",
    title: "Fire Alarm — Wheeler Hall",
    description: "Fire alarm triggered near Wheeler Hall. Fire department responded and cleared the scene. No damage.",
    location: "Wheeler Hall",
    coordinates: {
      latitude: 37.8711,
      longitude: -122.2594
    },
    severity: "low"
  },
  {
    id: uuidv4(),
    timestamp: generateTimestamp(14, -5), // 14 days ago
    type: "police",
    title: "Police Investigation",
    description: "Police investigating report of suspicious package. Area cleared as safe.",
    location: "Dwinelle Hall",
    coordinates: {
      latitude: 37.8705,
      longitude: -122.2605
    },
    severity: "medium"
  },
  {
    id: uuidv4(),
    timestamp: generateTimestamp(18, -14), // 18 days ago
    type: "robbery",
    title: "Phone Theft",
    description: "Student reports phone snatched from table at cafe. Suspect description provided to police.",
    location: "Northside",
    coordinates: {
      latitude: 37.8762,
      longitude: -122.2608
    },
    severity: "medium"
  },
  {
    id: uuidv4(),
    timestamp: generateTimestamp(22, -3), // 22 days ago
    type: "weather",
    title: "Flash Flood Warning",
    description: "Heavy rain causing localized flooding in low-lying areas. Use caution when walking.",
    location: "Campus-wide",
    coordinates: {
      latitude: 37.8719,
      longitude: -122.2585
    },
    severity: "medium"
  },
  {
    id: uuidv4(),
    timestamp: generateTimestamp(26, -7), // 26 days ago
    type: "hazmat",
    title: "Gas Leak",
    description: "Minor gas leak detected in Life Sciences Building. Building evacuated as precaution.",
    location: "Life Sciences Building",
    coordinates: {
      latitude: 37.8715,
      longitude: -122.2625
    },
    severity: "medium"
  },

  // Past three months (but more than a month ago)
  {
    id: uuidv4(),
    timestamp: generateTimestamp(35, -9), // 35 days ago
    type: "power",
    title: "Campus Blackout",
    description: "Power outage affecting multiple buildings. Backup generators activated.",
    location: "West Campus",
    coordinates: {
      latitude: 37.8730,
      longitude: -122.2665
    },
    severity: "high"
  },
  {
    id: uuidv4(),
    timestamp: generateTimestamp(45, -12), // 45 days ago
    type: "protest",
    title: "Large Demonstration",
    description: "Large protest scheduled. Significant disruption to campus operations expected.",
    location: "Sproul Plaza",
    coordinates: {
      latitude: 37.8692,
      longitude: -122.2590
    },
    severity: "medium"
  },
  {
    id: uuidv4(),
    timestamp: generateTimestamp(55, -15), // 55 days ago
    type: "violent_crime",
    title: "Armed Robbery",
    description: "Armed robbery reported near campus housing. Increased patrols in the area.",
    location: "Southside",
    coordinates: {
      latitude: 37.8662,
      longitude: -122.2555
    },
    severity: "high"
  },
  {
    id: uuidv4(),
    timestamp: generateTimestamp(65, -5), // 65 days ago
    type: "earthquake",
    title: "Moderate Earthquake",
    description: "4.2 magnitude earthquake felt on campus. Building inspections underway.",
    location: "Berkeley",
    coordinates: {
      latitude: 37.8715,
      longitude: -122.2730
    },
    severity: "medium"
  },
  {
    id: uuidv4(),
    timestamp: generateTimestamp(85, -8), // 85 days ago
    type: "fire",
    title: "Fire Alarm — Northside Residential",
    description: "Fire alarm activated in residential building near campus. Multiple fire units responded. Building evacuated.",
    location: "Northside",
    coordinates: {
      latitude: 37.8766,
      longitude: -122.2598
    },
    severity: "high"
  }
];

// Cache the warnings to avoid unnecessary regeneration
let cachedWarnings: Warning[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Get warnings directly from sample data
export const getWarnings = async (): Promise<Warning[]> => {
  const currentTime = Date.now();
  
  // If we have cached warnings and they're not too old, return them
  if (cachedWarnings && (currentTime - lastFetchTime) < CACHE_DURATION) {
    return cachedWarnings;
  }
  
  // Always use sample data now that Google Sheets is unlinked
  cachedWarnings = SAMPLE_WARNINGS;
  lastFetchTime = currentTime;
  
  return SAMPLE_WARNINGS;
};

// Refresh warnings (now just resets cache and returns sample data)
export const refreshWarnings = async (): Promise<Warning[]> => {
  // Reset the cache
  cachedWarnings = null;
  
  // Return fresh sample data
  return await getWarnings();
};

export const getWarningTypeIcon = (type: WarningType): string => {
  switch (type) {
    case "earthquake":
      return "Waves";
    case "fire":
      return "BellRing";
    case "weather":
      return "CloudLightning";
    case "police":
      return "ShieldAlert";
    case "hazmat":
      return "Biohazard";
    case "power":
      return "ZapOff";
    case "protest":
      return "Megaphone";
    case "violent_crime":
      return "Swords";
    case "shots_fired":
      return "Crosshair";
    case "robbery":
      return "Wallet";
    default:
      return "AlertCircle";
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
      return "#8B5CF6"; // Vivid Purple
    case "shots_fired":
      return "#FF0000"; // Bright Red
    case "robbery": 
      return "#F97316"; // Bright Orange
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
