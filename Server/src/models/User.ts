import mongoose, { Schema, Document, Types } from "mongoose";

export interface UserDoc extends Document {
  _id: Types.ObjectId;
  email?: string;
  passwordHash?: string;
  displayName?: string;
  avatarUrl?: string;
  googleId?: string;
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
  matrix?: {
    userId: string;
    password?: string; // Encrypted or plain for MVP
    deviceId?: string;
    isSynced: boolean;
  };
  pushToken?: string;
  friends: {
    user: Types.ObjectId;
    status: "pending" | "accepted" | "blocked";
    createdAt: Date;
  }[];
}

const UserSchema = new Schema<UserDoc>(
  {
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
    },
    displayName: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    refreshTokens: {
      type: [String],
      default: [],
    },
    matrix: {
      userId: { type: String },
      password: { type: String },
      deviceId: { type: String },
      isSynced: { type: Boolean, default: false },
    },
    pushToken: {
      type: String,
      sparse: true,
    },
    friends: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["pending", "accepted", "blocked"],
          default: "pending",
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ email: 1 }, { unique: true, sparse: true });
UserSchema.index({ googleId: 1 }, { unique: true, sparse: true });

const UserModel: mongoose.Model<UserDoc> =
  (mongoose.models.User as mongoose.Model<UserDoc>) ||
  mongoose.model<UserDoc>("User", UserSchema);

export default UserModel;
