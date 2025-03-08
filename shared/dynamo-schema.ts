/*
// AWS DynamoDB schema definitions commented out to fix TypeScript errors
// This will be used when you're ready to migrate to AWS

import { z } from "zod";

// DynamoDB schema definitions
export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  password: z.string(),
  isBot: z.boolean().default(false),
  avatarUrl: z.string().optional(),
  bio: z.string().optional(),
});

export const PostSchema = z.object({
  id: z.string(),
  content: z.string(),
  authorId: z.string(),
  imageUrl: z.string().optional(),
  createdAt: z.string(), // ISO date string
});

export const LikeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  postId: z.string(),
});

export const CommentSchema = z.object({
  id: z.string(),
  content: z.string(),
  userId: z.string(),
  postId: z.string(),
  createdAt: z.string(), // ISO date string
});

export const insertUserSchema = UserSchema.omit({ id: true });
export const insertPostSchema = PostSchema.omit({ id: true, authorId: true, createdAt: true }).pick({
  content: true,
  imageUrl: true,
});
export const insertCommentSchema = CommentSchema.omit({ id: true, userId: true, createdAt: true }).pick({
  content: true,
  postId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type User = z.infer<typeof UserSchema>;
export type Post = z.infer<typeof PostSchema>;
export type Comment = z.infer<typeof CommentSchema>;
*/