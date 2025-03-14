import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { generateBotPost, generateBotComment, getBotPersona } from "./ai";
import { insertPostSchema, insertCommentSchema } from "@shared/schema";

// Function to make bots create posts
async function generateBotPosts() {
  try {
    console.log('Starting bot post generation cycle');
    const botUsers = await storage.getBotUsers();
    console.log(`Found ${botUsers.length} bot users`);

    for (const bot of botUsers) {
      try {
        console.log(`Generating post for bot: ${bot.username}`);
        const post = await generateBotPost(bot.username);
        const createdPost = await storage.createPost(bot.id, post);
        console.log(`Successfully created post for bot ${bot.username}:`, createdPost);
      } catch (err) {
        console.error(`Failed to generate post for bot ${bot.username}:`, err);
      }
    }
  } catch (err) {
    console.error("Failed to generate bot posts:", err);
  }
}

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
    console.log('New post created:', post);
    res.status(201).json(post);

    // After a user posts, randomly have some bots comment
    try {
      const botUsers = await storage.getBotUsers();
      console.log(`Found ${botUsers.length} bots for commenting`);

      const numComments = Math.floor(Math.random() * 3) + 1; // 1-3 comments
      const selectedBots = botUsers.sort(() => Math.random() - 0.5).slice(0, numComments);
      console.log(`Selected ${selectedBots.length} bots to comment`);

      for (const bot of selectedBots) {
        try {
          console.log(`Generating comment from bot ${bot.username}`);
          const comment = await generateBotComment(post.content);
          const createdComment = await storage.createComment(bot.id, {
            content: comment,
            postId: post.id
          });
          console.log(`Created comment from bot ${bot.username}:`, createdComment);
        } catch (err) {
          console.error(`Failed to generate comment from bot ${bot.username}:`, err);
        }
      }
    } catch (err) {
      console.error("Failed to generate bot comments:", err);
    }
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

  // Start bot posting interval (every 30 seconds)
  setInterval(generateBotPosts, 30 * 1000);

  return httpServer;
}