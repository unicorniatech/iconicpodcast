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
 * Check if we're in development mode without API
 */
const isDevelopmentWithoutAPI = () => {
  return import.meta.env.DEV && !import.meta.env.VITE_API_URL;
};

/**
 * Development fallback responses when API is not available
 */
const getDevFallbackResponse = (message: string, language: string): ChatResponse => {
  const lowerMessage = message.toLowerCase();
  
  const responses: Record<string, Record<string, string>> = {
    'cs-CZ': {
      default: '🎙️ Ahoj! Jsem AI asistentka ICONIC podcastu. V produkčním prostředí ti pomohu s dotazy o podcastu, mentoringu a Zuzaně Husarové. Prozatím si můžeš prohlédnout naše epizody!',
      pricing: '💰 Informace o cenách najdeš na stránce kontakt nebo mi napiš v produkční verzi webu.',
      podcast: '🎧 Máme skvělé epizody! Podívej se na sekci Epizody a vyber si téma, které tě zajímá.',
      contact: '📧 Kontaktuj nás na hello@iconic-podcast.com nebo +420 775 152 006',
    },
    'en-US': {
      default: '🎙️ Hi! I\'m the ICONIC podcast AI assistant. In production, I\'ll help you with questions about the podcast, mentoring, and Zuzana Husarova. For now, check out our episodes!',
      pricing: '💰 You can find pricing information on the contact page or ask me in the production version.',
      podcast: '🎧 We have great episodes! Check out the Episodes section and pick a topic that interests you.',
      contact: '📧 Contact us at hello@iconic-podcast.com or +420 775 152 006',
    },
    'es-MX': {
      default: '🎙️ ¡Hola! Soy la asistente IA del podcast ICONIC. En producción, te ayudaré con preguntas sobre el podcast, mentoría y Zuzana Husarova. ¡Por ahora, mira nuestros episodios!',
      pricing: '💰 Puedes encontrar información de precios en la página de contacto o pregúntame en la versión de producción.',
      podcast: '🎧 ¡Tenemos episodios geniales! Mira la sección de Episodios y elige un tema que te interese.',
      contact: '📧 Contáctanos en hello@iconic-podcast.com o +420 775 152 006',
    }
  };

  const langResponses = responses[language] || responses['en-US'];
  
  let responseKey = 'default';
  if (lowerMessage.includes('cen') || lowerMessage.includes('price') || lowerMessage.includes('precio')) {
    responseKey = 'pricing';
  } else if (lowerMessage.includes('podcast') || lowerMessage.includes('epizod') || lowerMessage.includes('episode')) {
    responseKey = 'podcast';
  } else if (lowerMessage.includes('kontakt') || lowerMessage.includes('contact') || lowerMessage.includes('email')) {
    responseKey = 'contact';
  }

  return {
    text: langResponses[responseKey]
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
  // In development without API, return fallback responses
  if (isDevelopmentWithoutAPI()) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return getDevFallbackResponse(message, session.language);
  }

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

// Legacy functions removed - all chat functionality now goes through the backend API
