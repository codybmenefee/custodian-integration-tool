import axios from 'axios';
import { Document } from 'shared/src/types';

// API base URL
const API_URL = '/api/documents';

// Setup axios instance with auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/**
 * Get all documents for current user
 */
export const getUserDocuments = async (): Promise<Document[]> => {
  try {
    const response = await axios.get(`${API_URL}`, getAuthHeader());
    return response.data.documents;
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
};

/**
 * Get document by ID
 */
export const getDocumentById = async (id: string): Promise<Document> => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
    return response.data.document;
  } catch (error) {
    console.error(`Error fetching document with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete document by ID
 */
export const deleteDocument = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  } catch (error) {
    console.error(`Error deleting document with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Upload a document using XMLHttpRequest to track progress
 * This is handled directly in the FileUploader component
 * to enable progress tracking
 */ 