import express from 'express';
import * as schemaController from '../controllers/schema';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Create a new schema
router.post('/', schemaController.createSchema);

// Get all schemas
router.get('/', schemaController.listSchemas);

// Get a specific schema
router.get('/:id', schemaController.getSchema);

// Update a schema
router.put('/:id', schemaController.updateSchema);

// Delete a schema
router.delete('/:id', schemaController.deleteSchema);

// Create a new version of a schema
router.post('/:id/versions', schemaController.createSchemaVersion);

// List all versions of a schema by name
router.get('/versions/:name', schemaController.listSchemaVersions);

// Compare two schema versions
router.get('/compare', schemaController.compareSchemaVersions);

// Export a schema
router.get('/:id/export', schemaController.exportSchema);

// Import a schema
router.post('/import', schemaController.importSchema);

export default router; 