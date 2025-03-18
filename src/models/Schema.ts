import mongoose, { Document, Schema } from 'mongoose';

// Interface for Schema document
export interface ISchema extends Document {
  name: string;
  description: string;
  version: string;
  fields: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    enumValues?: string[];
  }>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const SchemaSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
    },
    version: {
      type: String,
      required: true,
      default: '1.0.0',
    },
    fields: [
      {
        name: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
          enum: ['String', 'Number', 'Boolean', 'Date', 'ObjectId', 'Mixed', 'Array'],
        },
        required: {
          type: Boolean,
          default: false,
        },
        description: {
          type: String,
          required: false,
        },
        enumValues: {
          type: [String],
          required: false,
        },
      },
    ],
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export model
const SchemaModel = mongoose.model<ISchema>('Schema', SchemaSchema);

export default SchemaModel; 