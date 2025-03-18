import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { DocumentType } from 'shared/src/types';

// Upload directory path
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Get file extension from mimetype
 */
export const getExtensionFromMimeType = (mimeType: string): string => {
  const mimeTypeMap: Record<string, string> = {
    'application/pdf': '.pdf',
    'text/csv': '.csv',
    'application/json': '.json',
    'application/xml': '.xml',
    'text/xml': '.xml',
  };

  return mimeTypeMap[mimeType] || '.bin';
};

/**
 * Get document type from mimetype
 */
export const getDocumentTypeFromMimeType = (mimeType: string): DocumentType => {
  switch (mimeType) {
    case 'application/pdf':
      return DocumentType.PDF;
    case 'text/csv':
      return DocumentType.CSV;
    case 'application/json':
      return DocumentType.JSON;
    case 'application/xml':
    case 'text/xml':
      return DocumentType.XML;
    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
};

/**
 * Save file to disk
 */
export const saveFileToDisk = async (
  file: Express.Multer.File
): Promise<{ filePath: string; fileName: string }> => {
  // Generate unique filename
  const fileName = `${uuidv4()}${getExtensionFromMimeType(file.mimetype)}`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  // Create a write stream
  const writeStream = fs.createWriteStream(filePath);

  return new Promise((resolve, reject) => {
    // Write file buffer to disk
    writeStream.write(file.buffer);
    writeStream.end();

    writeStream.on('finish', () => {
      resolve({ filePath, fileName });
    });

    writeStream.on('error', (err) => {
      reject(err);
    });
  });
};

/**
 * Delete file from disk
 */
export const deleteFileFromDisk = async (filePath: string): Promise<void> => {
  if (fs.existsSync(filePath)) {
    await fs.promises.unlink(filePath);
  }
}; 