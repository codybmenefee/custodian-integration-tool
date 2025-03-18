import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import FileUploader from '../components/document/FileUploader';
import DocumentList from '../components/document/DocumentList';
import { getUserDocuments, deleteDocument } from '../services/documentService';
import { Document } from 'shared/src/types';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { useApiErrorHandler } from '../utils/errorHandling';

const DocumentsPage: NextPage = () => {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const handleApiError = useApiErrorHandler();

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Fetch documents from API
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const docs = await getUserDocuments();
      setDocuments(docs);
      setError(null);
    } catch (err) {
      setError('Failed to load documents. Please try again later.');
      handleApiError(err, 'Failed to load documents. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle successful upload
  const handleUploadSuccess = (document: Document) => {
    setSuccessMessage(`${document.name} uploaded successfully!`);
    // Add new document to the list
    setDocuments((prevDocuments) => [document, ...prevDocuments]);
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  // Handle upload error
  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
    
    // Clear error message after 5 seconds
    setTimeout(() => {
      setError(null);
    }, 5000);
  };

  // Navigate to document detail page
  const handleDocumentSelect = (document: Document) => {
    router.push(`/document/${document.id}`);
  };

  // Delete document
  const handleDocumentDelete = async (documentId: string) => {
    try {
      await deleteDocument(documentId);
      // Remove deleted document from the list
      setDocuments((prevDocuments) =>
        prevDocuments.filter((doc) => doc.id !== documentId)
      );
      setSuccessMessage('Document deleted successfully!');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      setError('Failed to delete document. Please try again later.');
      handleApiError(err, 'Failed to delete document. Please try again later.');
    }
  };

  return (
    <>
      <Head>
        <title>My Documents</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Documents</h1>
        
        {/* Display error or success message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}
        
        {/* File uploader with ErrorBoundary */}
        <ErrorBoundary
          errorHandler={(error) => handleApiError(error, 'An error occurred in the file uploader component')}
          onReset={fetchDocuments}
        >
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
            <FileUploader
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </div>
        </ErrorBoundary>
        
        {/* Document list with ErrorBoundary */}
        <ErrorBoundary
          errorHandler={(error) => handleApiError(error, 'An error occurred while displaying documents')}
          onReset={fetchDocuments}
        >
          <div>
            <h2 className="text-xl font-semibold mb-4">My Documents</h2>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <DocumentList
                documents={documents}
                onDocumentSelect={handleDocumentSelect}
                onDocumentDelete={handleDocumentDelete}
                onDocumentPreview={(documentId) => router.push(`/document/${documentId}`)}
              />
            )}
          </div>
        </ErrorBoundary>
      </div>
    </>
  );
};

export default DocumentsPage; 