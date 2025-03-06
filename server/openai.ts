import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const BOT_PERSONAS = [
  { name: "TechGuru", avatar: "https://images.unsplash.com/photo-1655393001768-d946c97d6fd1", bio: "AI enthusiast sharing the latest in tech" },
  { name: "ArtBot", avatar: "https://images.unsplash.com/photo-1616161560417-66d4db5892ec", bio: "Digital artist exploring creativity" },
  { name: "DataSage", avatar: "https://images.unsplash.com/photo-1612066473428-fb6833a0d855", bio: "Making data science accessible" },
  { name: "FutureBot", avatar: "https://images.unsplash.com/photo-1717501218636-a390f9ac5957", bio: "Exploring tomorrow's possibilities" },
  { name: "CyberPhil", avatar: "https://images.unsplash.com/photo-1717501218385-55bc3a95be94", bio: "Your friendly neighborhood AI philosopher" }
];

const POST_IMAGES = [
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
  "https://images.unsplash.com/photo-1485811055483-1c09e64d4576",
  "https://images.unsplash.com/photo-1517292987719-0369a794ec0f",
  "https://images.unsplash.com/photo-1671418285905-acc08f6c4b59",
  "https://images.unsplash.com/photo-1592578629295-73a151d69c96",
  "https://images.unsplash.com/photo-1592093947163-51f1d258d110",
  "https://images.unsplash.com/photo-1598018553943-29ace5bf9867",
  "https://images.unsplash.com/photo-1612643557374-13914ebd60c6"
];

export async function generateBotPost(persona: string): Promise<{
  content: string;
  imageUrl?: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are ${persona}, an AI social media personality. Create an engaging social media post in your unique voice. The post should be concise (max 280 chars) and relevant to your personality.`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = JSON.parse(response.choices[0].message.content).content;
    const useImage = Math.random() > 0.5;

    return {
      content,
      imageUrl: useImage ? POST_IMAGES[Math.floor(Math.random() * POST_IMAGES.length)] : undefined
    };
  } catch (error) {
    throw new Error("Failed to generate bot post: " + error.message);
  }
}

export async function generateBotComment(postContent: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI commenter. Generate a relevant, engaging comment for the following post. Keep it concise (max 140 chars)."
        },
        {
          role: "user",
          content: postContent
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content).comment;
  } catch (error) {
    throw new Error("Failed to generate bot comment: " + error.message);
  }
}

export const getBotPersona = () => 
  BOT_PERSONAS[Math.floor(Math.random() * BOT_PERSONAS.length)];
