import { SchemaModel, SchemaDocument } from '../../models/Schema';
import { Schema, SchemaField, ValidationRule, SchemaComparison, SchemaExport } from 'shared/src/types';
import { Types } from 'mongoose';

/**
 * Create a new schema
 */
export const createSchema = async (
  name: string,
  fields: SchemaField[],
  userId: string,
  version: string = '1.0.0'
): Promise<Schema> => {
  try {
    const schema = await SchemaModel.create({
      name,
      version,
      fields,
      createdBy: new Types.ObjectId(userId),
      isLatestVersion: true,
    });

    return convertToSchema(schema);
  } catch (error) {
    console.error('Error creating schema:', error);
    throw error;
  }
};

/**
 * Get a schema by ID
 */
export const getSchemaById = async (id: string): Promise<Schema | null> => {
  try {
    const schema = await SchemaModel.findById(id);
    if (!schema) return null;
    return convertToSchema(schema);
  } catch (error) {
    console.error('Error getting schema:', error);
    throw error;
  }
};

/**
 * List all schemas
 */
export const listSchemas = async (userId?: string): Promise<Schema[]> => {
  try {
    const query = userId ? { createdBy: new Types.ObjectId(userId) } : {};
    const schemas = await SchemaModel.find(query).sort({ updatedAt: -1 });
    return schemas.map(convertToSchema);
  } catch (error) {
    console.error('Error listing schemas:', error);
    throw error;
  }
};

/**
 * List all versions of a schema
 */
export const listSchemaVersions = async (baseName: string): Promise<Schema[]> => {
  try {
    const schemas = await SchemaModel.find({ name: baseName }).sort({ version: -1 });
    return schemas.map(convertToSchema);
  } catch (error) {
    console.error('Error listing schema versions:', error);
    throw error;
  }
};

/**
 * Update an existing schema
 */
export const updateSchema = async (
  id: string,
  updates: Partial<Omit<Schema, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>>
): Promise<Schema | null> => {
  try {
    const schema = await SchemaModel.findByIdAndUpdate(id, updates, { new: true });
    if (!schema) return null;
    return convertToSchema(schema);
  } catch (error) {
    console.error('Error updating schema:', error);
    throw error;
  }
};

/**
 * Delete a schema
 */
export const deleteSchema = async (id: string): Promise<boolean> => {
  try {
    const result = await SchemaModel.findByIdAndDelete(id);
    return !!result;
  } catch (error) {
    console.error('Error deleting schema:', error);
    throw error;
  }
};

/**
 * Create a new version of an existing schema
 */
export const createSchemaVersion = async (
  id: string,
  newVersion: string,
  fields?: SchemaField[],
  versionNotes?: string
): Promise<Schema | null> => {
  try {
    const existingSchema = await SchemaModel.findById(id);
    if (!existingSchema) return null;

    // Mark previous versions as not the latest
    if (existingSchema.isLatestVersion) {
      await SchemaModel.updateMany(
        { name: existingSchema.name, isLatestVersion: true },
        { isLatestVersion: false }
      );
    }

    const newSchema = new SchemaModel({
      name: existingSchema.name,
      version: newVersion,
      fields: fields || existingSchema.fields,
      createdBy: existingSchema.createdBy,
      parentSchema: existingSchema._id,
      isLatestVersion: true,
      versionNotes: versionNotes || `Version ${newVersion}`,
    });

    await newSchema.save();
    return convertToSchema(newSchema);
  } catch (error) {
    console.error('Error creating schema version:', error);
    throw error;
  }
};

/**
 * Compare two schema versions
 */
