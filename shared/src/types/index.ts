// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

// Document types
export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  uploadedBy: string;
  uploadedAt: Date;
  metadata: Record<string, any>;
}

export enum DocumentType {
  PDF = 'pdf',
  CSV = 'csv',
  JSON = 'json',
  XML = 'xml',
}

// Schema types
export interface Schema {
  id: string;
  name: string;
  version: string;
  fields: SchemaField[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SchemaField {
  name: string;
  type: FieldType;
  required: boolean;
  description?: string;
  validationRules?: ValidationRule[];
}

export enum FieldType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  OBJECT = 'object',
  ARRAY = 'array',
}

export interface ValidationRule {
  type: string;
  value: any;
}

// Mapping types
export interface Mapping {
  id: string;
  name: string;
  sourceSchema: string;
  targetSchema: string;
  rules: MappingRule[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MappingRule {
  sourceField: string;
  targetField: string;
  transformation?: string;
  confidence?: number;
} 