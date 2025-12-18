import mongoose, { Document, Schema, Types } from "mongoose";

export interface ChatRoomDoc extends Document {
  matrixRoomId: string;
  type: 'direct' | 'group' | 'public';
  participants: Types.ObjectId[]; // User IDs
  name?: string; // For group chats or channels
  slug?: string; // Unique slug for system channels (e.g. 'attiki')
  region_code?: string; // Region code for system channels (e.g. 'ATT')
  topic?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ChatRoomSchema = new Schema<ChatRoomDoc>(
  {
    matrixRoomId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    type: {
      type: String,
      enum: ['direct', 'group', 'public'],
      required: true,
    },
    participants: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    name: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Allow null/undefined for non-system rooms
    },
    region_code: {
      type: String,
      trim: true,
    },
    topic: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ChatRoomDoc>("ChatRoom", ChatRoomSchema);
