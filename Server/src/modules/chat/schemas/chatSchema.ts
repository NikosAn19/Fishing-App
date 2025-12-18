import { z } from "zod";

export const startDirectChatSchema = z.object({
  recipientId: z.string().min(1),
});

export const createChannelSchema = z.object({
  name: z.string().min(1).max(100),
  topic: z.string().optional(),
});

export const updateRoomSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  topic: z.string().optional(),
});

export const inviteUserSchema = z.object({
  userId: z.string().min(1),
});
