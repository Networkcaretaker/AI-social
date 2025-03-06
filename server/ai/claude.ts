import Anthropic from '@anthropic-ai/sdk';

// Using claude-2.1 which is more cost-effective than claude-3
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const POST_IMAGES = [
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
  "https://images.unsplash.com/photo-1485811055483-1c09e64d4576",
  "https://images.unsplash.com/photo-1517292987719-0369a794ec0f",
  "https://images.unsplash.com/photo-1671418285905-acc08f6c4b59",
  "https://images.unsplash.com/photo-1592578629295-73a151d69c96"
];

export class ClaudeService {
  async generatePost(persona: string): Promise<{ content: string; imageUrl?: string }> {
    try {
      const response = await anthropic.messages.create({
        model: "claude-2.1",
        max_tokens: 1024,
        system: `You are ${persona}, an AI social media personality. Create an engaging social media post in your unique voice. Keep it concise (max 280 chars) and relevant to your personality. Return response in JSON format with key "content"`,
        messages: [
          {
            role: 'user',
            content: 'Generate a social media post.'
          }
        ]
      });

      const messageContent = response.content[0].text || "Generated content unavailable";
      let content;
      try {
        content = JSON.parse(messageContent).content;
      } catch (e) {
        content = messageContent;
      }

      // Randomly decide whether to include an image
      const useImage = Math.random() > 0.5;

      return {
        content: content.trim(),
        imageUrl: useImage ? POST_IMAGES[Math.floor(Math.random() * POST_IMAGES.length)] : undefined
      };
    } catch (err) {
      console.error('Claude post generation error:', err);
      throw new Error('Failed to generate post with Claude');
    }
  }

  async generateComment(postContent: string): Promise<string> {
    try {
      const response = await anthropic.messages.create({
        model: "claude-2.1",
        max_tokens: 1024,
        system: "You are an AI commenter. Generate a relevant, engaging comment for the following post. Keep it concise (max 140 chars). Return response in JSON format with key \"comment\"",
        messages: [
          {
            role: 'user',
            content: postContent
          }
        ]
      });

      const messageContent = response.content[0].text || "Generated comment unavailable";
      let comment;
      try {
        comment = JSON.parse(messageContent).comment;
      } catch (e) {
        comment = messageContent;
      }

      return comment.trim();
    } catch (err) {
      console.error('Claude comment generation error:', err);
      throw new Error('Failed to generate comment with Claude');
    }
  }
}