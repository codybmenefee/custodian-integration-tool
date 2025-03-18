import { DocumentType } from 'shared/src/types';
import { extractPdfMetadata } from './pdfProcessor';
import { 
  extractCsvMetadata, 
  extractJsonMetadata, 
  extractXmlMetadata 
} from './dataProcessor';

/**
 * Extract metadata from a document based on its type
 */
export const extractMetadata = async (
  filePath: string, 
  documentType: DocumentType
): Promise<Record<string, any>> => {
  try {
    switch (documentType) {
      case DocumentType.PDF:
        return await extractPdfMetadata(filePath);
      
      case DocumentType.CSV:
        return await extractCsvMetadata(filePath);
      
      case DocumentType.JSON:
        return await extractJsonMetadata(filePath);
      
      case DocumentType.XML:
        return await extractXmlMetadata(filePath);
      
      default:
        throw new Error(`Unsupported document type: ${documentType}`);
    }
  } catch (error: any) {
    console.error('Metadata extraction error:', error);
    throw new Error(`Failed to extract metadata: ${error.message}`);
  }
};

/**
 * Generate preview data for a document based on its type
 */
export const generatePreviewData = async (
  filePath: string, 
  documentType: DocumentType
): Promise<{ content: string; type: string }> => {
  try {
    switch (documentType) {
      case DocumentType.PDF: {
        const { extractTextFromPdf } = await import('./pdfProcessor');
        const text = await extractTextFromPdf(filePath);
        // Return first 1000 characters as preview
        return {
          content: text.substring(0, 1000),
          type: 'text'
        };
      }
      
      case DocumentType.CSV: {
        const { parseCsv } = await import('./dataProcessor');
        const data = await parseCsv(filePath);
        // Return first 10 rows as JSON
        return {
          content: JSON.stringify(data.slice(0, 10), null, 2),
          type: 'json'
        };
      }
      
      case DocumentType.JSON: {
        const { parseJson } = await import('./dataProcessor');
        const data = await parseJson(filePath);
        // Return formatted JSON
        return {
          content: JSON.stringify(data, null, 2),
          type: 'json'
        };
      }
      
      case DocumentType.XML: {
        const { parseXml } = await import('./dataProcessor');
        const data = await parseXml(filePath);
        // Return as JSON representation
        return {
          content: JSON.stringify(data, null, 2),
          type: 'json'
        };
      }
      
      default:
        throw new Error(`Unsupported document type: ${documentType}`);
    }
  } catch (error: any) {
    console.error('Preview generation error:', error);
    throw new Error(`Failed to generate preview: ${error.message}`);
  }
}; 