import { comments, likes, posts, type User, type InsertUser, type Post, type InsertPost, type Comment, type InsertComment } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private likes: Map<string, boolean>;
  private comments: Map<number, Comment>;
  currentId: { user: number; post: number; comment: number };
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.likes = new Map();
    this.comments = new Map();
    this.currentId = { user: 1, post: 1, comment: 1 };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.user++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createPost(authorId: number, insertPost: InsertPost): Promise<Post> {
    const id = this.currentId.post++;
    const post: Post = {
      ...insertPost,
      id,
      authorId,
      createdAt: new Date(),
    };
    this.posts.set(id, post);
    return post;
  }

  async getPosts(): Promise<(Post & { author: User })[]> {
    return Array.from(this.posts.values())
      .map((post) => ({
        ...post,
        author: this.users.get(post.authorId)!,
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUserPosts(userId: number): Promise<(Post & { author: User })[]> {
    return Array.from(this.posts.values())
      .filter((post) => post.authorId === userId)
      .map((post) => ({
        ...post,
        author: this.users.get(post.authorId)!,
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async likePost(userId: number, postId: number): Promise<void> {
    this.likes.set(`${userId}-${postId}`, true);
  }

  async unlikePost(userId: number, postId: number): Promise<void> {
    this.likes.delete(`${userId}-${postId}`);
  }

  async getLikes(postId: number): Promise<number> {
    return Array.from(this.likes.entries()).filter(([key]) =>
      key.endsWith(`-${postId}`),
    ).length;
  }

  async createComment(userId: number, insertComment: InsertComment): Promise<Comment> {
    const id = this.currentId.comment++;
    const comment: Comment = {
      ...insertComment,
      id,
      userId,
      createdAt: new Date(),
    };
    this.comments.set(id, comment);
    return comment;
  }

  async getComments(postId: number): Promise<(Comment & { author: User })[]> {
    return Array.from(this.comments.values())
      .filter((comment) => comment.postId === postId)
      .map((comment) => ({
        ...comment,
        author: this.users.get(comment.userId)!,
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage = new MemStorage();
