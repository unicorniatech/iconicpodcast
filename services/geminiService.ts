/**
 * Gemini Service
 * 
 * Client-side service that communicates with the backend API for Gemini chat.
 * The API key is never exposed to the frontend - all calls go through the backend.
 */

import { logError, createAppError, getErrorMessage, AppError } from './errorService';

// Types for chat functionality
export interface ChatSession {
  id: string;
  language: string;
}

export interface FunctionCall {
  name: string;
  args: Record<string, unknown>;
}

export interface ChatResponse {
  text: string;
  functionCalls?: FunctionCall[];
  error?: AppError;
}

// API endpoint - configure based on deployment
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Build podcast context from episodes data
export const buildPodcastContext = (episodes: Array<{ id: string; title: string; description: string }>) => {
  return episodes.map(p => 
    `- ID: ${p.id}, Title: "${p.title}", Topic: ${p.description}`
  ).join('\n');
};

/**
 * Create a new chat session
 * Returns a session object that should be stored in React state
 */
export const createChatSession = (language: string): ChatSession => {
  return {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    language
  };
};

/**
 * Send a message to the Gemini API through the backend
 */
export const sendMessage = async (
  session: ChatSession,
  message: string,
  podcastContext: string
): Promise<ChatResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: session.id,
        message,
        language: session.language,
        podcastContext
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      const appError = createAppError(new Error(data.error), 'GEMINI_ERROR');
      return {
        text: '',
        error: appError
      };
    }

    return {
      text: data.text || '',
      functionCalls: data.functionCalls
    };
  } catch (error) {
    const appError = createAppError(error, 'NETWORK_ERROR', { action: 'sendMessage' });
    logError(appError);
    return {
      text: '',
      error: appError
    };
  }
};

/**
 * Get user-friendly error message for chat errors
 */
export const getChatErrorMessage = (error: AppError, language: string): string => {
  return getErrorMessage(error.code, language);
};

// ============================================================================
// LEGACY API - For backward compatibility during migration
// These functions will be deprecated once the backend API is fully deployed
// ============================================================================

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

const buildSystemInstruction = (language: string) => `
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
5. **Language:** Respond in ${language === 'cs-CZ' ? 'Czech' : language === 'es-MX' ? 'Spanish' : 'English'}. Adapt to the user's language preference.
6. **Tone:** Use emojis sparingly but effectively (✨, 🎙️, 💖, 🚀).
`;

/**
 * Create a new chat session (returns Chat instance)
 * @deprecated Use createChatSession() and sendMessage() instead
 */
export const startChatSession = (language: string): Chat => {
  // API Key from environment - WARNING: This exposes the key in frontend bundle
  // In production, use the backend API instead
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || 
                 (typeof process !== 'undefined' && process.env?.API_KEY) || '';
  
  if (!apiKey) {
    console.warn('Gemini API key not configured. Chat functionality will not work.');
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  const chat = ai.chats.create({
    model: "gemini-2.5-flash", 
    config: {
      systemInstruction: buildSystemInstruction(language),
      tools: tools,
    }
  });
  
  return chat;
};

/**
 * Send message using a Chat instance
 * @deprecated Use sendMessage() with ChatSession instead
 */
export const sendMessageToGemini = async (
  chatOrMessage: Chat | string,
  messageText?: string
): Promise<GenerateContentResponse> => {
  let chat: Chat;
  let message: string;
  
  // Handle both old API (just message) and new API (chat + message)
  if (typeof chatOrMessage === 'string') {
    // Legacy: create a new session for each message (not recommended)
    chat = startChatSession('cs-CZ');
    message = chatOrMessage;
  } else {
    chat = chatOrMessage;
    message = messageText || '';
  }

  try {
    const response = await chat.sendMessage({ message });
    return response;
  } catch (error) {
    const appError = createAppError(error, 'GEMINI_ERROR', { action: 'sendMessageToGemini' });
    logError(appError);
    throw error;
  }
};

/**
 * Parse Gemini response to extract text and function calls
 */
export const parseGeminiResponse = (response: GenerateContentResponse): {
  text: string;
  functionCalls: FunctionCall[];
} => {
  let text = '';
  const functionCalls: FunctionCall[] = [];

  const candidates = response.candidates;
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

  return { text, functionCalls };
};
