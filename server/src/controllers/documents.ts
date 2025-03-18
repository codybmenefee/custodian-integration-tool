import { Request, Response } from 'express';
import { DocumentModel } from '../models/Document';
import { saveFileToDisk, getDocumentTypeFromMimeType, deleteFileFromDisk } from '../utils/fileStorage';
import { processDocument, getDocumentPreview } from '../services/document/documentProcessor';

/**
 * Upload a document
 */
export const uploadDocument = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Save file to disk
    const { filePath, fileName } = await saveFileToDisk(req.file);

    // Get document type from mimetype
    const documentType = getDocumentTypeFromMimeType(req.file.mimetype);

    // Create document record in database
    const document = new DocumentModel({
      name: req.body.name || req.file.originalname,
      type: documentType,
      uploadedBy: req.user!.id,
      filePath,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      metadata: req.body.metadata ? JSON.parse(req.body.metadata) : {},
    });

    // Save document to database
    await document.save();

    // Process document in background (don't await)
    processDocument(document._id.toString()).catch(err => {
      console.error('Background document processing error:', err);
    });

    // Return document data
    return res.status(201).json({
      document: {
        id: document._id,
        name: document.name,
        type: document.type,
        uploadedBy: document.uploadedBy,
        uploadedAt: document.uploadedAt,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
        metadata: document.metadata,
      },
    });
  } catch (error) {
    console.error('Document upload error:', error);
    return res.status(500).json({ message: 'Failed to upload document' });
  }
};

/**
 * Get all documents for current user
 */
export const getUserDocuments = async (req: Request, res: Response) => {
  try {
    const documents = await DocumentModel.find({ uploadedBy: req.user!.id }).sort({ uploadedAt: -1 });

    return res.status(200).json({
      documents: documents.map((doc) => ({
        id: doc._id,
        name: doc.name,
        type: doc.type,
        uploadedBy: doc.uploadedBy,
        uploadedAt: doc.uploadedAt,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        metadata: doc.metadata,
      })),
    });
  } catch (error) {
    console.error('Get documents error:', error);
    return res.status(500).json({ message: 'Failed to retrieve documents' });
  }
};

/**
 * Get a document by ID
 */
export const getDocumentById = async (req: Request, res: Response) => {
  try {
    const document = await DocumentModel.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user has access to this document
    if (document.uploadedBy.toString() !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    return res.status(200).json({
      document: {
        id: document._id,
        name: document.name,
        type: document.type,
        uploadedBy: document.uploadedBy,
        uploadedAt: document.uploadedAt,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
        metadata: document.metadata,
      },
    });
  } catch (error) {
    console.error('Get document error:', error);
    return res.status(500).json({ message: 'Failed to retrieve document' });
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const document = await DocumentModel.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user has access to this document
    if (document.uploadedBy.toString() !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete file from disk
    await deleteFileFromDisk(document.filePath);

    // Delete document from database
    await document.deleteOne();

    return res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    return res.status(500).json({ message: 'Failed to delete document' });
  }
};

/**
 * Process a document
 */
export const processDocumentController = async (req: Request, res: Response) => {
  try {
    const documentId = req.params.id;
    
    // Check if document exists and user has access
    const document = await DocumentModel.findById(documentId);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    if (document.uploadedBy.toString() !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Process document
    await processDocument(documentId);
    
    // Get updated document
    const updatedDocument = await DocumentModel.findById(documentId);
    
    return res.status(200).json({
      document: {
        id: updatedDocument!._id,
        name: updatedDocument!.name,
        type: updatedDocument!.type,
        uploadedBy: updatedDocument!.uploadedBy,
        uploadedAt: updatedDocument!.uploadedAt,
        fileSize: updatedDocument!.fileSize,
        mimeType: updatedDocument!.mimeType,
        metadata: updatedDocument!.metadata,
      },
    });
  } catch (error) {
    console.error('Document processing error:', error);
    return res.status(500).json({ message: 'Failed to process document' });
  }
};

/**
 * Get a document preview
 */
export const getDocumentPreviewController = async (req: Request, res: Response) => {
  try {
    const documentId = req.params.id;
    
    // Check if document exists and user has access
    const document = await DocumentModel.findById(documentId);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    if (document.uploadedBy.toString() !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get document preview
    const preview = await getDocumentPreview(documentId);
    
    return res.status(200).json(preview);
  } catch (error) {
    console.error('Document preview error:', error);
    return res.status(500).json({ message: 'Failed to generate document preview' });
  }
}; 