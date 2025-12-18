import { z } from "zod";

export const createStorySchema = z.object({
  mediaUrl: z.string().url(),
  mediaType: z.enum(['image', 'video']).default('image'),
  duration: z.number().optional().default(5000),
});
