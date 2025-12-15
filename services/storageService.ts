/**
 * Storage Service
 * 
 * Handles lead storage with Supabase as primary storage and localStorage as fallback.
 * In production, all data goes to Supabase. localStorage is used only for development demos.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';
import { logError, createAppError, AppError } from './errorService';
import type { LeadSource, LeadStatus } from '../types/database';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  interest: string;
  source: LeadSource;
  notes?: string;
  tags?: string[];
  date: string;
  lastUpdated?: string;
  status: LeadStatus;
  campaign?: string;
  userId?: string;
}

export interface LeadInput {
  name: string;
  email: string;
  phone?: string;
  interest: string;
  source: LeadSource;
  notes?: string;
  tags?: string[];
  campaign?: string;
}

const LEADS_KEY = 'iconic_leads';

// Helper to generate ID for localStorage fallback
const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * Save a new lead
 */
export const saveLead = async (leadData: LeadInput): Promise<{ data: Lead | null; error: AppError | null }> => {
  const now = new Date().toISOString();
  
  // Try Supabase first
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await (supabase as any)
        .from('leads')
        .insert({
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone || null,
          interest: leadData.interest,
          source: leadData.source,
          notes: leadData.notes || null,
          tags: leadData.tags || [],
          status: 'new',
          campaign: leadData.campaign || null,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from insert');
      }

      const lead: Lead = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        interest: data.interest,
        source: data.source as LeadSource,
        notes: data.notes || undefined,
        tags: data.tags || [],
        date: data.created_at,
        lastUpdated: data.updated_at,
        status: data.status as LeadStatus,
        campaign: data.campaign || undefined,
        userId: data.user_id || undefined
      };

      return { data: lead, error: null };
    } catch (error) {
      const appError = createAppError(error, 'SUPABASE_ERROR', { action: 'saveLead' });
      logError(appError);
      // If Supabase is configured, do not silently fall back to localStorage.
      // The CRM dashboard reads from Supabase, so a local fallback would make signups appear missing.
      return { data: null, error: appError };
    }
  }

  // Fallback to localStorage (development only)
  try {
    const leads = getLeadsFromLocalStorage();
    const newLead: Lead = {
      ...leadData,
      id: generateId(),
      date: now,
      lastUpdated: now,
      status: 'new',
      notes: leadData.notes || '',
      tags: leadData.tags || []
    };
    leads.unshift(newLead);
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    console.warn('Lead saved to localStorage (Supabase not configured)');
    return { data: newLead, error: null };
  } catch (error) {
    const appError = createAppError(error, 'UNKNOWN_ERROR', { action: 'saveLead', storage: 'localStorage' });
    logError(appError);
    return { data: null, error: appError };
  }
};

/**
 * Get all leads
 */
export const getLeads = async (): Promise<{ data: Lead[]; error: AppError | null }> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await (supabase as any)
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const leads: Lead[] = (data || []).map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone || undefined,
        interest: row.interest,
        source: row.source as LeadSource,
        notes: row.notes || undefined,
        tags: row.tags || [],
        date: row.created_at,
        lastUpdated: row.updated_at,
        status: row.status as LeadStatus,
        campaign: row.campaign || undefined,
        userId: row.user_id || undefined
      }));

      return { data: leads, error: null };
    } catch (error) {
      const appError = createAppError(error, 'SUPABASE_ERROR', { action: 'getLeads' });
      logError(appError);
      // Fall through to localStorage
    }
  }

  // Fallback to localStorage
  return { data: getLeadsFromLocalStorage(), error: null };
};

/**
 * Update a lead
 */
export const updateLead = async (
  id: string, 
  updates: Partial<Lead>
): Promise<{ data: Lead[] | null; error: AppError | null }> => {
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const { error } = await (supabase as any)
        .from('leads')
        .update({
          ...updates,
          updated_at: now
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Fetch updated list
      const { data: leads } = await getLeads();
      return { data: leads, error: null };
    } catch (error) {
      const appError = createAppError(error, 'SUPABASE_ERROR', { action: 'updateLead', leadId: id });
      logError(appError);
      // Fall through to localStorage
    }
  }

  // Fallback to localStorage
  try {
    const leads = getLeadsFromLocalStorage();
    const updatedLeads = leads.map(l => 
      l.id === id ? { ...l, ...updates, lastUpdated: now } : l
    );
    localStorage.setItem(LEADS_KEY, JSON.stringify(updatedLeads));
    return { data: updatedLeads, error: null };
  } catch (error) {
    const appError = createAppError(error, 'UNKNOWN_ERROR', { action: 'updateLead', storage: 'localStorage' });
    logError(appError);
    return { data: null, error: appError };
  }
};

