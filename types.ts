
export type Language = 'cs-CZ' | 'en-US' | 'es-MX';

export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  duration: string;
  date: string;
  imageUrl: string;
  videoUrl?: string; // YouTube embed ID
  audioUrl?: string;
  platformLinks: {
    spotify: string;
    youtube: string;
    apple: string;
  };
  tags?: string[];
}

// Lead source types - includes campaign-specific sources for tracking
export type LeadSource = 
  | 'chatbot' 
  | 'contact_form' 
  | 'manual' 
  | 'newsletter' 
  | 'guest_popup'
  | 'youtube_description'
  | 'instagram_bio'
  | 'paid_social'
  | 'landing_youtube'
  | 'landing_instagram'
  | 'landing_social';

export type LeadStatus = 'new' | 'contacted' | 'converted' | 'archived';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  interest: string; // What are they interested in?
  source: LeadSource;
  notes?: string; // Internal admin notes
  tags?: string[]; // e.g. "VIP", "High Priority"
  date: string;
  lastUpdated?: string;
  status: LeadStatus;
  campaign?: string; // UTM campaign tracking
  userId?: string; // Link to authenticated user if converted
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  type?: 'text' | 'ui-form' | 'ui-pricing' | 'ui-card' | 'ui-notification';
  data?: any;
}

export interface Translation {
  nav_home: string;
  nav_episodes: string;
  nav_about: string;
  nav_contact: string;
  nav_crm: string;
  hero_title: string;
  hero_subtitle: string;
  hero_cta: string;
  hero_kicker: string;
  hero_spotify_btn: string;
  latest_episodes: string;
  search_placeholder: string;
  no_episodes_found: string;
  filter_all: string;
  listen_on: string;
  episode_about_title: string;
  episode_description_suffix: string;
  listen_button: string;
  contact_title: string;
  contact_subtitle: string;
  contact_info_title: string;
  contact_email: string;
  contact_phone: string;
  contact_instagram: string;
  contact_success_title: string;
  contact_success_msg: string;
  form_name: string;
  form_email: string;
  form_phone: string;
  form_message: string;
  form_submit: string;
  footer_desc: string;
  footer_menu: string;
  footer_contact: string;
  footer_location: string;
  footer_rights: string;
  chatbot_welcome: string;
  chatbot_starters: string[];
  crm_title: string;
  crm_leads: string;
  placeholder_loading: string;
  newsletter_title: string;
  newsletter_desc: string;
  newsletter_placeholder: string;
  newsletter_btn: string;
  newsletter_success: string;
  guest_modal_title: string;
  guest_modal_desc: string;
  guest_modal_btn: string;
  guest_modal_success: string;
  menu_profile: string;
  menu_sign_in: string;
  menu_sign_out: string;
  menu_language: string;
}
