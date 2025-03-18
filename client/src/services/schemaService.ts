import axios from 'axios';
import { Schema, SchemaField, SchemaComparison, SchemaExport } from 'shared/src/types';
import { getAuthToken } from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Get all schemas
 */
export const getSchemas = async (userId?: string): Promise<Schema[]> => {
  try {
    const token = getAuthToken();
    const params = userId ? { userId } : {};
    const response = await axios.get(`${API_URL}/schemas`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching schemas:', error);
    throw error;
  }
};

/**
 * Get a schema by ID
 */
export const getSchemaById = async (id: string): Promise<Schema> => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/schemas/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching schema:', error);
    throw error;
  }
};

/**
 * Create a new schema
 */
export const createSchema = async (
  name: string,
  fields: SchemaField[],
  version?: string
): Promise<Schema> => {
  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${API_URL}/schemas`,
      {
        name,
        fields,
        version,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating schema:', error);
    throw error;
  }
};

/**
 * Update an existing schema
 */
export const updateSchema = async (
  id: string,
  updates: Partial<Omit<Schema, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>>
): Promise<Schema> => {
  try {
    const token = getAuthToken();
    const response = await axios.put(`${API_URL}/schemas/${id}`, updates, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating schema:', error);
    throw error;
  }
};

/**
 * Delete a schema
 */
export const deleteSchema = async (id: string): Promise<void> => {
  try {
    const token = getAuthToken();
    await axios.delete(`${API_URL}/schemas/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Error deleting schema:', error);
    throw error;
  }
};

/**
 * Create a new version of a schema
 */
export const createSchemaVersion = async (
  id: string,
  version: string,
  fields?: SchemaField[],
  versionNotes?: string
): Promise<Schema> => {
  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${API_URL}/schemas/${id}/versions`,
      {
        version,
        fields,
        versionNotes,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating schema version:', error);
    throw error;
  }
};

/**
 * Get all versions of a schema by name
 */
export const getSchemaVersions = async (name: string): Promise<Schema[]> => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/schemas/versions/${name}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching schema versions:', error);
    throw error;
  }
};

/**
 * Compare two schema versions
 */
export const compareSchemaVersions = async (
  schemaId1: string,
  schemaId2: string
): Promise<SchemaComparison> => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/schemas/compare`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        schemaId1,
        schemaId2,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error comparing schema versions:', error);
    throw error;
  }
};

/**
 * Export a schema
 */
export const exportSchema = async (id: string): Promise<SchemaExport> => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/schemas/${id}/export`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting schema:', error);
    throw error;
  }
};

/**
 * Import a schema
 */
export const importSchema = async (schemaData: SchemaExport): Promise<Schema> => {
  try {
    const token = getAuthToken();
    const response = await axios.post(`${API_URL}/schemas/import`, schemaData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error importing schema:', error);
    throw error;
  }
}; 