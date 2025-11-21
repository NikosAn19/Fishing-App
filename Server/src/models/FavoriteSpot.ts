import mongoose, { Schema, Document, Types } from "mongoose";

export interface FavoriteSpotDoc extends Document {
  userId: Types.ObjectId;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteSpotSchema = new Schema<FavoriteSpotDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
    address: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

FavoriteSpotSchema.index({ userId: 1, createdAt: -1 });

export default (mongoose.models
  .FavoriteSpot as mongoose.Model<FavoriteSpotDoc>) ||
  mongoose.model<FavoriteSpotDoc>("FavoriteSpot", FavoriteSpotSchema);
