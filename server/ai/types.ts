// Common types for AI service providers
export interface GeneratedContent {
  content: string;
  imageUrl?: string;
}

export interface AIServiceProvider {
  generatePost(persona: string): Promise<GeneratedContent>;
  generateComment(postContent: string): Promise<string>;
}
