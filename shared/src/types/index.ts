// User types
export interface User {
  id: string;
  email: string;
  name: string;
  password?: string; // Optional as we don't want to expose this in all contexts
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserRegistrationRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
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
  parentSchema?: string;
  isLatestVersion: boolean;
  versionNotes?: string;
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

// New interfaces for Schema versioning
export interface SchemaVersion {
  id: string;
  version: string;
  createdAt: Date;
  isLatestVersion: boolean;
  versionNotes?: string;
}

export interface SchemaComparison {
  added: SchemaField[];
  removed: SchemaField[];
  modified: {
    field: string;
    before: Partial<SchemaField>;
    after: Partial<SchemaField>;
  }[];
}

export interface SchemaExport {
  schema: Schema;
  metadata: {
    exportedAt: Date;
    exportedBy: string;
    version: string;
  };
} 