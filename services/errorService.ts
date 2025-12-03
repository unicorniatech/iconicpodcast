/**
 * Central Error Handling Service
 * 
 * Provides consistent error logging and user-friendly error messages.
 * Can be extended to integrate with monitoring tools like Sentry.
 */

export type ErrorCode = 
  | 'NETWORK_ERROR'
  | 'AUTH_ERROR'
  | 'RATE_LIMIT'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'SUPABASE_ERROR'
  | 'GEMINI_ERROR'
  | 'UNKNOWN_ERROR';

export interface AppError {
  code: ErrorCode;
  message: string;
  originalError?: unknown;
  context?: Record<string, unknown>;
}

// User-friendly error messages by language
const ERROR_MESSAGES: Record<ErrorCode, Record<string, string>> = {
  NETWORK_ERROR: {
    'cs-CZ': 'Nepodařilo se připojit k serveru. Zkontrolujte připojení k internetu.',
    'en-US': 'Could not connect to the server. Please check your internet connection.',
    'es-MX': 'No se pudo conectar al servidor. Verifica tu conexión a internet.'
  },
  AUTH_ERROR: {
    'cs-CZ': 'Chyba ověření. Přihlaste se prosím znovu.',
    'en-US': 'Authentication error. Please sign in again.',
    'es-MX': 'Error de autenticación. Por favor, inicia sesión de nuevo.'
  },
  RATE_LIMIT: {
    'cs-CZ': 'Příliš mnoho požadavků. Zkuste to prosím za chvíli.',
    'en-US': 'Too many requests. Please try again in a moment.',
    'es-MX': 'Demasiadas solicitudes. Por favor, intenta de nuevo en un momento.'
  },
  VALIDATION_ERROR: {
    'cs-CZ': 'Neplatná data. Zkontrolujte prosím zadané údaje.',
    'en-US': 'Invalid data. Please check your input.',
    'es-MX': 'Datos inválidos. Por favor, verifica tu entrada.'
  },
  NOT_FOUND: {
    'cs-CZ': 'Požadovaný obsah nebyl nalezen.',
    'en-US': 'The requested content was not found.',
    'es-MX': 'El contenido solicitado no fue encontrado.'
  },
  PERMISSION_DENIED: {
    'cs-CZ': 'Nemáte oprávnění k této akci.',
    'en-US': 'You do not have permission for this action.',
    'es-MX': 'No tienes permiso para esta acción.'
  },
  SUPABASE_ERROR: {
    'cs-CZ': 'Chyba databáze. Zkuste to prosím později.',
    'en-US': 'Database error. Please try again later.',
    'es-MX': 'Error de base de datos. Por favor, intenta más tarde.'
  },
  GEMINI_ERROR: {
    'cs-CZ': 'AI asistent je momentálně nedostupný. Zkuste to prosím později.',
    'en-US': 'AI assistant is currently unavailable. Please try again later.',
    'es-MX': 'El asistente de IA no está disponible. Por favor, intenta más tarde.'
  },
  UNKNOWN_ERROR: {
    'cs-CZ': 'Došlo k neočekávané chybě. Zkuste to prosím znovu.',
    'en-US': 'An unexpected error occurred. Please try again.',
    'es-MX': 'Ocurrió un error inesperado. Por favor, intenta de nuevo.'
  }
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (code: ErrorCode, language: string = 'en-US'): string => {
  const messages = ERROR_MESSAGES[code];
  return messages[language] || messages['en-US'] || 'An error occurred';
};

/**
 * Log error to console and optionally to monitoring service
 * In production, this would send to Sentry, LogRocket, etc.
 */
export const logError = (
  error: AppError | Error | unknown,
  context?: Record<string, unknown>
): void => {
  const timestamp = new Date().toISOString();
  
  if (error instanceof Error) {
    console.error(`[${timestamp}] Error:`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context
    });
  } else if (typeof error === 'object' && error !== null && 'code' in error) {
    const appError = error as AppError;
    console.error(`[${timestamp}] AppError:`, {
      code: appError.code,
      message: appError.message,
      originalError: appError.originalError,
      context: { ...appError.context, ...context }
    });
  } else {
    console.error(`[${timestamp}] Unknown Error:`, error, context);
  }

  // TODO: In production, send to monitoring service
  // Example with Sentry:
  // if (typeof Sentry !== 'undefined') {
  //   Sentry.captureException(error, { extra: context });
  // }
};

/**
 * Create a standardized AppError from various error types
 */
export const createAppError = (
  error: unknown,
  defaultCode: ErrorCode = 'UNKNOWN_ERROR',
  context?: Record<string, unknown>
): AppError => {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return error as AppError;
  }

  const message = error instanceof Error ? error.message : String(error);
  
  // Try to determine error code from message
  let code: ErrorCode = defaultCode;
  if (message.includes('network') || message.includes('fetch') || message.includes('ECONNREFUSED')) {
    code = 'NETWORK_ERROR';
  } else if (message.includes('auth') || message.includes('401') || message.includes('403')) {
    code = 'AUTH_ERROR';
  } else if (message.includes('rate') || message.includes('429')) {
    code = 'RATE_LIMIT';
  } else if (message.includes('not found') || message.includes('404')) {
    code = 'NOT_FOUND';
  }

  return {
    code,
    message,
    originalError: error,
    context
  };
};

/**
 * Handle async operation with error handling
 */
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<{ data: T | null; error: AppError | null }> => {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    const appError = createAppError(error, 'UNKNOWN_ERROR', context);
    logError(appError);
    return { data: null, error: appError };
  }
};
