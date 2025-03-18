import mongoose, { Document, Schema } from 'mongoose';
import { Document as IDocument, DocumentType } from 'shared/src/types';

// Extended interface for Mongoose Document
export interface DocumentDocument extends Omit<IDocument, 'id'>, Document {
  filePath: string;
}

const documentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(DocumentType),
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
  },
  { timestamps: { createdAt: 'uploadedAt', updatedAt: 'updatedAt' } }
);

// Create and export Document model
export const DocumentModel = mongoose.model<DocumentDocument>('Document', documentSchema); 