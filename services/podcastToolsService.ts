import { supabase, isSupabaseConfigured } from './supabaseClient';
import { createAppError, logError, AppError } from './errorService';

export interface PodcastGuest {
  id: string;
  full_name: string;
  email: string | null;
  instagram_handle: string | null;
  notes: string | null;
  expertise: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface EpisodeResource {
  label: string;
  url: string;
}

export type EpisodePlanStatus = 'idea' | 'planned' | 'recorded' | 'published';

export interface EpisodePlan {
  id: string;
  title: string;
  status: EpisodePlanStatus;
  planned_date: string | null;
  recording_link: string | null;
  outline: string | null;
  resources: EpisodeResource[];
  guest_id: string | null;
  notes: string | null;
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

// Guests
export const getGuests = async (): Promise<ServiceResult<PodcastGuest[]>> => {
  return handleGuarded(async () => {
    const { data, error } = await (supabase as any)
      .from('podcast_guests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as PodcastGuest[];
  }, { action: 'getGuests' });
};

export const upsertGuest = async (guest: Partial<PodcastGuest>): Promise<ServiceResult<PodcastGuest>> => {
  return handleGuarded(async () => {
    const payload: any = { ...guest };
    delete payload.id;

    const { data, error } = await (supabase as any)
      .from('podcast_guests')
      .upsert(guest.id ? { id: guest.id, ...payload } : payload)
      .select('*')
      .single();

    if (error) throw error;
    return data as PodcastGuest;
  }, { action: 'upsertGuest', guestId: guest.id });
};

export const deleteGuest = async (id: string): Promise<ServiceResult<null>> => {
  return handleGuarded(async () => {
    const { error } = await (supabase as any)
      .from('podcast_guests')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return null;
  }, { action: 'deleteGuest', guestId: id });
};

// Episode plans
export const getEpisodePlans = async (): Promise<ServiceResult<EpisodePlan[]>> => {
  return handleGuarded(async () => {
    const { data, error } = await (supabase as any)
      .from('podcast_episode_plans')
      .select('*')
      .order('planned_date', { ascending: true });

    if (error) throw error;
    return (data || []).map((row: any) => ({
      ...row,
      resources: row.resources || [],
    })) as EpisodePlan[];
  }, { action: 'getEpisodePlans' });
};

export const upsertEpisodePlan = async (plan: Partial<EpisodePlan>): Promise<ServiceResult<EpisodePlan>> => {
  return handleGuarded(async () => {
    const payload: any = { ...plan };
    delete payload.id;

    const { data, error } = await (supabase as any)
      .from('podcast_episode_plans')
      .upsert(plan.id ? { id: plan.id, ...payload } : payload)
      .select('*')
      .single();

    if (error) throw error;
    return {
      ...data,
      resources: data.resources || [],
    } as EpisodePlan;
  }, { action: 'upsertEpisodePlan', planId: plan.id });
};

export const deleteEpisodePlan = async (id: string): Promise<ServiceResult<null>> => {
  return handleGuarded(async () => {
    const { error } = await (supabase as any)
      .from('podcast_episode_plans')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return null;
  }, { action: 'deleteEpisodePlan', planId: id });
};