/**
 * Delete a lead
 */
export const deleteLead = async (id: string): Promise<{ data: Lead[] | null; error: AppError | null }> => {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await (supabase as any)
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Fetch updated list
      const { data: leads } = await getLeads();
      return { data: leads, error: null };
    } catch (error) {
      const appError = createAppError(error, 'SUPABASE_ERROR', { action: 'deleteLead', leadId: id });
      logError(appError);
      // Fall through to localStorage
    }
  }

  // Fallback to localStorage
  try {
    const leads = getLeadsFromLocalStorage();
    const filteredLeads = leads.filter(l => l.id !== id);
    localStorage.setItem(LEADS_KEY, JSON.stringify(filteredLeads));
    return { data: filteredLeads, error: null };
  } catch (error) {
    const appError = createAppError(error, 'UNKNOWN_ERROR', { action: 'deleteLead', storage: 'localStorage' });
    logError(appError);
    return { data: null, error: appError };
  }
};

/**
 * Get leads by source (for CRM filtering)
 */
export const getLeadsBySource = async (source: LeadSource): Promise<{ data: Lead[]; error: AppError | null }> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await (supabase as any)
        .from('leads')
        .select('*')
        .eq('source', source)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const leads: Lead[] = (data || []).map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone || undefined,
        interest: row.interest,
        source: row.source as LeadSource,
        notes: row.notes || undefined,
        tags: row.tags || [],
        date: row.created_at,
        lastUpdated: row.updated_at,
        status: row.status as LeadStatus,
        campaign: row.campaign || undefined,
        userId: row.user_id || undefined
      }));

      return { data: leads, error: null };
    } catch (error) {
      const appError = createAppError(error, 'SUPABASE_ERROR', { action: 'getLeadsBySource', source });
      logError(appError);
    }
  }

  // Fallback to localStorage
  const leads = getLeadsFromLocalStorage().filter(l => l.source === source);
  return { data: leads, error: null };
};

/**
 * Link lead to authenticated user (when converting)
 */
export const linkLeadToUser = async (leadId: string, userId: string): Promise<{ error: AppError | null }> => {
  const { error } = await updateLead(leadId, { 
    userId, 
    status: 'converted' 
  });
  return { error };
};

// Helper function for localStorage operations
function getLeadsFromLocalStorage(): Lead[] {
  try {
    const data = localStorage.getItem(LEADS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Legacy synchronous API for backward compatibility (development only)
export const storageService = {
  saveLead: (leadData: Omit<Lead, 'id' | 'date' | 'status' | 'lastUpdated'>) => {
    const leads = getLeadsFromLocalStorage();
    const newLead: Lead = {
      ...leadData,
      id: generateId(),
      date: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      status: 'new',
      notes: leadData.notes || '',
      tags: leadData.tags || []
    };
    leads.unshift(newLead);
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    
    // Also try to save to Supabase asynchronously
    if (isSupabaseConfigured()) {
      saveLead(leadData as LeadInput).catch(console.error);
    }
    
    return newLead;
  },

  getLeads: (): Lead[] => {
    return getLeadsFromLocalStorage();
  },

  updateLead: (id: string, updates: Partial<Lead>) => {
    const leads = getLeadsFromLocalStorage();
    const updatedLeads = leads.map(l => 
      l.id === id ? { ...l, ...updates, lastUpdated: new Date().toISOString() } : l
    );
    localStorage.setItem(LEADS_KEY, JSON.stringify(updatedLeads));
    
    // Also try to update in Supabase asynchronously
    if (isSupabaseConfigured()) {
      updateLead(id, updates).catch(console.error);
    }
    
    return updatedLeads;
  },

  deleteLead: (id: string) => {
    const leads = getLeadsFromLocalStorage();
    const filteredLeads = leads.filter(l => l.id !== id);
    localStorage.setItem(LEADS_KEY, JSON.stringify(filteredLeads));
    
    // Also try to delete from Supabase asynchronously
    if (isSupabaseConfigured()) {
      deleteLead(id).catch(console.error);
    }
    
    return filteredLeads;
  }
};
