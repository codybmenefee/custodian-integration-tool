import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';
import { Schema as ISchema, SchemaField, FieldType, ValidationRule } from 'shared/src/types';

// Extended interface for Mongoose Document - separate from shared Schema interface
export interface SchemaDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  version: string;
  fields: SchemaField[];
  createdBy: mongoose.Types.ObjectId;
  parentSchema?: mongoose.Types.ObjectId | null;
  isLatestVersion: boolean;
  versionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const validationRuleSchema = new MongooseSchema<ValidationRule>(
  {
    type: {
      type: String,
      required: true,
    },
    value: {
      type: MongooseSchema.Types.Mixed,
      required: true,
    },
  },
  { _id: false }
);

const schemaFieldSchema = new MongooseSchema<SchemaField>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(FieldType),
      required: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
    },
    validationRules: {
      type: [validationRuleSchema],
      default: [],
    },
  },
  { _id: false }
);

const schemaSchema = new MongooseSchema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    version: {
      type: String,
      required: true,
      default: '1.0.0',
    },
    fields: {
      type: [schemaFieldSchema],
      required: true,
      default: [],
    },
    createdBy: {
      type: MongooseSchema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // New fields for versioning
    parentSchema: {
      type: MongooseSchema.Types.ObjectId,
      ref: 'Schema',
      default: null,
    },
    isLatestVersion: {
      type: Boolean,
      default: true,
    },
    versionNotes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Create and export Schema model
export const SchemaModel = mongoose.model<SchemaDocument>('Schema', schemaSchema); 