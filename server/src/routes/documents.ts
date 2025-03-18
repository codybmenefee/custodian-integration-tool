import express from 'express';
import multer from 'multer';
import { 
  uploadDocument, 
  getUserDocuments, 
  getDocumentById, 
  deleteDocument,
  processDocumentController,
  getDocumentPreviewController
} from '../controllers/documents';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only supported file types
    const allowedMimeTypes = [
      'application/pdf',
      'text/csv',
      'application/json',
      'application/xml',
      'text/xml',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

// All document routes require authentication
router.use(authenticate);

// Upload a document
router.post('/upload', upload.single('file'), uploadDocument);

// Get all documents for current user
router.get('/', getUserDocuments);

// Get a document by ID
router.get('/:id', getDocumentById);

// Process a document
router.post('/:id/process', processDocumentController);

// Get document preview
router.get('/:id/preview', getDocumentPreviewController);

// Delete a document
router.delete('/:id', deleteDocument);

export default router; 