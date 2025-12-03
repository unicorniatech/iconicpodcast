/**
 * Serverless API endpoint for Gemini chat
 * This file should be deployed to a serverless platform (Vercel, Netlify Functions, etc.)
 * The API key is read from server-side environment variables only
 */

import { GoogleGenAI, FunctionDeclaration, Type, Tool, Chat } from "@google/genai";

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

// Build system instruction with knowledge base context
const buildSystemInstruction = (podcastContext: string, language: string) => `
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
${podcastContext}

BEHAVIOR GUIDELINES:
1. **Persona:** You are elegant, professional, warm, and confident. Use the brand colors in your language (metaphorically) - bold and iconic.
2. **Lead Generation:** If a user expresses interest in *coaching, mentoring, 1:1 sessions, or business growth*, ALWAYS call the 'show_lead_form' tool.
3. **Pricing:** If a user asks about *prices, plans, or how to work with Zuzana*, call the 'show_pricing' tool.
4. **Recommendations:** If a user asks for *listening advice* or mentions topics like "money", "fear", "branding", call 'recommend_podcast' with the most relevant episode ID.
5. **Language:** Respond in ${language === 'cs-CZ' ? 'Czech' : language === 'es-MX' ? 'Spanish' : 'English'}. Adapt to the user's language preference.
6. **Tone:** Use emojis sparingly but effectively (✨, 🎙️, 💖, 🚀).
`;

// In-memory session store (for serverless, consider using Redis or similar)
const chatSessions = new Map<string, Chat>();

interface ChatRequest {
  sessionId: string;
  message: string;
  language: string;
  podcastContext: string;
}

interface ChatResponse {
  text: string;
  functionCalls?: Array<{
    name: string;
    args: Record<string, unknown>;
  }>;
  error?: string;
}

/**
 * Handler for chat API endpoint
 * In production, this would be deployed as a serverless function
 */
export async function handleChatRequest(request: ChatRequest): Promise<ChatResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return {
      text: '',
      error: 'API key not configured on server'
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    let chatSession = chatSessions.get(request.sessionId);
    
    if (!chatSession) {
      chatSession = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: buildSystemInstruction(request.podcastContext, request.language),
          tools: tools,
        }
      });
      chatSessions.set(request.sessionId, chatSession);
    }

    const response = await chatSession.sendMessage({ message: request.message });
    
    // Parse response using official @google/genai response shape
    const candidates = response.candidates;
    let text = '';
    const functionCalls: Array<{ name: string; args: Record<string, unknown> }> = [];

    if (candidates && candidates.length > 0) {
      const content = candidates[0].content;
      if (content && content.parts) {
        for (const part of content.parts) {
          if (part.text) {
            text += part.text;
          }
          if (part.functionCall) {
            functionCalls.push({
              name: part.functionCall.name,
              args: part.functionCall.args as Record<string, unknown>
            });
          }
        }
      }
    }

    return { text, functionCalls: functionCalls.length > 0 ? functionCalls : undefined };
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Map common errors to user-friendly messages
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return { text: '', error: 'RATE_LIMIT' };
    }
    if (errorMessage.includes('auth') || errorMessage.includes('401') || errorMessage.includes('403')) {
      return { text: '', error: 'AUTH_ERROR' };
    }
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return { text: '', error: 'NETWORK_ERROR' };
    }
    
    return { text: '', error: 'UNKNOWN_ERROR' };
  }
}

/**
 * Clear a chat session
 */
export function clearChatSession(sessionId: string): void {
  chatSessions.delete(sessionId);
}

// For Vercel/Netlify serverless deployment
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json() as ChatRequest;
    const result = await handleChatRequest(body);
    
    return new Response(JSON.stringify(result), {
      status: result.error ? 500 : 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
