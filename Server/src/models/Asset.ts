// src/models/Asset.ts
import mongoose, { Schema, Types } from "mongoose";

export interface AssetDoc {
  userId?: Types.ObjectId | null;
  bucket: string;
  key: string;                 // π.χ. original/anon/2025/09/uuid.png
  contentType: string;
  size: number;                // bytes
  width?: number | null;
  height?: number | null;
  exif?: Record<string, any>;
  variants?: {
    thumb?: { key: string; width: number; height: number; size?: number };
    medium?: { key: string; width: number; height: number; size?: number };
  };
  createdAt: Date;
  updatedAt: Date;
}

const AssetSchema = new Schema<AssetDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    bucket: { type: String, required: true, index: true },
    key: { type: String, required: true, unique: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    exif: { type: Schema.Types.Mixed, default: {} },
    variants: {
      thumb: {
        key: String,
        width: Number,
        height: Number,
        size: Number,
      },
      medium: {
        key: String,
        width: Number,
        height: Number,
        size: Number,
      },
    },
  },
  { timestamps: true }
);

AssetSchema.index({ createdAt: -1 });

const AssetModel =
  (mongoose.models.Asset as mongoose.Model<AssetDoc>) ||
  mongoose.model<AssetDoc>("Asset", AssetSchema);

export default AssetModel;
