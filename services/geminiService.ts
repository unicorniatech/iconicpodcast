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

// Legacy functions removed - all chat functionality now goes through the backend API
