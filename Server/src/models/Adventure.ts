import mongoose, { Schema, Document, Types } from "mongoose";

export enum AdventureStatus {
  PLANNED = "planned",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface FishingDetails {
  technique?: string;
  lures?: string[];
  notes?: string;
}

export interface Equipment {
  name: string;
  type?: string;
  notes?: string;
}

export interface AdventureDoc extends Document {
  userId: Types.ObjectId;
  status: AdventureStatus;
  coordinates: Coordinates;
  locationName?: string;
  date: string; // YYYY-MM-DD format
  fishingDetails?: FishingDetails;
  participants?: Types.ObjectId[]; // Future: user IDs
  equipment?: Equipment[];
  catches?: Types.ObjectId[]; // Auto-linked catch IDs
  notes?: string; // Post-adventure notes
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

const CoordinatesSchema = new Schema<Coordinates>(
  {
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
  },
  { _id: false }
);

const FishingDetailsSchema = new Schema<FishingDetails>(
  {
    technique: { type: String, trim: true },
    lures: { type: [String], default: [] },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const EquipmentSchema = new Schema<Equipment>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const AdventureSchema = new Schema<AdventureDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(AdventureStatus),
      required: true,
      default: AdventureStatus.PLANNED,
      index: true,
    },
    coordinates: { type: CoordinatesSchema, required: true },
    locationName: { type: String, trim: true },
    date: { type: String, required: true }, // YYYY-MM-DD format
    fishingDetails: { type: FishingDetailsSchema },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    equipment: { type: [EquipmentSchema], default: [] },
    catches: [{ type: Schema.Types.ObjectId, ref: "Catch" }],
    notes: { type: String, trim: true },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

AdventureSchema.index({ userId: 1, status: 1 });
AdventureSchema.index({ userId: 1, date: -1 });
AdventureSchema.index({ date: -1 });

export default (mongoose.models.Adventure as mongoose.Model<AdventureDoc>) ||
  mongoose.model<AdventureDoc>("Adventure", AdventureSchema);

