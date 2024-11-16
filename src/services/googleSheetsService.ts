
import { Warning, WarningType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// This is a stub service that previously connected to Google Sheets
// It now returns empty data, and the app will fall back to sample data

// This function would previously fetch data from Google Sheets API
// Now it just returns an empty array
export const fetchWarningsFromGoogleSheetCSV = async (
  sheetId: string,
  sheetGid: string = '0'
): Promise<Warning[]> => {
  console.log('Google Sheets integration is disabled. Using sample data instead.');
  return [];
};

// The empty implementation ensures the app will fall back to sample data
export const fetchWarningsFromGoogleSheet = async (
  sheetId: string,
  sheetName: string = 'Sheet1'
): Promise<Warning[]> => {
  console.log('Google Sheets integration is disabled. Using sample data instead.');
  return [];
};
