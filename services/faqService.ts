import { supabase, isSupabaseConfigured } from './supabaseClient';
import { createAppError, logError, AppError } from './errorService';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  order_index: number;
  is_published: boolean;
  language: string;
  created_at: string;
  updated_at: string;
}

interface ServiceResult<T> {
  data: T | null;
  error: AppError | null;
}

const handleGuarded = async <T>(operation: () => Promise<T>, context: Record<string, unknown>): Promise<ServiceResult<T>> => {
  if (!isSupabaseConfigured()) {
    const appError = createAppError(
      new Error('Supabase is not configured'),
      'SUPABASE_NOT_CONFIGURED',
      context
    );
    logError(appError);
    return { data: null, error: appError };
  }

  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    const appError = createAppError(error, 'SUPABASE_ERROR', context);
    logError(appError);
    return { data: null, error: appError };
  }
};

export const getPublishedFaqs = async (language: string): Promise<ServiceResult<FAQItem[]>> => {
  return handleGuarded(async () => {
    const { data, error } = await (supabase as any)
      .from('faqs')
      .select('*')
      .eq('is_published', true)
      .eq('language', language)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return (data || []) as FAQItem[];
  }, { action: 'getPublishedFaqs', language });
};

export const getAllFaqs = async (): Promise<ServiceResult<FAQItem[]>> => {
  return handleGuarded(async () => {
    const { data, error } = await (supabase as any)
      .from('faqs')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw error;
    return (data || []) as FAQItem[];
  }, { action: 'getAllFaqs' });
};

export const updateFaqPublishStatus = async (id: string, isPublished: boolean): Promise<ServiceResult<null>> => {
  return handleGuarded(async () => {
    const { error } = await (supabase as any)
      .from('faqs')
      .update({ is_published: isPublished })
      .eq('id', id);

    if (error) throw error;
    return null;
  }, { action: 'updateFaqPublishStatus', faqId: id, isPublished });
};
