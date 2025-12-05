import { supabase, isSupabaseConfigured } from './supabaseClient';
import { createAppError, logError, AppError } from './errorService';

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Seminar {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string | null;
  is_online: boolean;
  price: number;
  currency: string;
  max_attendees: number | null;
  image_url: string | null;
  is_published: boolean;
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

export const getPublishedCourses = async (): Promise<ServiceResult<Course[]>> => {
  return handleGuarded(async () => {
    const { data, error } = await (supabase as any)
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Course[];
  }, { action: 'getPublishedCourses' });
};

export const getPublishedSeminars = async (): Promise<ServiceResult<Seminar[]>> => {
  return handleGuarded(async () => {
    const { data, error } = await (supabase as any)
      .from('seminars')
      .select('*')
      .eq('is_published', true)
      .order('event_date', { ascending: true });

    if (error) throw error;
    return (data || []) as Seminar[];
  }, { action: 'getPublishedSeminars' });
};

// Admin helpers
export const getAllCourses = async (): Promise<ServiceResult<Course[]>> => {
  return handleGuarded(async () => {
    const { data, error } = await (supabase as any)
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Course[];
  }, { action: 'getAllCourses' });
};

export const updateCoursePublishStatus = async (id: string, isPublished: boolean): Promise<ServiceResult<null>> => {
  return handleGuarded(async () => {
    const { error } = await (supabase as any)
      .from('courses')
      .update({ is_published: isPublished })
      .eq('id', id);

    if (error) throw error;
    return null;
  }, { action: 'updateCoursePublishStatus', courseId: id, isPublished });
};

export const getAllSeminars = async (): Promise<ServiceResult<Seminar[]>> => {
  return handleGuarded(async () => {
    const { data, error } = await (supabase as any)
      .from('seminars')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) throw error;
    return (data || []) as Seminar[];
  }, { action: 'getAllSeminars' });
};

export const updateSeminarPublishStatus = async (id: string, isPublished: boolean): Promise<ServiceResult<null>> => {
  return handleGuarded(async () => {
    const { error } = await (supabase as any)
      .from('seminars')
      .update({ is_published: isPublished })
      .eq('id', id);

    if (error) throw error;
    return null;
  }, { action: 'updateSeminarPublishStatus', seminarId: id, isPublished });
};
