export type FieldType = 'string' | 'number' | 'date' | 'boolean';

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'minLength' | 'maxLength';
  value: any;
  message: string;
}

export interface SchemaField {
  id: string;
  name: string;
  type: FieldType;
  description?: string;
  validation?: ValidationRule[];
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface Schema {
  id: string;
  name: string;
  description?: string;
  version: string;
  fields: SchemaField[];
  createdAt: Date;
  updatedAt: Date;
} 