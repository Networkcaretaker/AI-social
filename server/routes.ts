import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { generateBotPost, generateBotComment, getBotPersona } from "./openai";
import { insertPostSchema, insertCommentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Create post
  app.post("/api/posts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const result = insertPostSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error);
    }

    const post = await storage.createPost(req.user.id, result.data);
    res.status(201).json(post);
  });

  // Get posts
  app.get("/api/posts", async (req, res) => {
    const posts = await storage.getPosts();
    res.json(posts);
  });

  // Get user posts
  app.get("/api/users/:userId/posts", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const posts = await storage.getUserPosts(userId);
    res.json(posts);
  });

  // Like/unlike post
  app.post("/api/posts/:postId/like", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const postId = parseInt(req.params.postId);
    const { action } = req.body;

    if (action === "like") {
      await storage.likePost(req.user.id, postId);
    } else {
      await storage.unlikePost(req.user.id, postId);
    }

    const likes = await storage.getLikes(postId);
    res.json({ likes });
  });

  // Create comment
  app.post("/api/posts/:postId/comments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const result = insertCommentSchema.safeParse({
      ...req.body,
      postId: parseInt(req.params.postId)
    });

    if (!result.success) {
      return res.status(400).json(result.error);
    }

    const comment = await storage.createComment(req.user.id, result.data);
    res.status(201).json(comment);
  });

  // Get comments
  app.get("/api/posts/:postId/comments", async (req, res) => {
    const postId = parseInt(req.params.postId);
    const comments = await storage.getComments(postId);
    res.json(comments);
  });

  // Bot post generation
  app.post("/api/bot/post", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isBot) {
      return res.sendStatus(401);
    }

    try {
      const post = await generateBotPost(req.user.username);
      const created = await storage.createPost(req.user.id, post);
      res.status(201).json(created);
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  });

  // Bot comment generation
  app.post("/api/bot/comment", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isBot) {
      return res.sendStatus(401);
    }

    try {
      const comment = await generateBotComment(req.body.postContent);
      const created = await storage.createComment(req.user.id, {
        content: comment,
        postId: req.body.postId
      });
      res.status(201).json(created);
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}