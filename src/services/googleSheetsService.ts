
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

// Convert a Google Sheet row to our Warning type
const convertRowToWarning = (row: GoogleSheetWarningRow): Warning => {
  return {
    id: uuidv4(), // Generate a unique ID for each warning
    timestamp: row.timestamp,
    type: row.type as WarningType,
    title: row.title,
    description: row.description,
    location: row.location,
    coordinates: {
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude)
    },
    severity: row.severity as Warning['severity']
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
      
      // Validate and convert the row to a Warning object
      if (isValidWarningRow(warningRow)) {
        warnings.push(convertRowToWarning(warningRow));
      }
    }
    
    return warnings;
  } catch (error) {
    console.error('Error fetching warnings from Google Sheet CSV:', error);
    throw error;
  }
};
