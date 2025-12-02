
import { Lead } from '../types';

const LEADS_KEY = 'iconic_leads';

export const storageService = {
  saveLead: (leadData: Omit<Lead, 'id' | 'date' | 'status' | 'lastUpdated'>) => {
    const leads = storageService.getLeads();
    const newLead: Lead = {
      ...leadData,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      status: 'new',
      notes: '',
      tags: []
    };
    leads.unshift(newLead); // Add to top
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    return newLead;
  },

  getLeads: (): Lead[] => {
    const data = localStorage.getItem(LEADS_KEY);
    return data ? JSON.parse(data) : [];
  },

  updateLead: (id: string, updates: Partial<Lead>) => {
    const leads = storageService.getLeads();
    const updatedLeads = leads.map(l => 
      l.id === id ? { ...l, ...updates, lastUpdated: new Date().toISOString() } : l
    );
    localStorage.setItem(LEADS_KEY, JSON.stringify(updatedLeads));
    return updatedLeads;
  },

  deleteLead: (id: string) => {
    const leads = storageService.getLeads();
    const filteredLeads = leads.filter(l => l.id !== id);
    localStorage.setItem(LEADS_KEY, JSON.stringify(filteredLeads));
    return filteredLeads;
  }
};
