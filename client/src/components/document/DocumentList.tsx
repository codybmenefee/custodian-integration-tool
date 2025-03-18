import React, { useState, useEffect } from 'react';
import { Document, DocumentType } from 'shared/src/types';

interface DocumentListProps {
  documents: Document[];
  onDocumentSelect: (document: Document) => void;
  onDocumentDelete: (documentId: string) => void;
  onDocumentPreview: (documentId: string) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onDocumentSelect,
  onDocumentDelete,
  onDocumentPreview,
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Get icon based on document type
  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case DocumentType.PDF:
        return (
          <svg
            className="w-8 h-8 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case DocumentType.CSV:
        return (
          <svg
            className="w-8 h-8 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z"
              clipRule="evenodd"
            />
          </svg>
        );
      case DocumentType.JSON:
      case DocumentType.XML:
        return (
          <svg
            className="w-8 h-8 text-blue-500"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v1H4v-1h1v-2H4v-1h16v1h-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-8 h-8 text-gray-500"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <h3 className="text-lg font-medium text-gray-700">Uploaded Documents</h3>
      </div>
      {documents.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p>No documents uploaded yet.</p>
          <p className="text-sm mt-2">Upload a document to get started.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedDocId === doc.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => {
                setSelectedDocId(doc.id);
                onDocumentSelect(doc);
              }}
            >
              <div className="flex-shrink-0">{getDocumentIcon(doc.type)}</div>
              <div className="ml-4 flex-1">
                <h4 className="text-sm font-medium text-gray-900">{doc.name}</h4>
                <p className="text-xs text-gray-500">
                  Uploaded on {formatDate(doc.uploadedAt)}
                </p>
              </div>
              <button
                className="ml-4 text-red-500 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onDocumentDelete(doc.id);
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DocumentList; 