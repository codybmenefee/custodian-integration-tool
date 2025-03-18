import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

/**
 * Extract text from a PDF file
 */
export const extractTextFromPdf = async (filePath: string): Promise<string> => {
  try {
    // Read file buffer
    const dataBuffer = await fs.promises.readFile(filePath);
    
    // Parse PDF
    const data = await pdfParse(dataBuffer);
    
    // Return extracted text
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

/**
 * Extract metadata from a PDF file
 */
export const extractPdfMetadata = async (filePath: string): Promise<Record<string, any>> => {
  try {
    // Read file buffer
    const dataBuffer = await fs.promises.readFile(filePath);
    
    // Parse PDF
    const data = await pdfParse(dataBuffer);
    
    // Extract metadata
    const metadata: Record<string, any> = {
      pageCount: data.numpages,
      author: data.info?.Author || '',
      title: data.info?.Title || '',
      subject: data.info?.Subject || '',
      keywords: data.info?.Keywords || '',
      creator: data.info?.Creator || '',
      producer: data.info?.Producer || '',
      creationDate: data.info?.CreationDate,
      modificationDate: data.info?.ModDate,
    };
    
    return metadata;
  } catch (error) {
    console.error('PDF metadata extraction error:', error);
    throw new Error(`Failed to extract metadata from PDF: ${error.message}`);
  }
}; 