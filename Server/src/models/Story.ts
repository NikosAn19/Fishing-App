import mongoose, { Schema, Document } from 'mongoose';

export interface IStory extends Document {
  user: mongoose.Types.ObjectId;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  duration: number; // in milliseconds
  createdAt: Date;
  expiresAt: Date;
  views: {
    user: mongoose.Types.ObjectId;
    viewedAt: Date;
  }[];
}

const StorySchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  mediaUrl: { type: String, required: true },
  mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
  duration: { type: Number, default: 5000 },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  views: [
    {
      user: { type: Schema.Types.ObjectId, ref: 'User' },
      viewedAt: { type: Date, default: Date.now }
    }
  ]
});

// TTL Index: Automatically delete documents after 'expiresAt' passes
StorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for feed queries (user + expiration)
StorySchema.index({ user: 1, expiresAt: 1 });

export default mongoose.model<IStory>('Story', StorySchema);
