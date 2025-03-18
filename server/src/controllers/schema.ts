import { Request, Response } from 'express';
import * as schemaService from '../services/schema';
import { Schema, SchemaField } from 'shared/src/types';

/**
 * Create a new schema
 */
export const createSchema = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, fields, version } = req.body;
    const userId = req.user?.id;

    if (!name || !fields || !userId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const schema = await schemaService.createSchema(name, fields, userId, version);
    res.status(201).json(schema);
  } catch (error) {
    console.error('Error creating schema:', error);
    res.status(500).json({ error: 'Failed to create schema' });
  }
};

/**
 * Get a schema by ID
 */
export const getSchema = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({ error: 'Schema ID is required' });
      return;
    }

    const schema = await schemaService.getSchemaById(id);
    
    if (!schema) {
      res.status(404).json({ error: 'Schema not found' });
      return;
    }

    res.status(200).json(schema);
  } catch (error) {
    console.error('Error getting schema:', error);
    res.status(500).json({ error: 'Failed to get schema' });
  }
};

/**
 * List all schemas
 */
export const listSchemas = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId as string;
    const schemas = await schemaService.listSchemas(userId);
    res.status(200).json(schemas);
  } catch (error) {
    console.error('Error listing schemas:', error);
    res.status(500).json({ error: 'Failed to list schemas' });
  }
};

/**
 * List all versions of a schema
 */
export const listSchemaVersions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.params;
    
    if (!name) {
      res.status(400).json({ error: 'Schema name is required' });
      return;
    }
    
    const versions = await schemaService.listSchemaVersions(name);
    res.status(200).json(versions);
  } catch (error) {
    console.error('Error listing schema versions:', error);
    res.status(500).json({ error: 'Failed to list schema versions' });
  }
};

/**
 * Update a schema
 */
export const updateSchema = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      res.status(400).json({ error: 'Schema ID is required' });
      return;
    }

    const schema = await schemaService.updateSchema(id, updates);
    
    if (!schema) {
      res.status(404).json({ error: 'Schema not found' });
      return;
    }

    res.status(200).json(schema);
  } catch (error) {
    console.error('Error updating schema:', error);
    res.status(500).json({ error: 'Failed to update schema' });
  }
};

/**
 * Delete a schema
 */
export const deleteSchema = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({ error: 'Schema ID is required' });
      return;
    }

    const success = await schemaService.deleteSchema(id);
    
    if (!success) {
      res.status(404).json({ error: 'Schema not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting schema:', error);
    res.status(500).json({ error: 'Failed to delete schema' });
  }
};

/**
 * Create a new version of a schema
 */
export const createSchemaVersion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { version, fields, versionNotes } = req.body;
    
    if (!id || !version) {
      res.status(400).json({ error: 'Schema ID and new version are required' });
      return;
    }

    const schema = await schemaService.createSchemaVersion(id, version, fields, versionNotes);
    
    if (!schema) {
      res.status(404).json({ error: 'Schema not found' });
      return;
    }

    res.status(201).json(schema);
  } catch (error) {
    console.error('Error creating schema version:', error);
    res.status(500).json({ error: 'Failed to create schema version' });
  }
};

/**
 * Compare two schema versions
 */
export const compareSchemaVersions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { schemaId1, schemaId2 } = req.query;
    
    if (!schemaId1 || !schemaId2) {
      res.status(400).json({ error: 'Two schema IDs are required for comparison' });
      return;
    }

    const comparison = await schemaService.compareSchemaVersions(
      schemaId1 as string,
      schemaId2 as string
    );
    
    if (!comparison) {
      res.status(404).json({ error: 'One or both schemas not found' });
      return;
    }

    res.status(200).json(comparison);
  } catch (error) {
    console.error('Error comparing schema versions:', error);
    res.status(500).json({ error: 'Failed to compare schema versions' });
  }
};

/**
 * Export a schema
 */
export const exportSchema = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!id || !userId) {
      res.status(400).json({ error: 'Schema ID is required' });
      return;
    }

    const exportData = await schemaService.exportSchema(id, userId);
    
    if (!exportData) {
      res.status(404).json({ error: 'Schema not found' });
      return;
    }

    res.status(200).json(exportData);
  } catch (error) {
    console.error('Error exporting schema:', error);
    res.status(500).json({ error: 'Failed to export schema' });
  }
};

/**
 * Import a schema
 */
export const importSchema = async (req: Request, res: Response): Promise<void> => {
  try {
    const schemaData = req.body;
    const userId = req.user?.id;
    
    if (!schemaData || !userId) {
      res.status(400).json({ error: 'Schema data is required' });
      return;
    }

    const schema = await schemaService.importSchema(schemaData, userId);
    res.status(201).json(schema);
  } catch (error: any) {
    console.error('Error importing schema:', error);
    res.status(400).json({ error: error.message || 'Failed to import schema' });
  }
}; 