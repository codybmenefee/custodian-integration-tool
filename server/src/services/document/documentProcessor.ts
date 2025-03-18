import { DocumentModel } from '../../models/Document';
import { DocumentType } from 'shared/src/types';
import { extractMetadata, generatePreviewData } from './metadataExtractor';

/**
 * Process an uploaded document
 * - Extract metadata
 * - Update document record with extracted metadata
 */
export const processDocument = async (documentId: string): Promise<void> => {
  try {
    // Find document in database
    const document = await DocumentModel.findById(documentId);
    
    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }
    
    // Extract metadata from document
    const metadata = await extractMetadata(document.filePath, document.type as DocumentType);
    
    // Update document with extracted metadata
    document.metadata = {
      ...document.metadata,
      extracted: metadata,
      processedAt: new Date(),
    };
    
    // Save updated document
    await document.save();
  } catch (error: any) {
    console.error('Document processing error:', error);
    throw new Error(`Failed to process document: ${error.message}`);
  }
};

/**
 * Get a preview of a document
 */
export const getDocumentPreview = async (documentId: string): Promise<{ content: string; type: string }> => {
  try {
    // Find document in database
    const document = await DocumentModel.findById(documentId);
    
    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }
    
    // Generate preview data
    return await generatePreviewData(document.filePath, document.type as DocumentType);
  } catch (error: any) {
    console.error('Document preview error:', error);
    throw new Error(`Failed to generate document preview: ${error.message}`);
  }
}; 