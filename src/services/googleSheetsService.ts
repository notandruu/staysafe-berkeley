
import axios from 'axios';
import { Warning, WarningType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// This interface defines the structure of data expected from the Google Sheet
interface GoogleSheetWarningRow {
  timestamp: string;
  type: string;
  title: string;
  description: string;
  location: string;
  latitude: string;
  longitude: string;
  severity: string;
}

// Map to convert spreadsheet type names to our application's WarningType format
const typeMapping: Record<string, WarningType> = {
  'earthquake': 'earthquake',
  'fire': 'fire',
  'weather': 'weather',
  'police': 'police',
  'hazmat': 'hazmat',
  'power': 'power',
  'protest': 'protest',
  'violent crime': 'violent_crime',
  'shots fired': 'shots_fired',
  'robbery': 'robbery',
  'other': 'other'
};

// Helper function to normalize type strings from spreadsheet
const normalizeType = (typeStr: string): WarningType => {
  // Convert to lowercase for case-insensitive matching
  const normalizedStr = typeStr.toLowerCase().trim();
  
  // Try to find in our mapping
  if (typeMapping[normalizedStr]) {
    return typeMapping[normalizedStr];
  }
  
  // If not found, handle common cases
  if (normalizedStr.includes('earthquake')) return 'earthquake';
  if (normalizedStr.includes('fire')) return 'fire';
  if (normalizedStr.includes('weather')) return 'weather';
  if (normalizedStr.includes('police')) return 'police';
  if (normalizedStr.includes('hazmat')) return 'hazmat';
  if (normalizedStr.includes('power')) return 'power';
  if (normalizedStr.includes('protest')) return 'protest';
  if (normalizedStr.includes('violent') || normalizedStr.includes('assault')) return 'violent_crime';
  if (normalizedStr.includes('shot') || normalizedStr.includes('gun')) return 'shots_fired';
  if (normalizedStr.includes('robbery') || normalizedStr.includes('theft')) return 'robbery';
  
  // Default to 'other' if no match
  console.warn(`Unknown warning type "${typeStr}" - defaulting to "other"`);
  return 'other';
};

// Convert a Google Sheet row to our Warning type
const convertRowToWarning = (row: GoogleSheetWarningRow): Warning => {
  // Normalize warning type from spreadsheet
  const normalizedType = normalizeType(row.type);
  
  // Normalize severity to match our expected values
  let normalizedSeverity: Warning['severity'] = 'medium';
  const severityStr = row.severity.toLowerCase().trim();
  
  if (['low', 'minor', 'light', '1'].includes(severityStr)) {
    normalizedSeverity = 'low';
  } else if (['high', 'major', 'severe', 'critical', '3'].includes(severityStr)) {
    normalizedSeverity = 'high';
  } else if (['medium', 'moderate', 'mid', '2'].includes(severityStr)) {
    normalizedSeverity = 'medium';
  }
  
  return {
    id: uuidv4(), // Generate a unique ID for each warning
    timestamp: row.timestamp,
    type: normalizedType,
    title: row.title,
    description: row.description,
    location: row.location,
    coordinates: {
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude)
    },
    severity: normalizedSeverity
  };
};

// Function to validate if a row has all required fields
const isValidWarningRow = (row: any): row is GoogleSheetWarningRow => {
  return (
    row.timestamp &&
    row.type &&
    row.title &&
    row.description &&
    row.location &&
    row.latitude &&
    row.longitude &&
    row.severity
  );
};

/**
 * Fetches warning data from a public Google Sheet
 * @param sheetId The ID of the Google Sheet
 * @param sheetName The name of the sheet tab
 * @returns Promise that resolves to an array of Warning objects
 */
export const fetchWarningsFromGoogleSheet = async (
  sheetId: string,
  sheetName: string = 'Sheet1'
): Promise<Warning[]> => {
  try {
    // Construct the URL for the Google Sheets API
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?alt=json&key=${import.meta.env.VITE_GOOGLE_SHEETS_API_KEY}`;
    
    const response = await axios.get(url);
    
    if (!response.data || !response.data.values) {
      console.error('Invalid response from Google Sheets API:', response.data);
      return [];
    }
    
    const rows = response.data.values;
    
    // The first row contains the headers
    const headers = rows[0];
    
    // Map the remaining rows to Warning objects
    const warnings: Warning[] = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      
      // Skip empty rows
      if (!row || row.length === 0) continue;
      
      // Convert the row to an object with keys from the headers
      const warningRow: Record<string, string> = {};
      
      for (let j = 0; j < headers.length && j < row.length; j++) {
        warningRow[headers[j].toLowerCase()] = row[j];
      }
      
      // Validate and convert the row to a Warning object
      if (isValidWarningRow(warningRow)) {
        warnings.push(convertRowToWarning(warningRow));
      } else {
        console.warn('Invalid warning row:', warningRow);
      }
    }
    
    return warnings;
  } catch (error) {
    console.error('Error fetching warnings from Google Sheet:', error);
    throw error;
  }
};

// Alternative method using the public CSV export
export const fetchWarningsFromGoogleSheetCSV = async (
  sheetId: string,
  sheetGid: string = '0'
): Promise<Warning[]> => {
  try {
    // Use the CSV export URL which doesn't require an API key
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${sheetGid}`;
    
    const response = await axios.get(url, {
      responseType: 'text'
    });
    
    // Parse CSV data
    const rows = response.data.split('\n').map((row: string) => {
      // Handle commas within quotes properly
      const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
      return row.split(regex).map((cell: string) => cell.replace(/^"|"$/g, '').trim());
    });
    
    // The first row contains the headers
    const headers = rows[0].map((header: string) => header.toLowerCase());
    
    // Map the remaining rows to Warning objects
    const warnings: Warning[] = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      
      // Skip empty rows
      if (!row || row.length === 0) continue;
      
      // Convert the row to an object with keys from the headers
      const warningRow: Record<string, string> = {};
      
      for (let j = 0; j < headers.length && j < row.length; j++) {
        warningRow[headers[j]] = row[j];
      }
      
      // Debug: Log the warning row to see what's coming from spreadsheet
      console.log('Processing row from spreadsheet:', warningRow);
      
      // Validate and convert the row to a Warning object
      if (isValidWarningRow(warningRow)) {
        warnings.push(convertRowToWarning(warningRow));
      } else {
        console.warn('Invalid warning row:', warningRow);
      }
    }
    
    console.log('Processed warnings from spreadsheet:', warnings);
    return warnings;
  } catch (error) {
    console.error('Error fetching warnings from Google Sheet CSV:', error);
    throw error;
  }
};
