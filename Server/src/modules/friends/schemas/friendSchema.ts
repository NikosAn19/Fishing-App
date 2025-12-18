import { z } from "zod";

export const friendRequestSchema = z.object({
  targetUserId: z.string().min(1),
});

export const acceptFriendRequestSchema = z.object({
  requesterId: z.string().min(1),
});

export const rejectFriendRequestSchema = z.object({
  requesterId: z.string().min(1),
});

export const pushTokenSchema = z.object({
  token: z.string().min(1),
});
