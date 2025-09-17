import mongoose, { Schema, Document, Types } from "mongoose";

export interface PhotoRef {
  assetId?: Types.ObjectId | string;
  key: string;
  url: string;
  contentType?: string;
  size?: number;
}

export interface SpotRef {
  lat?: number;
  lon?: number;
  name?: string;
}

export interface CatchDoc extends Document {
  userId?: Types.ObjectId | string;
  species: string;
  weight?: number | null;
  length?: number | null;
  notes?: string;
  photo?: PhotoRef;
  spot?: SpotRef;
  capturedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const PhotoSchema = new Schema<PhotoRef>(
  {
    assetId: { type: Schema.Types.Mixed },
    key: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    contentType: { type: String },
    size: { type: Number },
  },
  { _id: false }
);

const SpotSchema = new Schema<SpotRef>(
  {
    lat: { type: Number, min: -90, max: 90 },
    lon: { type: Number, min: -180, max: 180 },
    name: { type: String, trim: true },
  },
  { _id: false }
);

const CatchSchema = new Schema<CatchDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    species: { type: String, required: true, trim: true },
    weight: { type: Number, min: 0, default: null },
    length: { type: Number, min: 0, default: null },
    notes: { type: String, trim: true },
    photo: { type: PhotoSchema },
    spot: { type: SpotSchema },
    capturedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

CatchSchema.index({ createdAt: -1 });
CatchSchema.index({ "spot.lat": 1, "spot.lon": 1 });

export default (mongoose.models.Catch as mongoose.Model<CatchDoc>) ||
  mongoose.model<CatchDoc>("Catch", CatchSchema);