export const compareSchemaVersions = async (
  schemaId1: string,
  schemaId2: string
): Promise<SchemaComparison | null> => {
  try {
    const schema1 = await SchemaModel.findById(schemaId1);
    const schema2 = await SchemaModel.findById(schemaId2);

    if (!schema1 || !schema2) return null;

    const fields1 = schema1.fields;
    const fields2 = schema2.fields;

    // Find fields added in schema2 but not in schema1
    const added = fields2.filter(
      field2 => !fields1.some(field1 => field1.name === field2.name)
    );

    // Find fields removed from schema1 in schema2
    const removed = fields1.filter(
      field1 => !fields2.some(field2 => field2.name === field1.name)
    );

    // Find modified fields
    const modified = fields1
      .filter(field1 => fields2.some(field2 => field2.name === field1.name))
      .map(field1 => {
        const field2 = fields2.find(f => f.name === field1.name)!;
        const changes: { [key: string]: any } = {};

        // Compare field properties
        if (field1.type !== field2.type) changes.type = { before: field1.type, after: field2.type };
        if (field1.required !== field2.required)
          changes.required = { before: field1.required, after: field2.required };
        if (field1.description !== field2.description)
          changes.description = { before: field1.description, after: field2.description };

        // Compare validation rules
        const rules1 = JSON.stringify(field1.validationRules || []);
        const rules2 = JSON.stringify(field2.validationRules || []);
        if (rules1 !== rules2)
          changes.validationRules = {
            before: field1.validationRules || [],
            after: field2.validationRules || [],
          };

        if (Object.keys(changes).length === 0) return null;

        return {
          field: field1.name,
          before: Object.keys(changes).reduce(
            (obj, key) => ({ ...obj, [key]: changes[key].before }),
            {}
          ),
          after: Object.keys(changes).reduce(
            (obj, key) => ({ ...obj, [key]: changes[key].after }),
            {}
          ),
        };
      })
      .filter(Boolean) as SchemaComparison['modified'];

    return {
      added,
      removed,
      modified,
    };
  } catch (error) {
    console.error('Error comparing schema versions:', error);
    throw error;
  }
};

/**
 * Export schema as JSON
 */
export const exportSchema = async (id: string, userId: string): Promise<SchemaExport | null> => {
  try {
    const schema = await SchemaModel.findById(id);
    if (!schema) return null;

    return {
      schema: convertToSchema(schema),
      metadata: {
        exportedAt: new Date(),
        exportedBy: userId,
        version: schema.version,
      },
    };
  } catch (error) {
    console.error('Error exporting schema:', error);
    throw error;
  }
};

/**
 * Import schema from JSON
 */
export const importSchema = async (
  schemaData: SchemaExport,
  userId: string
): Promise<Schema | null> => {
  try {
    // Validate the imported schema
    if (!schemaData.schema || !validateSchema(schemaData.schema)) {
      throw new Error('Invalid schema format');
    }

    // Check if a schema with the same name exists
    const existingSchemas = await SchemaModel.find({ name: schemaData.schema.name });
    
    let version = schemaData.schema.version;
    const isLatestVersion = true;
    
    // If schema with same name exists, mark others as not latest
    if (existingSchemas.length > 0) {
      // Generate a new version if the same version already exists
      const versions = existingSchemas.map(s => s.version);
      if (versions.includes(version)) {
        const highestVersion = versions
          .map(v => {
            const parts = v.split('.');
            return parseInt(parts[0]) * 1000000 + parseInt(parts[1]) * 1000 + parseInt(parts[2]);
          })
          .sort((a, b) => b - a)[0];
        
        const major = Math.floor(highestVersion / 1000000);
        const minor = Math.floor((highestVersion % 1000000) / 1000);
        const patch = (highestVersion % 1000) + 1;
        
        version = `${major}.${minor}.${patch}`;
      }
      
      // Mark previous versions as not latest
      await SchemaModel.updateMany(
        { name: schemaData.schema.name, isLatestVersion: true },
        { isLatestVersion: false }
      );
    }

    // Create new schema
    const newSchema = new SchemaModel({
      name: schemaData.schema.name,
      version: version,
      fields: schemaData.schema.fields,
      createdBy: new Types.ObjectId(userId),
      isLatestVersion: isLatestVersion,
      versionNotes: `Imported from external source (${schemaData.metadata?.exportedAt || new Date()})`,
    });

    await newSchema.save();
    return convertToSchema(newSchema);
  } catch (error) {
    console.error('Error importing schema:', error);
    throw error;
  }
};

/**
 * Compare schemas for import validation
 */
const validateSchema = (schema: Partial<Schema>): boolean => {
  // Basic validation checks
  if (!schema.name || !schema.version || !Array.isArray(schema.fields)) {
    return false;
  }
  
  // Check that all fields have required properties
  return schema.fields.every(field => 
    field.name && 
    field.type && 
    typeof field.required === 'boolean'
  );
};

/**
 * Convert Mongoose document to Schema interface
 */
const convertToSchema = (doc: SchemaDocument): Schema => {
  const schema: Schema = {
    id: doc._id.toString(),
    name: doc.name,
    version: doc.version,
    fields: doc.fields,
    createdBy: doc.createdBy.toString(),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    isLatestVersion: doc.isLatestVersion,
  };

  // Add optional fields if they exist
  if (doc.parentSchema) {
    schema.parentSchema = doc.parentSchema.toString();
  }
  
  if (doc.versionNotes) {
    schema.versionNotes = doc.versionNotes;
  }
  
  return schema;
}; 