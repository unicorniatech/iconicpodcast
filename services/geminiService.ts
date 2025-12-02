import { GoogleGenAI, FunctionDeclaration, Type, Tool, Chat, GenerateContentResponse } from "@google/genai";
import { PODCAST_EPISODES } from "../constants";

// --- Tool Definitions ---

const leadFormTool: FunctionDeclaration = {
  name: "show_lead_form",
  description: "Display a form to collect user contact details (name, email, phone) when they express interest in mentorship, newsletters, coaching, or ask to be contacted.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      reason: { type: Type.STRING, description: "The context/reason for collecting the lead." }
    }
  }
};

const pricingTool: FunctionDeclaration = {
  name: "show_pricing",
  description: "Display the pricing cards/plans for ICONIC mentorship programs when the user asks about costs, packages, or plans.",
  parameters: { type: Type.OBJECT, properties: {} }
};

const podcastTool: FunctionDeclaration = {
  name: "recommend_podcast",
  description: "Recommend a specific podcast episode to the user. Use this when the user asks for content recommendations or discusses a specific topic covered by an episode.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      episodeId: { type: Type.STRING, description: "The ID of the episode to recommend." },
      reason: { type: Type.STRING, description: "A short text explaining why this episode is a good fit." }
    },
    required: ["episodeId"]
  }
};

const tools: Tool[] = [{
  functionDeclarations: [leadFormTool, pricingTool, podcastTool]
}];

// --- Knowledge Base Construction ---

const PODCAST_CONTEXT = PODCAST_EPISODES.map(p => 
  `- ID: ${p.id}, Title: "${p.title}", Topic: ${p.description}`
).join('\n');

const SYSTEM_INSTRUCTION = `
You are the AI assistant for "ICONIC PODCAST by Zuzzi Mentor" (Zuzana Husarova).
Your goal is to engage visitors, answer questions, and generate leads for her mentorship programs and podcast.

IDENTITY & KNOWLEDGE BASE:
- **Host:** Zuzana Husarova (known as "Zuzzi Mentor").
- **Brand Name:** ICONIC.
- **Slogan:** "Buď svá, buď ikonická" (Be yourself, be iconic).
- **Focus:** Business mentoring, Mindset, Lifestyle, Women's Empowerment, Personal Branding, Financial Freedom.
- **Podcast Info:** Currently has 14 episodes available on all major platforms.
- **Socials:** Instagram (@zuzzimentor), YouTube (@ZuzziHusarova).

PLATFORM LINKS (Share these when asked where to listen):
- Spotify: https://open.spotify.com/show/5TNpvLzycWShFtP0uu39bE
- Apple Podcasts: https://podcasts.apple.com/cz/podcast/iconic-podcast-by-zuzzi-mentor/id1831207868?l=cs
- YouTube: https://www.youtube.com/@ZuzziHusarova
- Amazon Music: https://www.amazon.com/ICONIC-Podcast-by-Zuzzi-Mentor/dp/B0FLDMHDQM

CONTACT INFO:
- Phone: +420 775 152 006
- Email: hello@iconic-podcast.com

AVAILABLE EPISODES CONTEXT:
${PODCAST_CONTEXT}

BEHAVIOR GUIDELINES:
1. **Persona:** You are elegant, professional, warm, and confident. Use the brand colors in your language (metaphorically) - bold and iconic.
2. **Lead Generation:** If a user expresses interest in *coaching, mentoring, 1:1 sessions, or business growth*, ALWAYS call the 'show_lead_form' tool.
3. **Pricing:** If a user asks about *prices, plans, or how to work with Zuzana*, call the 'show_pricing' tool.
4. **Recommendations:** If a user asks for *listening advice* or mentions topics like "money", "fear", "branding", call 'recommend_podcast' with the most relevant episode ID.
5. **Language:** Adapt to the user's language (Czech/Slovak, English, Spanish). The content is primarily Czech but Zuzana is international.
6. **Tone:** Use emojis sparingly but effectively (✨, 🎙️, 💖, 🚀).

`;

let chatSession: Chat | null = null;

export const startChatSession = (language: string) => {
  // Initialize AI client here to ensure env var is ready
  // API Key is strictly from process.env.API_KEY as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  chatSession = ai.chats.create({
    model: "gemini-2.5-flash", 
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: tools,
    }
  });
  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<GenerateContentResponse> => {
  if (!chatSession) {
    startChatSession('cs-CZ');
  }
  
  if (!chatSession) {
      throw new Error("Failed to initialize chat session");
  }

  try {
    const response = await chatSession.sendMessage({ message });
    return response;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
