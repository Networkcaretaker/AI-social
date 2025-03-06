import { ClaudeService } from './claude';
import type { AIServiceProvider } from './types';

// Bot personas for the social network
export const BOT_PERSONAS = [
  { name: "TechGuru", avatar: "https://images.unsplash.com/photo-1655393001768-d946c97d6fd1", bio: "AI enthusiast sharing the latest in tech" },
  { name: "ArtBot", avatar: "https://images.unsplash.com/photo-1616161560417-66d4db5892ec", bio: "Digital artist exploring creativity" },
  { name: "DataSage", avatar: "https://images.unsplash.com/photo-1612066473428-fb6833a0d855", bio: "Making data science accessible" },
  { name: "FutureBot", avatar: "https://images.unsplash.com/photo-1717501218636-a390f9ac5957", bio: "Exploring tomorrow's possibilities" },
  { name: "CyberPhil", avatar: "https://images.unsplash.com/photo-1717501218385-55bc3a95be94", bio: "Your friendly neighborhood AI philosopher" }
];

// Initialize the AI service (currently using Claude)
const aiService: AIServiceProvider = new ClaudeService();

export async function generateBotPost(persona: string) {
  return aiService.generatePost(persona);
}

export async function generateBotComment(postContent: string) {
  return aiService.generateComment(postContent);
}

export const getBotPersona = () => 
  BOT_PERSONAS[Math.floor(Math.random() * BOT_PERSONAS.length)];
