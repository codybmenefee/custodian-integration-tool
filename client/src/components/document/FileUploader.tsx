import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentType, Document } from 'shared/src/types';

interface FileUploaderProps {
  onUploadSuccess: (document: Document) => void;
  onUploadError: (error: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUploadSuccess, onUploadError }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Allowed file types
  const allowedFileTypes = {
    'application/pdf': DocumentType.PDF,
    'text/csv': DocumentType.CSV,
    'application/json': DocumentType.JSON,
    'application/xml': DocumentType.XML,
    'text/xml': DocumentType.XML,
  };

  // Handle file drop
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setFileName(file.name);

      // Validate file type
      if (!Object.keys(allowedFileTypes).includes(file.type)) {
        onUploadError(`Unsupported file type: ${file.type}`);
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        onUploadError('File size exceeds the 10MB limit');
        return;
      }

      try {
        setUploading(true);
        
        // Create form data for file upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name);

        // Upload file with progress tracking
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            onUploadSuccess(response.document);
          } else {
            onUploadError('Failed to upload file');
          }
          setUploading(false);
          setUploadProgress(0);
          setFileName('');
        });

        xhr.addEventListener('error', () => {
          onUploadError('Network error occurred during upload');
          setUploading(false);
          setUploadProgress(0);
        });

        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        xhr.open('POST', '/api/documents/upload');
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      } catch (error) {
        setUploading(false);
        setUploadProgress(0);
        onUploadError('Failed to upload file');
        console.error('Upload error:', error);
      }
    },
    [onUploadSuccess, onUploadError]
  );

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/xml': ['.xml', '.xsd'],
      'text/xml': ['.xml', '.xsd'],
    },
    multiple: false,
  });

  // Handle file selection via button
  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        
        {uploading ? (
          <div className="w-full">
            <p className="mb-2">Uploading {fileName}...</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="mt-2">{uploadProgress}%</p>
          </div>
        ) : (
          <div>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mt-4 text-sm text-gray-600">
              {isDragActive ? (
                <span>Drop the file here...</span>
              ) : (
                <span>
                  Drag and drop your file here, or{' '}
                  <button
                    type="button"
                    className="text-blue-500 hover:text-blue-700"
                    onClick={handleFileSelect}
                  >
                    browse
                  </button>
                </span>
              )}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Supported formats: PDF, CSV, JSON, XML (max 10MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader; 