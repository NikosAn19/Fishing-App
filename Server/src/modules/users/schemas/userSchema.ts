import { z } from "zod";

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

export const searchUsersSchema = z.object({
  query: z.string().min(1),
});

export const lookupUserSchema = z.object({
  matrixId: z.string().min(1),
});

export const pushTokenSchema = z.object({
  token: z.string().min(1),
});
