import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Document } from 'shared/src/types';
import { Spinner, Alert, Card, CardBody, CardHeader } from '../../ui/chakra-adapter';

interface DocumentPreviewProps {
  documentId: string;
}

interface PreviewData {
  content: string;
  type: string;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ documentId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const response = await axios.get<PreviewData>(
          `/api/documents/${documentId}/preview`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        setPreviewData(response.data);
      } catch (err: Error | unknown) {
        console.error('Error fetching document preview:', err);
        setError(
          err instanceof Error 
            ? err.message 
            : 'Failed to load document preview'
        );
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      fetchPreview();
    }
  }, [documentId]);

  const renderContent = () => {
    if (!previewData) return null;

    switch (previewData.type) {
      case 'text':
        return (
          <pre className="bg-light p-3 rounded" style={{ whiteSpace: 'pre-wrap' }}>
            {previewData.content}
          </pre>
        );
      
      case 'json':
        return (
          <pre className="bg-light p-3 rounded" style={{ whiteSpace: 'pre-wrap' }}>
            {previewData.content}
          </pre>
        );
      
      default:
        return <p>Preview not available for this document type.</p>;
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>Document Preview</CardHeader>
      <CardBody>
        {loading && (
          <div className="text-center p-4">
            <Spinner color="primary" />
            <p className="mt-2">Loading preview...</p>
          </div>
        )}
        
        {error && !loading && (
          <Alert color="danger">{error}</Alert>
        )}
        
        {!loading && !error && previewData && (
          <div className="document-preview">
            {renderContent()}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default DocumentPreview; 