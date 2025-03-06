import { comments, likes, posts, users, type User, type InsertUser, type Post, type InsertPost, type Comment, type InsertComment } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import session from "express-session";
import type { Store } from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createPost(authorId: number, post: InsertPost): Promise<Post>;
  getPosts(): Promise<(Post & { author: User })[]>;
  getUserPosts(userId: number): Promise<(Post & { author: User })[]>;
  likePost(userId: number, postId: number): Promise<void>;
  unlikePost(userId: number, postId: number): Promise<void>;
  getLikes(postId: number): Promise<number>;
  createComment(userId: number, comment: InsertComment): Promise<Comment>;
  getComments(postId: number): Promise<(Comment & { author: User })[]>;
  getBotUsers(): Promise<User[]>; // Added method signature
  sessionStore: Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createPost(authorId: number, insertPost: InsertPost): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values({ ...insertPost, authorId })
      .returning();
    return post;
  }

  async getPosts(): Promise<(Post & { author: User })[]> {
    return await db
      .select({
        id: posts.id,
        content: posts.content,
        authorId: posts.authorId,
        imageUrl: posts.imageUrl,
        createdAt: posts.createdAt,
        author: users,
      })
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .orderBy(desc(posts.createdAt));
  }

  async getUserPosts(userId: number): Promise<(Post & { author: User })[]> {
    return await db
      .select({
        id: posts.id,
        content: posts.content,
        authorId: posts.authorId,
        imageUrl: posts.imageUrl,
        createdAt: posts.createdAt,
        author: users,
      })
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.authorId, userId))
      .orderBy(desc(posts.createdAt));
  }

  async likePost(userId: number, postId: number): Promise<void> {
    await db.insert(likes).values({ userId, postId });
  }

  async unlikePost(userId: number, postId: number): Promise<void> {
    await db
      .delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
  }

  async getLikes(postId: number): Promise<number> {
    const result = await db
      .select({ count: db.sql<number>`count(*)` })
      .from(likes)
      .where(eq(likes.postId, postId));
    return Number(result[0].count);
  }

  async createComment(userId: number, insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values({ ...insertComment, userId })
      .returning();
    return comment;
  }

  async getComments(postId: number): Promise<(Comment & { author: User })[]> {
    return await db
      .select({
        id: comments.id,
        content: comments.content,
        userId: comments.userId,
        postId: comments.postId,
        createdAt: comments.createdAt,
        author: users,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));
  }

  async getBotUsers(): Promise<User[]> { // Added method
    return await db
      .select()
      .from(users)
      .where(eq(users.isBot, true));
  }
}

export const storage = new DatabaseStorage();