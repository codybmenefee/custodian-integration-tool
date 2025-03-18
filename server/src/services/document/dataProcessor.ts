import fs from 'fs';
import path from 'path';
import { parse as csvParse } from 'csv-parse/sync';
import { parseStringPromise } from 'xml2js';

/**
 * Parse CSV file
 */
export const parseCsv = async (filePath: string): Promise<any[]> => {
  try {
    // Read file content
    const fileContent = await fs.promises.readFile(filePath, 'utf8');
    
    // Parse CSV to array of objects
    const records = csvParse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    
    return records;
  } catch (error: any) {
    console.error('CSV parsing error:', error);
    throw new Error(`Failed to parse CSV file: ${error.message}`);
  }
};

/**
 * Extract metadata from CSV file
 */
export const extractCsvMetadata = async (filePath: string): Promise<Record<string, any>> => {
  try {
    // Read file content
    const fileContent = await fs.promises.readFile(filePath, 'utf8');
    
    // Parse CSV to get headers and row count
    const records = csvParse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });
    
    // Extract column names from first record
    const columns = records.length > 0 ? Object.keys(records[0]) : [];
    
    return {
      rowCount: records.length,
      columns,
      sampleData: records.slice(0, 5), // First 5 rows as sample
    };
  } catch (error: any) {
    console.error('CSV metadata extraction error:', error);
    throw new Error(`Failed to extract metadata from CSV: ${error.message}`);
  }
};

/**
 * Parse JSON file
 */
export const parseJson = async (filePath: string): Promise<any> => {
  try {
    // Read file content
    const fileContent = await fs.promises.readFile(filePath, 'utf8');
    
    // Parse JSON
    const data = JSON.parse(fileContent);
    
    return data;
  } catch (error: any) {
    console.error('JSON parsing error:', error);
    throw new Error(`Failed to parse JSON file: ${error.message}`);
  }
};

/**
 * Extract metadata from JSON file
 */
export const extractJsonMetadata = async (filePath: string): Promise<Record<string, any>> => {
  try {
    // Read and parse JSON file
    const data = await parseJson(filePath);
    
    // Determine if it's an array or object
    const isArray = Array.isArray(data);
    
    // Extract metadata
    return {
      type: isArray ? 'array' : 'object',
      length: isArray ? data.length : Object.keys(data).length,
      keys: isArray && data.length > 0 ? Object.keys(data[0]) : Object.keys(data),
      sampleData: isArray ? data.slice(0, 5) : data, // First 5 items if array
    };
  } catch (error: any) {
    console.error('JSON metadata extraction error:', error);
    throw new Error(`Failed to extract metadata from JSON: ${error.message}`);
  }
};

/**
 * Parse XML file
 */
export const parseXml = async (filePath: string): Promise<any> => {
  try {
    // Read file content
    const fileContent = await fs.promises.readFile(filePath, 'utf8');
    
    // Parse XML to JS object
    const result = await parseStringPromise(fileContent, {
      explicitArray: false,
      normalizeTags: true,
    });
    
    return result;
  } catch (error: any) {
    console.error('XML parsing error:', error);
    throw new Error(`Failed to parse XML file: ${error.message}`);
  }
};

/**
 * Extract metadata from XML file
 */
export const extractXmlMetadata = async (filePath: string): Promise<Record<string, any>> => {
  try {
    // Parse XML file
    const data = await parseXml(filePath);
    
    // Get root element
    const rootKey = Object.keys(data)[0];
    
    // Extract metadata
    return {
      rootElement: rootKey,
      childElements: Object.keys(data[rootKey]),
      structure: JSON.stringify(data, null, 2).substring(0, 500) + '...', // First 500 chars of structure
    };
  } catch (error: any) {
    console.error('XML metadata extraction error:', error);
    throw new Error(`Failed to extract metadata from XML: ${error.message}`);
  }
}; 